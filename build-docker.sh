#!/bin/bash
# Usage:
#   ./build-docker.sh            — build seul
#   ./build-docker.sh --deploy   — build + envoi Telegram
#   DEPLOY=1 ./build-docker.sh   — idem via variable d'env
set -e
export DOCKER_HOST="unix://$HOME/.colima/cantou/docker.sock"
export DOCKER_BUILDKIT=0
cd "$(dirname "$0")"

# ── Flags ───────────────────────────────────────────────────────────────────
DEPLOY=0
for arg in "$@"; do
  [ "$arg" = "--deploy" ] && DEPLOY=1
done
[ "${DEPLOY_TELEGRAM:-0}" = "1" ] && DEPLOY=1

# ── Alerte Telegram en cas d'échec ───────────────────────────────────────────
# En mode --deploy, un build qui casse (Docker, Gradle, signature…) ne remontait
# nulle part — le hook Git Flow le lance en arrière-plan. Ce trap notifie l'échec
# sur le même canal Telegram, avec la phase et le code de sortie.
PHASE="init"
on_exit() {
  code=$?
  if [ "$DEPLOY" = "1" ] && [ "$code" -ne 0 ]; then
    bash scripts/deploy-telegram.sh --message \
      "❌ *Build Cantou échoué* — build n°${BUILD_NUMBER:-?} (\`${VERSION_NAME:-?}\`)
Phase : *${PHASE}* · code ${code}
$(date '+%Y-%m-%d %H:%M')" 2>/dev/null || true
  fi
}
trap on_exit EXIT

# ── Chrono (mesure du temps total de build) ──────────────────────────────────
SECONDS=0

# ── Numéro de build (auto-incrémenté) ────────────────────────────────────────
BUILD_FILE="build.number"
BUILD_NUMBER=$(( $(cat "$BUILD_FILE" 2>/dev/null || echo 0) + 1 ))
echo "$BUILD_NUMBER" > "$BUILD_FILE"

# ── Métadonnées ──────────────────────────────────────────────────────────────
BUILD_TIMESTAMP=$(date '+%Y%m%d-%H%M')
BUILD_DATE=$(date '+%Y-%m-%d %H:%M')
APP_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0")
VERSION_NAME="${APP_VERSION}-build${BUILD_NUMBER}"
APK_NAME="cantou-v${APP_VERSION}-build${BUILD_NUMBER}-${BUILD_TIMESTAMP}.apk"

echo "────────────────────────────────────────────"
echo "  Cantou APK Builder"
echo "  Version  : ${VERSION_NAME}"
echo "  Build N° : ${BUILD_NUMBER}"
echo "  Date     : ${BUILD_DATE}"
echo "────────────────────────────────────────────"

# ── [0/5] Hygiène disque ─────────────────────────────────────────────────────
# Chaque build re-tague cantou-builder:amd64 → l'ancienne image devient dangling.
# Sans nettoyage, l'accumulation sature la VM Colima (« no space left on device »).
# Prune non fatal des images danglings + conteneurs arrêtés (jamais les images
# nommées). Voir l'incident du 07/07 (build feature Jordanne).
echo "🧽 [0/5] Nettoyage images danglings + conteneurs arrêtés…"
docker container prune -f >/dev/null 2>&1 || true
RECLAIMED=$(docker image prune -f 2>/dev/null | grep -i "reclaimed" || true)
[ -n "$RECLAIMED" ] && echo "   ${RECLAIMED}"

