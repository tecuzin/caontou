#!/bin/bash
# Hook « Notification » de Claude Code → relaie l'alerte vers Telegram.
# Se déclenche quand Claude a besoin de toi : question, demande de permission,
# ou attente d'une réponse. Lit le JSON du hook sur stdin, extrait le message
# et l'envoie via le mode texte de deploy-telegram.sh (mêmes credentials .env.deploy).
DIR="$(cd "$(dirname "$0")/.." && pwd)"
payload="$(cat)"
msg=$(printf '%s' "$payload" | python3 -c "import sys,json;print(json.load(sys.stdin).get('message',''))" 2>/dev/null)
[ -z "$msg" ] && msg="Claude Code attend une réponse."
# Non bloquant : un échec d'envoi ne doit jamais gêner la session.
"$DIR/scripts/deploy-telegram.sh" --message "🤖 Cantou / Claude Code
$msg" >/dev/null 2>&1 || true
exit 0
