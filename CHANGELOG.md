# Changelog

Format inspiré de *Keep a Changelog* ; versionnage **SemVer**.

## [1.0.0] - 2026-07-07
### Ajouté
- **Itinéraire réel du trajet** — étapes aller/retour recherchées sur
  Google Maps/ViaMichelin (Beauvais → Orléans → Bourges → Laschamps,
  puis Laschamps → Murat → Mandailles), distances et temps de route
  réels.
- **Suggestions** — champ sur l'accueil pour laisser des consignes,
  exportées vers Telegram pour suivi en dehors de l'app.
- **Navigation par glissement (swipe)** — changer d'onglet en glissant
  sur la barre de menu, retour en arrière en glissant sur un
  sous-écran.
- **Panorama montagnes** en fond de la carte héro de l'accueil (retrait
  du bandeau « Bonjour »).
- **Mode sombre** — bouton 🌙/☀️, préférence locale persistée.
- **Rappel automatique de sauvegarde** — notification périodique +
  indicateur « Dernière sauvegarde : … » sur l'accueil.
- **Audit complet** sécurité (dépendances, stockage local, import JSON
  borné en taille), performance et accessibilité (Lighthouse mobile :
  Performance 94/100, Accessibilité 91/100, Bonnes pratiques 92/100).

### Corrigé
- Le bouton « + Ajouter visite » n'ouvrait pas la modale de création.
- Dates d'arrivée/départ de l'hébergement obsolètes (juillet → août).

### Technique
- Refactor complet de `App.jsx` en hooks de domaine isolés et testés
  (`useVisits`, `useExpenses`, `useMeals`, `useMeteo`, `useTrajets`,
  `useLogi`, `useCourses`, `usePlanning`, `useTripConfig`,
  `useSuggestions`, `useSwipe`) ainsi que des modules purs
  (`backup.js`, `notifications.js`).
- **Extraction des 9 écrans** en composants dédiés sous `src/screens/`
  (Accueil, Planning, Visites, Repas, Budget, Trajet, Hébergement,
  Logistique, Météo) — `App.jsx` réduit à l'orchestration de l'état et
  du routage par onglets.
- **Hook Git Flow automatique** (`.claude/settings.json`) : tout merge
  réel dans `develop` (commit à 2 parents) déclenche
  `build-docker.sh --deploy` (build APK + envoi Telegram) en arrière-plan.
- 231 tests unitaires/intégration + 15 tests E2E Playwright, tous
  verts. Couverture de code mesurée pour Vitest et Playwright
  (collecte de couverture V8 par fonction invoquée).

## [0.4.0] - 2026-07-04
### Ajouté
- **Voyage paramétrable** — modal ⚙️ sur l'accueil : ville de départ,
  étape, destination, dates de départ/retour. Tout en dérive (compte à
  rebours, textes des cartes, notifications). Défaut : Beauvais →
  Laschamps (nuit) → Mandailles (Cantal), 5 → 15 août 2026.
- **Trajet aller/retour** — toggle Aller · Retour, étapes éditables par
  direction (store migré `trajetSteps` → `trajets.{aller,retour}`).
- **Préparatifs et courses personnalisables** — ajout/suppression de
  listes logistique (nom + emoji) et de catégories de courses, pas
  seulement des items.
- **Planning : ajout de jour** — bouton ＋ dans la rangée des onglets
  jours ; 11 jours par défaut avec les étapes Laschamps incluses.
- **Écran « Aujourd'hui »** — tableau de bord du jour (planning, météo,
  repas du soir) sur l'accueil, visible uniquement pendant la fenêtre
  du voyage configurée.
- **Partage natif de la sauvegarde** (`@capacitor/share` +
  `@capacitor/filesystem`) — bouton pour envoyer l'export JSON
  directement dans Telegram/WhatsApp depuis la modal export.

### Tests
- 58 tests unitaires/intégration verts (dont dates système mockées
  pour l'écran Aujourd'hui).

## [0.3.1] - 2026-07-02
### Corrigé
- **Signature APK stable** : `cantou.keystore` committé et réutilisé à
  chaque build, au lieu d'un keystore régénéré (jetable) dans le
  conteneur. Corrige le « conflit de package » Android à l'installation
  d'une mise à jour (INSTALL_FAILED_UPDATE_INCOMPATIBLE).
  ⚠️ Une désinstallation de l'app (signée avec l'ancienne clé jetable)
  est nécessaire une dernière fois ; ensuite les mises à jour passent.

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
