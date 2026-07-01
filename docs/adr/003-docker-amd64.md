# ADR-003 — Build APK via Docker amd64 / Rosetta

**Date** : 2026-06-01  
**Statut** : Accepté

## Contexte

`aapt2` (outil de packaging Android de Gradle) n'existe qu'en x86_64. Sur Apple Silicon (ARM64), un conteneur ARM natif fait planter le build avec `qemu-x86_64: ld-linux-x86-64.so.2 not found`. De plus, rien ne doit être installé sur le disque hôte (Java, Android SDK, Node).

## Décision

- Image Docker `FROM --platform=linux/amd64 node:20-slim`
- Profil Colima dédié en `--vm-type vz --vz-rosetta` (VM ARM64 + traduction binaire x86_64 via Rosetta)
- Pas de volume monté (permissions macOS TCC) : `COPY . /workspace` + `docker cp` pour extraire l'APK
- `DOCKER_BUILDKIT=0` (buildx absent)
- Script `./build-docker.sh` encapsule toute la logique

## Conséquences

### Positives
- Build 100 % reproductible, rien d'installé sur l'hôte
- Rosetta est plus rapide que QEMU pour x86_64
- Pipeline documentée et scriptée

### Négatives / compromis
- Profil Colima `cantou` à créer une fois manuellement
- Premier build lent (téléchargement Android SDK ~2 GB dans l'image)
- Layers re-téléchargées si cache invalidé

## Alternatives considérées

| Alternative | Raison du rejet |
|---|---|
| QEMU pour amd64 | Fonctionne mais lent, nécessite `brew install qemu` |
| Installer Android Studio localement | Contraire à l'objectif "rien sur l'hôte" |
| GitHub Actions | Pas de CI/CD setup, hors scope |
