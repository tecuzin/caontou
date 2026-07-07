#!/bin/bash
# Envoie l'APK sur un canal Telegram via le Bot API.
# Usage : scripts/deploy-telegram.sh <apk_path> <version_name> <build_number> <build_date>
#         scripts/deploy-telegram.sh --message "<texte>"   (message texte seul)
#
# Variables d'env requises (dans .env.deploy) :
#   TELEGRAM_BOT_TOKEN  — token du bot (ex: 123456:ABCdef…)
#   TELEGRAM_CHAT_ID    — ID du canal (ex: @cantoubuilds ou -1001234567890)
set -e

# ── Charger les credentials ───────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env.deploy"

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then
  echo "❌ TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID requis."
  echo "   Créer ${ENV_FILE} (voir .env.deploy.example)"
  exit 1
fi

# ── Mode message texte seul (ex: alerte d'échec de build) ─────────────────────
if [ "$1" = "--message" ]; then
  MSG="${2:?Usage: $0 --message \"<texte>\"}"
  echo "📣 Envoi d'un message Telegram…"
  MRESPONSE=$(curl -s -w "\n%{http_code}" \
    -F "chat_id=${TELEGRAM_CHAT_ID}" \
    -F "text=${MSG}" \
    -F "parse_mode=Markdown" \
    "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage")
  MCODE=$(echo "$MRESPONSE" | tail -1)
  if [ "$MCODE" = "200" ]; then
    echo "✅ Message envoyé sur Telegram."
  else
    echo "❌ Erreur Telegram (HTTP ${MCODE}) : $(echo "$MRESPONSE" | head -1)"
    exit 1
  fi
  exit 0
fi

APK_PATH="${1:?Usage: $0 <apk_path> <version_name> <build_number> <build_date>}"
VERSION_NAME="${2:-unknown}"
BUILD_NUMBER="${3:-0}"
BUILD_DATE="${4:-$(date '+%Y-%m-%d %H:%M')}"

if [ ! -f "$APK_PATH" ]; then
  echo "❌ APK introuvable : $APK_PATH"
  exit 1
fi

# ── Métadonnées git ───────────────────────────────────────────────────────────
GIT_COMMIT=$(git -C "$SCRIPT_DIR" rev-parse --short HEAD 2>/dev/null || echo "???")
GIT_BRANCH=$(git -C "$SCRIPT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "???")
GIT_MSG=$(git -C "$SCRIPT_DIR" log -1 --pretty=format:"%s" 2>/dev/null || echo "")
APK_SIZE=$(du -sh "$APK_PATH" | cut -f1)

# ── Construire le caption ─────────────────────────────────────────────────────
CAPTION="🚀 *Cantou* \`v${VERSION_NAME}\`
📅 ${BUILD_DATE}
📦 ${APK_SIZE}

🌿 Branche : \`${GIT_BRANCH}\`
🔖 Commit : \`${GIT_COMMIT}\` — ${GIT_MSG}

_Fichier : $(basename "$APK_PATH")_"

# ── Envoi via Telegram Bot API ────────────────────────────────────────────────
echo "📲 Envoi de $(basename "$APK_PATH") (${APK_SIZE}) vers Telegram…"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -F "chat_id=${TELEGRAM_CHAT_ID}" \
  -F "document=@${APK_PATH};filename=$(basename "$APK_PATH")" \
  -F "caption=${CAPTION}" \
  -F "parse_mode=Markdown" \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ APK envoyé avec succès sur Telegram."
else
  echo "❌ Erreur Telegram (HTTP ${HTTP_CODE}) :"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  exit 1
fi
