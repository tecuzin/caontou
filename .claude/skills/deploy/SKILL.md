# Deploy — Envoi APK vers Telegram

Ce skill gère le déploiement de l'APK Cantou vers un canal Telegram.

## Commandes principales

```bash
# Build + versionning + envoi Telegram en une commande
./build-docker.sh --deploy

# Envoyer un APK déjà buildé (sans rebuilder)
bash scripts/deploy-telegram.sh \
  build/outputs/apk/<apk_name>.apk \
  "<version_name>" <build_number> "<build_date>"

# Tester la connexion Telegram sans APK réel
source .env.deploy
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" | python3 -m json.tool
```

## Pré-requis

1. `.env.deploy` créé à la racine du projet (ne jamais committer) :
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABCdef…
   TELEGRAM_CHAT_ID=@cantoubuilds   # ou ID numérique -100…
   ```
2. Bot ajouté comme administrateur du canal avec droit de poster.
3. Colima profil `cantou` actif pour le build Docker.

## Vérification rapide

```bash
# Vérifier que .env.deploy existe et est lisible
[ -f .env.deploy ] && echo "OK" || echo "Manquant — copier .env.deploy.example"

# Vérifier le bot
source .env.deploy
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" | python3 -m json.tool

# Numéro de build actuel
cat build.number
```

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `build.number` | Compteur auto-incrémenté (commité) |
| `build-docker.sh` | Orchestrateur principal (flag `--deploy`) |
| `entrypoint.sh` | Patch `versionCode`/`versionName` Gradle |
| `scripts/deploy-telegram.sh` | Envoi via Bot API (`sendDocument`) |
| `.env.deploy` | Credentials (gitignorés) |
| `.env.deploy.example` | Template à copier |
| `docs/deploy-telegram.md` | Documentation complète + procédure |

## Format APK généré

```
cantou-v{semver}-build{N}-{YYYYMMDD-HHMM}.apk
ex : cantou-v0.2.0-build43-20260701-1900.apk
```

## Dépannage fréquent

- **HTTP 400** → CHAT_ID incorrect ou bot pas admin du canal
- **HTTP 403** → bot non membre du canal
- **APK introuvable** → lancer `./build-docker.sh` d'abord
- **Build number décalé** → `echo $(( $(cat build.number) - 1 )) > build.number`

Voir `docs/deploy-telegram.md` pour la procédure complète de mise en place.
