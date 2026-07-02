#!/bin/sh
set -e

cd /workspace

# Métadonnées de build injectées par build-docker.sh via --env
BUILD_NUMBER="${BUILD_NUMBER:-0}"
BUILD_TIMESTAMP="${BUILD_TIMESTAMP:-$(date '+%Y%m%d-%H%M')}"
VERSION_NAME="${VERSION_NAME:-0.0.0-build0}"

echo "=== Build n°${BUILD_NUMBER} — ${BUILD_TIMESTAMP} — v${VERSION_NAME} ==="

echo "=== [1/6] npm install ==="
npm install --no-audit --no-fund 2>&1 | tail -10

echo "=== [2/6] vite build ==="
npm run build 2>&1 | tail -10

echo "=== [3/6] capacitor add android ==="
if [ ! -d android ]; then
    npx cap add android 2>&1 | tail -10
fi

echo "=== [3b] Icone Cantou (remplace l'icone par defaut Capacitor) ==="
python3 scripts/generate-icon.py 2>&1 | tail -20

echo "=== [4/6] capacitor sync ==="
npx cap sync 2>&1 | tail -10

echo "=== [4b] Injection versionCode=${BUILD_NUMBER} versionName=${VERSION_NAME} ==="
# cap sync régénère build.gradle avec versionCode=1 — patch après sync
sed -i "s/versionCode 1$/versionCode ${BUILD_NUMBER}/" android/app/build.gradle
sed -i "s/versionName \"1.0\"/versionName \"${VERSION_NAME}\"/" android/app/build.gradle
grep -E "versionCode|versionName" android/app/build.gradle | head -2

echo "=== [5/6] gradle assembleRelease ==="
cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon 2>&1 | tail -40

UNSIGNED=app/build/outputs/apk/release/app-release-unsigned.apk
if [ ! -f "$UNSIGNED" ]; then
    echo "ERREUR: APK non signe introuvable"
    find app/build/outputs/apk -name "*.apk"
    exit 1
fi

echo "=== [6/6] Signature (zipalign + apksigner) ==="
BT=$(ls -d /android-sdk/build-tools/* | sort -V | tail -1)
echo "build-tools: $BT"

# Signature STABLE : le keystore committé dans le repo est réutilisé à
# chaque build. Un keystore régénéré à chaque fois = clé différente =
# Android refuse la mise à jour (conflit de package, il faut désinstaller).
if [ -f /workspace/cantou.keystore ]; then
    echo "Keystore stable du repo : /workspace/cantou.keystore"
    cp /workspace/cantou.keystore /tmp/cantou.keystore
else
    echo "⚠️  cantou.keystore absent du repo — génération d'un keystore JETABLE."
    echo "⚠️  L'APK ne pourra PAS mettre à jour une installation existante."
    keytool -genkeypair -v -keystore /tmp/cantou.keystore -alias cantou \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass cantou123 -keypass cantou123 \
        -dname "CN=Cantou, OU=Dev, O=DouaStart, L=Lyon, C=FR" 2>&1 | tail -2
fi

mkdir -p /artifacts
"$BT/zipalign" -f 4 "$UNSIGNED" /tmp/aligned.apk
"$BT/apksigner" sign \
    --ks /tmp/cantou.keystore --ks-pass pass:cantou123 --key-pass pass:cantou123 \
    --out /artifacts/cantou-release.apk /tmp/aligned.apk
"$BT/apksigner" verify --print-certs /artifacts/cantou-release.apk 2>&1 | head -4

cp "$UNSIGNED" /artifacts/

echo "OK APK signe — build ${BUILD_NUMBER} / ${VERSION_NAME}:"
ls -lh /artifacts/*.apk
