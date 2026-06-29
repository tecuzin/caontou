---
description: Démarre le profil Colima amd64-via-Rosetta requis pour compiler l'APK.
---

Prépare l'environnement de build Docker (une fois par session machine).

1. Démarre le profil dédié (n'affecte pas le profil Colima `default`) :
   ```bash
   colima start cantou --vm-type vz --vz-rosetta --cpu 4 --memory 8 --disk 30
   ```
2. Vérifie que Rosetta est actif : le profil doit exposer
   `/proc/sys/fs/binfmt_misc/rosetta` dans la VM.
3. Note : le contexte docker bascule sur `colima-cantou`. Pour revenir au profil
   habituel ensuite : `docker context use colima`.

Ensuite, lance `/build-apk`.
