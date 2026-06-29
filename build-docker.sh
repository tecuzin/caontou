#!/bin/bash
set -e
export DOCKER_HOST="unix://$HOME/.colima/cantou/docker.sock"
export DOCKER_BUILDKIT=0
cd "$(dirname "$0")"

echo "🐳 [1/4] Build image amd64 (Rosetta)…"
docker build -t cantou-builder:amd64 .

echo "🧹 [2/4] Nettoyage ancien conteneur…"
docker rm -f cantou-build 2>/dev/null || true

echo "🚀 [3/4] Compilation APK dans le conteneur…"
docker run --platform linux/amd64 --name cantou-build cantou-builder:amd64

echo "📦 [4/4] Extraction de l'APK…"
mkdir -p build/outputs/apk
docker cp cantou-build:/artifacts/. build/outputs/apk/
docker rm cantou-build >/dev/null 2>&1 || true

echo ""
echo "✅ Terminé :"
ls -lh build/outputs/apk/*.apk
