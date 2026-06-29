# Changelog

Format inspiré de *Keep a Changelog* ; versionnage **SemVer**.

## [0.1.0] - 2026-06-29
### Ajouté
- Squelette PWA **React + Vite + Capacitor** (5 onglets de base).
- Pipeline de build **APK 100% Docker** (image amd64 via **Rosetta**), sans
  dépendance installée sur l'hôte.
- **Signature** automatique de l'APK release (keystore + `zipalign` + `apksigner`).
- Documentation (`CLAUDE.md`, `README.docker.md`), skills (`commit`, `build-apk`)
  et commandes slash (`/build-apk`, `/setup-build-env`, `/release`).

### À venir
- Portage du design haute-fidélité du prototype dans `src/`.
- Branchement Airtable via proxy serverless.
