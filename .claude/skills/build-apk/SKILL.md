---
name: build-apk
description: Compiler l'APK Android de Cantou entièrement dans Docker (PWA React/Vite → Capacitor → Gradle), sur Apple Silicon via une image amd64 et Rosetta. À utiliser pour builder, signer ou dépanner l'APK.
---

# Build APK Cantou dans Docker

Compile une PWA React/Vite en APK Android signé, **sans rien installer sur l'hôte**.
Pipeline : `npm install` → `vite build` → `cap add android` → `cap sync` →
`gradle assembleRelease` → signature (`zipalign` + `apksigner`).

## Le piège central : AAPT2
`aapt2` (packaging Android) n'existe **qu'en x86_64**. Dans un conteneur ARM64
(Apple Silicon), Gradle plante : `qemu-x86_64: Could not open ld-linux-x86-64.so.2`.
→ Tout le conteneur doit tourner en **amd64**, exécuté via **Rosetta**.

## Prérequis (une seule fois) : profil Colima amd64-via-Rosetta
```bash
colima start cantou --vm-type vz --vz-rosetta --cpu 4 --memory 8 --disk 30
```
Crée une VM ARM64 native + Rosetta (binfmt `/proc/sys/fs/binfmt_misc/rosetta`).
Le profil Colima `default` (autres conteneurs) n'est pas touché. Le contexte docker
bascule sur `colima-cantou` ; revenir avec `docker context use colima`.

## Lancer le build
```bash
./build-docker.sh           # → build/outputs/apk/cantou-v{ver}-build{N}-{ts}.apk
./build-docker.sh --deploy  # idem + envoi Telegram (requiert .env.deploy)
```

`build-docker.sh` fait :
1. Lit et incrémente `build.number`, calcule le timestamp.
2. `DOCKER_HOST` = socket du profil `cantou`, `DOCKER_BUILDKIT=0` (buildx absent).
3. `docker build -t cantou-builder:amd64 .` (l'image est amd64 via `FROM --platform=`).
4. `docker run --platform linux/amd64 --env BUILD_NUMBER --env VERSION_NAME …` (Rosetta).
5. `entrypoint.sh` patche `build.gradle` (versionCode + versionName) après `cap sync`.
6. `docker cp cantou-build:/artifacts/. build/outputs/apk/` puis renomme l'APK.
7. (optionnel) `scripts/deploy-telegram.sh` envoie l'APK dans le canal configuré.

Voir `docs/deploy-telegram.md` et le skill **deploy** pour la config Telegram.

## Invariants à respecter (sinon ça casse)
- **`FROM --platform=linux/amd64`** dans le Dockerfile + `--platform linux/amd64` au `run`.
- **Pas de `-v` (volume)** : Colima ne peut pas monter `~/Desktop` (TCC macOS).
  On copie dans l'image et on extrait par `docker cp`.
- **`DOCKER_BUILDKIT=0`** ; ne pas passer `--platform` au `docker build`.
- **`.dockerignore`** garde `index.html` mais exclut `node_modules/dist/android/build`.
- SDK : `platforms;android-34` (+35), `build-tools;34.0.0`/`35.0.0`.

## Signature
L'APK release de Gradle est non signé. L'`entrypoint.sh` génère un keystore
(alias `cantou`, mdp `cantou123`), `zipalign -f 4`, puis `apksigner sign`.
→ `cantou-release.apk` installable (`adb install -r …`).
**Pour le Play Store : remplacer par un vrai keystore et le garder hors du repo.**

## Dépannage
- `qemu-x86_64 … ld-linux-x86-64.so.2` → l'image n'est pas amd64 (vérifier `FROM --platform`).
- `BuildKit is enabled but buildx missing` → `export DOCKER_BUILDKIT=0`.
- `mkdir … operation not permitted` / `file exists` au `run` → un `-v` traîne, le retirer.
- `Unable to locate a Java Runtime` → tentative de build **hors** Docker ; tout doit
  passer par le conteneur.
- Rebuild plus rapide : couches apt/SDK en cache ; seuls `npm`/`gradle` re-tournent.
