#!/usr/bin/env bash
# =============================================================================
# Audit qualité Cantou — industrialise les analyses de l'audit 11/07.
# Enchaîne : couverture TU (Vitest), Trivy (fs), Lighthouse (mobile) et
# SonarQube (conteneurisé). Chaque étape est indépendante et non bloquante :
# une étape indisponible (outil absent, daemon Docker éteint) est signalée
# et sautée, pas fatale. Sorties dans build/quality/.
#
# Usage :
#   scripts/quality-audit.sh                 # tout ce qui est disponible
#   scripts/quality-audit.sh --no-sonar      # sans SonarQube (pas de Docker)
#   scripts/quality-audit.sh --only lighthouse
# =============================================================================
set -uo pipefail
cd "$(dirname "$0")/.."
OUT="build/quality"; mkdir -p "$OUT"
ONLY=""; NO_SONAR=0
while [ $# -gt 0 ]; do case "$1" in
  --no-sonar) NO_SONAR=1 ;; --only) ONLY="$2"; shift ;; *) echo "arg inconnu: $1" ;;
esac; shift; done
run() { [ -z "$ONLY" ] || [ "$ONLY" = "$1" ]; }
section() { printf '\n\033[1m== %s ==\033[0m\n' "$1"; }

# ── 1. Couverture unitaire ───────────────────────────────────────────────────
if run coverage; then
  section "Couverture unitaire (Vitest v8)"
  npm run test:coverage 2>&1 | tail -30 | tee "$OUT/coverage.txt" || echo "⚠️  couverture KO"
fi

# ── 2. Sécurité (Trivy) ──────────────────────────────────────────────────────
if run trivy; then
  section "Sécurité — Trivy fs (vuln + secret + misconfig)"
  if command -v trivy >/dev/null 2>&1; then
    trivy fs --scanners vuln,secret,misconfig --severity HIGH,CRITICAL --quiet . \
      2>/dev/null | tee "$OUT/trivy.txt"
  else echo "⚠️  trivy absent — brew install trivy"; fi
fi

# ── 3. Lighthouse (mobile) ───────────────────────────────────────────────────
if run lighthouse; then
  section "Lighthouse — Perf / A11y / Best-practices / SEO"
  CHROME_PATH="${CHROME_PATH:-$(find "$HOME/Library/Caches/ms-playwright" -path '*chrome-mac*/Chromium' 2>/dev/null | head -1)}"
  if [ -n "$CHROME_PATH" ] && [ -x "$CHROME_PATH" ]; then
    npm run build >/dev/null 2>&1
    npx vite preview --port 4173 >/dev/null 2>&1 & PREV=$!
    sleep 3
    CHROME_PATH="$CHROME_PATH" npx --no-install lighthouse http://localhost:4173/ \
      --quiet --output=json --output-path="$OUT/lighthouse.json" \
      --only-categories=performance,accessibility,best-practices,seo \
      --chrome-flags="--headless=new --no-sandbox" 2>/dev/null \
      && node -e "const r=require('./$OUT/lighthouse.json');for(const[k,v]of Object.entries(r.categories))console.log(k.padEnd(16),Math.round(v.score*100))" \
      || echo "⚠️  lighthouse KO"
    kill $PREV 2>/dev/null
  else echo "⚠️  Chromium introuvable (npx playwright install chromium)"; fi
fi

# ── 4. SonarQube (conteneurisé) ──────────────────────────────────────────────
if run sonar && [ "$NO_SONAR" = 0 ]; then
  section "SonarQube (serveur conteneurisé)"
  if ! docker info >/dev/null 2>&1; then
    echo "⚠️  daemon Docker injoignable — démarrer Colima (voir CLAUDE.md) ou --no-sonar"
  elif [ -z "${SONAR_TOKEN:-}" ] || [ -z "${SONAR_HOST_URL:-}" ]; then
    echo "ℹ️  Définir SONAR_HOST_URL et SONAR_TOKEN (serveur SonarQube + token) puis :"
    echo "    docker run --rm -e SONAR_HOST_URL -e SONAR_TOKEN -v \"\$PWD\":/usr/src sonarsource/sonar-scanner-cli"
    echo "    (sonar-project.properties est déjà versionné)"
  else
    docker run --rm -e SONAR_HOST_URL -e SONAR_TOKEN -v "$PWD":/usr/src \
      sonarsource/sonar-scanner-cli 2>&1 | grep -iE "ANALYSIS SUCCESS|EXECUTION" \
      || echo "⚠️  scan Sonar KO"
  fi
fi

section "Terminé — rapports dans $OUT/"