# ── [1/5] Image builder : réutilisée si la toolchain n'a pas changé ─────────
# ⚠️ Le builder legacy IGNORE le cache de layers en cross-platform (daemon
# ARM64 → image amd64, limitation moby connue) : chaque `docker build` re-fait
# apt + SDK + npm + warm-up Gradle (~6 min). On ne rebuilde donc l'image que
# si sa « toolchain » change (Dockerfile, entrypoint, deps npm, config
# Capacitor) — empreinte stockée dans .git/.builder-image-stamp. Sinon, on
# réutilise l'image taguée et le source frais est injecté par docker cp
# (pas un volume : la règle « aucun montage » reste respectée).
STAMP_FILE=".git/.builder-image-stamp"
IMAGE_STAMP=$(cat Dockerfile entrypoint.sh package.json package-lock.json capacitor.config.json 2>/dev/null | shasum | cut -d' ' -f1)
LAST_STAMP=$(cat "$STAMP_FILE" 2>/dev/null || echo "none")
if [ "$IMAGE_STAMP" != "$LAST_STAMP" ] || ! docker image inspect cantou-builder:amd64 >/dev/null 2>&1; then
  echo ""
  echo "🐳 [1/5] Build image amd64 (Rosetta) — toolchain modifiée…"
  PHASE="build image Docker"
  docker build -t cantou-builder:amd64 .
  echo "$IMAGE_STAMP" > "$STAMP_FILE"
else
  echo ""
  echo "🐳 [1/5] Image builder réutilisée (toolchain inchangée — empreinte ${IMAGE_STAMP:0:12})"
fi

# ── [2/5] Nettoyage ──────────────────────────────────────────────────────────
echo "🧹 [2/5] Nettoyage ancien conteneur…"
docker rm -f cantou-build 2>/dev/null || true

# ── [3/5] Compilation ────────────────────────────────────────────────────────
# Le conteneur est créé (pas démarré), le source frais est copié dedans par
# docker cp (tar avec les mêmes exclusions que .dockerignore), puis démarré.
# NB : les fichiers supprimés du repo peuvent subsister dans /workspace de
# l'image tant que la toolchain n'a pas changé — sans effet sur le build
# (le graphe d'imports part de index.html) ; un rebuild d'image purge tout.
echo "🚀 [3/5] Compilation APK (build n°${BUILD_NUMBER})…"
PHASE="compilation APK (Gradle/signature)"
docker create \
  --platform linux/amd64 \
  --name cantou-build \
  --env BUILD_NUMBER="${BUILD_NUMBER}" \
  --env BUILD_TIMESTAMP="${BUILD_TIMESTAMP}" \
  --env VERSION_NAME="${VERSION_NAME}" \
  cantou-builder:amd64 >/dev/null
tar -cf - \
  --exclude ./node_modules --exclude ./dist --exclude ./android \
  --exclude ./build --exclude ./.git --exclude ./.gradle \
  --exclude "*.apk" --exclude "*.aab" --exclude "*.log" --exclude "*.bak" \
  --exclude ".DS_Store" --exclude "*.dc.html" \
  --exclude ./ios-frame.jsx --exclude ./support.js \
  . | docker cp - cantou-build:/workspace
docker start -a cantou-build

# ── [4/5] Extraction ─────────────────────────────────────────────────────────
echo "📦 [4/5] Extraction de l'APK…"
PHASE="extraction de l'APK"
mkdir -p build/outputs/apk
docker cp cantou-build:/artifacts/. build/outputs/apk/
docker rm cantou-build >/dev/null 2>&1 || true

# Renommer l'APK avec les métadonnées de build
mv build/outputs/apk/cantou-release.apk "build/outputs/apk/${APK_NAME}" 2>/dev/null || true
APK_PATH="build/outputs/apk/${APK_NAME}"

echo ""
echo "✅ [5/5] APK prêt (durée totale : $((SECONDS / 60)) min $((SECONDS % 60)) s) :"
ls -lh "$APK_PATH"

# ── [5/5] Envoi Telegram (optionnel) ─────────────────────────────────────────
if [ "$DEPLOY" = "1" ]; then
  echo ""
  echo "📲 Envoi vers Telegram…"
  PHASE="envoi Telegram"
  bash scripts/deploy-telegram.sh "$APK_PATH" "$VERSION_NAME" "$BUILD_NUMBER" "$BUILD_DATE"
else
  echo ""
  echo "💡 Pour envoyer sur Telegram : ./build-docker.sh --deploy"
fi
