# Déploiement APK vers Telegram

Ce document décrit comment chaque build APK est versionné automatiquement
et envoyé dans un canal Telegram.

---

## Architecture du système

```
build-docker.sh --deploy
       │
       ├─ [1] Lit/incrémente build.number
       ├─ [2] Calcule version : v{semver}-build{N}-{YYYYMMDD-HHMM}
       ├─ [3] Docker build (image amd64 Rosetta)
       ├─ [4] Docker run --env BUILD_NUMBER --env VERSION_NAME
       │         └─ entrypoint.sh
       │               ├─ npm install + vite build
       │               ├─ cap sync
       │               ├─ Patch build.gradle (versionCode + versionName)
       │               ├─ gradle assembleRelease
       │               └─ zipalign + apksigner → cantou-release.apk
       ├─ [5] docker cp → build/outputs/apk/
       ├─ [6] Renomme : cantou-v0.2.0-build43-20260701-1900.apk
       └─ [7] scripts/deploy-telegram.sh → sendDocument Bot API
```

---

## Procédure de mise en place (une seule fois)

### Étape 1 — Créer un bot Telegram

1. Ouvrir Telegram → chercher **@BotFather**
2. Envoyer `/newbot`
3. Choisir un nom (ex : `Cantou Builder`) et un username (ex : `cantou_builds_bot`)
4. BotFather répond avec un **token** — le noter :
   ```
   123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
   ```

### Étape 2 — Créer le canal et y ajouter le bot

**Option A — Canal public (le plus simple)**
1. Telegram → créer un nouveau canal → cocher « Public »
2. Choisir un nom court, ex : `@cantoubuilds`
3. Aller dans les paramètres du canal → **Administrateurs** → ajouter le bot
4. Donner au bot le droit **Poster des messages**

**Option B — Canal privé (plus sécurisé)**
1. Créer un canal privé
2. Ajouter le bot comme administrateur
3. Obtenir l'ID numérique du canal :
   - Transférer n'importe quel message du canal à **@userinfobot**
   - Il répond avec un ID de la forme `-1001234567890`
   - Utiliser cet ID dans `TELEGRAM_CHAT_ID`

### Étape 3 — Configurer les credentials

```bash
cp .env.deploy.example .env.deploy
# Éditer .env.deploy :
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
TELEGRAM_CHAT_ID=@cantoubuilds   # ou -1001234567890
```

> ⚠️ `.env.deploy` est dans `.gitignore` — ne jamais le committer.

### Étape 4 — Tester l'envoi

```bash
# Tester sur un APK existant sans rebuilder
bash scripts/deploy-telegram.sh \
  build/outputs/apk/cantou-v0.2.0-build1-20260701-1900.apk \
  "0.2.0-build1" 1 "2026-07-01 19:00"
```

---

## Utilisation au quotidien

### Build + deploy en une commande
```bash
./build-docker.sh --deploy
```

### Build seul (sans Telegram)
```bash
./build-docker.sh
```

### Envoyer un APK déjà buildé
```bash
bash scripts/deploy-telegram.sh \
  build/outputs/apk/cantou-v0.2.0-build43-20260701-1900.apk \
  "0.2.0-build43" 43 "2026-07-01 19:00"
```

---

## Format du message Telegram

```
🚀 Cantou v0.2.0-build43
📅 2026-07-01 19:00
📦 2.9 Mo

🌿 Branche : develop
🔖 Commit : abc1234 — test: setup vitest + RTL + playwright

Fichier : cantou-v0.2.0-build43-20260701-1900.apk
```

---

## Versioning des APK

| Composant | Source | Exemple |
|---|---|---|
| `semver` | `package.json` → `version` | `0.2.0` |
| `buildN` | `build.number` (auto-incrémenté) | `43` |
| `timestamp` | Heure du build | `20260701-1900` |
| **Nom APK** | Composition | `cantou-v0.2.0-build43-20260701-1900.apk` |
| `versionCode` Android | = `buildN` | `43` |
| `versionName` Android | `semver-buildN` | `0.2.0-build43` |

Le fichier `build.number` est commité dans Git pour que le numéro soit
persistent entre les machines et les sessions.

---

## Dépannage

### `TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID requis`
→ Vérifier que `.env.deploy` existe et contient les deux variables.

### HTTP 400 `Bad Request: chat not found`
→ Le bot n'est pas administrateur du canal, ou le `CHAT_ID` est incorrect.
→ Vérifier que `@username` est exact (sensible à la casse) ou utiliser l'ID numérique.

### HTTP 403 `Forbidden: bot is not a member of the channel`
→ Ajouter le bot au canal comme administrateur avec droit de poster.

### APK introuvable après build
→ Vérifier que `build.outputs/apk/*.apk` existe. Le `build.number` s'incrémente même si
   le build Docker échoue — pour réutiliser le même numéro, décrémenter manuellement :
   ```bash
   echo $(( $(cat build.number) - 1 )) > build.number
   ```

### Numéro de build qui repart à 0
→ `build.number` est un fichier texte versionné — s'assurer qu'il est bien commité.

---

## Sécurité

- Le `TELEGRAM_BOT_TOKEN` donne accès complet au bot — ne pas l'exposer publiquement.
- L'APK contient le keystore de sideload (`cantou123`) — **remplacer par un vrai keystore
  pour le Play Store**.
- Pour CI/CD (GitHub Actions, etc.) : injecter `TELEGRAM_BOT_TOKEN` et `TELEGRAM_CHAT_ID`
  comme secrets d'environnement, pas via `.env.deploy`.
