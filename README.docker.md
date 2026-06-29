# Build APK Cantou — guide Docker

Compile l'APK Android **entièrement dans Docker**, rien installé sur l'hôte
(ni Java, ni Android SDK, ni Gradle). Pensé pour **macOS Apple Silicon**.

## TL;DR
```bash
# 1) une fois par session machine : profil Colima amd64-via-Rosetta
colima start cantou --vm-type vz --vz-rosetta --cpu 4 --memory 8 --disk 30

# 2) build (≈ 5-8 min)
./build-docker.sh

# 3) résultat
ls -lh build/outputs/apk/cantou-release.apk
```

## Pourquoi ce montage particulier ?
- **AAPT2 n'existe qu'en x86_64.** En conteneur ARM64, le build Android plante
  (`qemu-x86_64: ld-linux-x86-64.so.2 not found`). → image **amd64** + **Rosetta**.
- **Pas de volume monté** : Colima ne peut pas monter `~/Desktop` (permissions macOS).
  Le projet est copié dans l'image, l'APK extrait par `docker cp`.
- **Builder legacy** (`DOCKER_BUILDKIT=0`) car buildx est absent ; le legacy honore
  quand même `FROM --platform=linux/amd64`.

Détails complets et dépannage : voir `CLAUDE.md` et le skill `.claude/skills/build-apk`.

## Fichiers du pipeline
| Fichier | Rôle |
|---|---|
| `Dockerfile` | Image amd64 : Node 20 + JDK 17 + Android SDK 34/35 |
| `entrypoint.sh` | npm → vite → capacitor → gradle → **signature** |
| `build-docker.sh` | Orchestrateur : build image, run, `docker cp` de l'APK |
| `.dockerignore` | Exclut `node_modules/dist/android/build` (garde `index.html`) |

## Installer l'APK
```bash
adb install -r build/outputs/apk/cantou-release.apk
```
Keystore de sideload : alias `cantou` / mdp `cantou123`.
**Publication Play Store : remplacer par un vrai keystore, hors du dépôt.**

## Revenir à son environnement Docker habituel
```bash
docker context use colima   # le profil 'cantou' reste dispo pour les prochains builds
```
