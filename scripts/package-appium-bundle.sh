#!/bin/bash
# Empaquette un ZIP "QA" contenant l'APK le plus récent + la suite de tests
# Appium (tests/appium/) + une notice, pour un testeur disposant d'un
# téléphone Android + Appium en local.
#
# Important : les scripts Appium ne peuvent PAS être embarqués DANS l'APK —
# ce sont des scripts Node/WebdriverIO qui pilotent l'app depuis l'extérieur
# via le driver UiAutomator2, pas du code Android compilé par Gradle. Ce ZIP
# est le seul moyen de "livrer les deux ensemble".
#
# Usage : ./scripts/package-appium-bundle.sh [chemin/vers/xxx.apk]
set -e
cd "$(dirname "$0")/.."

APK_PATH="$1"
if [ -z "$APK_PATH" ]; then
  APK_PATH=$(ls -t build/outputs/apk/cantou-v*.apk 2>/dev/null | head -1)
fi
if [ -z "$APK_PATH" ] || [ ! -f "$APK_PATH" ]; then
  echo "❌ APK introuvable. Lance ./build-docker.sh d'abord, ou passe le chemin en argument." >&2
  exit 1
fi

APP_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0")
BUILD_NUMBER=$(cat build.number 2>/dev/null || echo "0")
BUNDLE_NAME="cantou-qa-bundle-v${APP_VERSION}-build${BUILD_NUMBER}"
STAGE_DIR="build/outputs/qa-bundle/${BUNDLE_NAME}"

rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR/tests/appium"

cp "$APK_PATH" "$STAGE_DIR/"
cp -R tests/appium/. "$STAGE_DIR/tests/appium/"
cp package.json "$STAGE_DIR/package.json"

cat > "$STAGE_DIR/RUNME.md" <<EOF
# QA bundle Cantou — v${APP_VERSION} build ${BUILD_NUMBER}

Contient l'APK signé + la suite de tests Appium (WebdriverIO), pour vérifier
l'app sur un téléphone Android réel.

## Prérequis
- Node.js + npm
- Un téléphone Android en USB, débogage USB activé (\`adb devices\` doit le lister)
- Appium installé : \`npm install -g appium && appium driver install uiautomator2\`

## Étapes
\`\`\`bash
npm install
adb install -r $(basename "$APK_PATH")
appium &                      # laisse tourner dans un terminal
npm run test:appium           # lance la suite dans un autre terminal
\`\`\`

## Contenu
- \`$(basename "$APK_PATH")\` — APK signé (keystore stable \`cantou\`)
- \`tests/appium/\` — suite WebdriverIO (navigation, budget, repas, shopping)
- \`package.json\` — script \`test:appium\` et dépendances \`@wdio/*\`
EOF

(cd build/outputs/qa-bundle && zip -qr "${BUNDLE_NAME}.zip" "${BUNDLE_NAME}")
rm -rf "$STAGE_DIR"

echo "✅ QA bundle prêt : build/outputs/qa-bundle/${BUNDLE_NAME}.zip"
ls -lh "build/outputs/qa-bundle/${BUNDLE_NAME}.zip"
