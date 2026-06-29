#!/bin/sh
set -e

cd /workspace

echo "=== [1/6] npm install ==="
npm install --no-audit --no-fund 2>&1 | tail -10

echo "=== [2/6] vite build ==="
npm run build 2>&1 | tail -10

echo "=== [3/6] capacitor add android ==="
if [ ! -d android ]; then
    npx cap add android 2>&1 | tail -10
fi

echo "=== [4/6] capacitor sync ==="
npx cap sync 2>&1 | tail -10

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

# Keystore auto-genere pour sideload (CN/mdp fixes)
keytool -genkeypair -v -keystore /tmp/cantou.keystore -alias cantou \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass cantou123 -keypass cantou123 \
    -dname "CN=Cantou, OU=Dev, O=DouaStart, L=Lyon, C=FR" 2>&1 | tail -2

mkdir -p /artifacts
"$BT/zipalign" -f 4 "$UNSIGNED" /tmp/aligned.apk
"$BT/apksigner" sign \
    --ks /tmp/cantou.keystore --ks-pass pass:cantou123 --key-pass pass:cantou123 \
    --out /artifacts/cantou-release.apk /tmp/aligned.apk
"$BT/apksigner" verify --print-certs /artifacts/cantou-release.apk 2>&1 | head -4

# On garde aussi la version non signee
cp "$UNSIGNED" /artifacts/

echo "OK APK signe genere:"
ls -lh /artifacts/*.apk
