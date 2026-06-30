# Changelog

Format inspiré de *Keep a Changelog* ; versionnage **SemVer**.

## [0.2.0] - 2026-06-30
### Ajouté
- **UI haute-fidélité complète** portée du prototype dans `src/App.jsx` :
  5 onglets (Accueil, Planning, À faire, Repas, Budget), 4 sous-écrans
  (Trajet, Logistique, Hébergement, Météo) et la feuille d'ajout de dépense.
- **Persistance locale sur l'appareil** (`localStorage`, clé `cantou.v1`) pour
  les favoris ♥, les cases à cocher et les dépenses. Application **autonome**.
- Compte à rebours « J- » calculé depuis la date réelle.

### Changé
- Abandon d'Airtable / du backend / du déploiement : 100 % local, hors-ligne.
- En-tête trajet « Beauvais → Mandailles » (coquille du proto) → « Lyon → Mandailles ».

## [0.1.0] - 2026-06-29
### Ajouté
- Squelette **React + Vite + Capacitor** et pipeline de build **APK Docker**
  (image amd64 via **Rosetta**) avec signature automatique.
- Documentation, skills (`commit`, `build-apk`) et commandes slash.
