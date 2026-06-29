---
description: Compile l'APK Android de Cantou dans Docker (amd64/Rosetta) et l'extrait.
---

Compile l'APK en suivant le skill **build-apk**.

1. Vérifie que le profil Colima `cantou` tourne :
   `colima status cantou` — sinon lance `/setup-build-env` d'abord.
2. Exécute `./build-docker.sh` (en arrière-plan, c'est long ~5-8 min).
3. À la fin, affiche `ls -lh build/outputs/apk/*.apk` et confirme la présence de
   `cantou-release.apk` signé.

Ne réintroduis jamais de montage de volume `-v` ni de `--platform` sur `docker build`
(voir les invariants du skill build-apk).
