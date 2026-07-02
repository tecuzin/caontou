# Changelog

Format inspiré de *Keep a Changelog* ; versionnage **SemVer**.

## [0.3.0] - 2026-07-02
### Ajouté
- **CRUD complet sur tous les écrans** : dépenses, budget total éditable,
  repas (id stable, ajout/suppression), planning (jours + activités),
  visites, étapes trajet + checklist, logistique, courses, hébergement
  (8 champs), météo (ajout/édition/suppression de jour).
- **Tri intelligent** : budget par montant décroissant, visites par
  distance/catégorie, listes « non cochés en premier », planning par heure.
- **Notifications** : rappels 30 min avant chaque activité, menu du jour
  à 8 h, rappels trajet (veille 20 h + matin du départ), alerte budget > 80 %.
- **Retour haptique** (`@capacitor/haptics`) sur toutes les actions.
- **Icône Android Cantou** (montagne/gîte) : remplace le logo Capacitor
  par défaut, legacy + adaptive icon (Android 8+), générée au build.
- **Versionnage APK** : `cantou-v{ver}-build{N}-{timestamp}.apk`
  (`build.number` auto-incrémenté, versionCode/versionName Gradle).
- **Déploiement Telegram** : `./build-docker.sh --deploy` envoie l'APK
  dans le canal via Bot API.
- **Tests** : 27 unitaires vitest + 18 intégration RTL + 15 E2E
  Playwright + suite Appium/WebdriverIO (navigation, budget, repas,
  shopping).

### Corrigé
- Deux repas partageant le même jour ne s'écrasent plus mutuellement.
- Un article supprimé puis recréé (logistique/courses) n'apparaît plus
  déjà coché (nettoyage des checks orphelins).
- Animations des modals uniformisées (sheetUp/fadeIn partout).

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
