# Changelog

Format inspiré de *Keep a Changelog* ; versionnage **SemVer**.

## [Non publié]
Lot « Dates hébergement » (build 113, sur `develop`) — 718 tests, audit design vert.
### Ajouté
- **Arrivée/départ du gîte au calendrier + horloge** (build 113, `heb-datetime.js`) : les
  deux dernières dates en texte libre deviennent des sélecteurs natifs ; chaîne lisible
  composée pour l'affichage, repli sur l'ancienne valeur tant qu'aucune date n'est choisie.
### Corrigé
- **Édition de l'hébergement** (build 113) : les champs ne s'enregistraient pas (le modal
  passait une fonction à un `setHebFields` attendant un objet) → corrigé, tous les champs
  sont pris en compte.

Lot « Photos partout » (build 112, sur `develop`) — 711 tests, audit design vert.
### Ajouté
- **Bouton 📸 sur les éléments** (build 112, `AttachPhotoButton`) : attacher une photo
  depuis une visite ou un repas ; elle rejoint la galerie Souvenirs, étiquetée (légende
  sur la vignette). Les reçus de dépense restent exclus de la galerie.
- **Redimensionnement des photos avant stockage** (build 112, `image.js`) : plus grand
  côté borné à 1600 px, ré-encodage JPEG q0.8 → empreinte disque/mémoire réduite ; repli
  sûr sur l'original si le canvas échoue.

Lot « Confort de saisie & lieux » (build 111, sur `develop`) — 703 tests, audit design vert.
### Ajouté
- **Sélecteurs d'heure natifs** (build 111) : les champs horaire (activités du planning,
  étapes de trajet) ouvrent l'horloge Android au lieu d'une saisie texte. Helper pur
  `toTimeInput`. Les dates de séjour utilisaient déjà `type="date"`.
- **Bouton « 🚗 Y aller »** (build 111, `mapsDriveHref`/`DriveLink`) : itinéraire voiture
  direct dans Maps depuis les lieux — gîte (adresse), restos (place), visites (coordonnées).
- **Repas du jour dans le planning** (build 111, `day-schedule.js`) : le repas daté d'une
  journée s'affiche dans sa timeline (bandeau cliquable → onglet Repas). Récap inchangé.
- **Donut budget** (build 108) : répartition des dépenses par catégorie en un coup d'œil.

Lot « Carladès » (builds 105-106, sur `develop`) — fonctionnalités familiales, toutes
hors-ligne et désactivables, s'appuyant sur des modules purs testés. Suite 680 tests.
### Ajouté
- **Carte détaillée hors-ligne** (build 106, `tile-cache.js`) : pré-chargement des
  tuiles OpenTopoMap autour du gîte (IndexedDB) → consultation sans réseau ;
  complète le contrôle « prêt hors-ligne ».
- **Carte** : visites « faites » différenciées (✓ + teinte) + compteur de
  progression et filtre Tout/À faire/Faites (aussi sur la carte détaillée).
- **Ciel du jour** : lever/coucher du soleil et phase de lune calculés 100 %
  hors-ligne (`astro.js`) depuis les coordonnées du gîte, carte sur l'Accueil.
- **Recherche globale** (`search.js`) depuis l'Accueil : visites, repas, planning,
  préparatifs, courses, restos, trajet, journal, recettes — aiguillage au tap.
- **Badges enfants** (`badges.js`) : 8 badges débloqués par jalons + Confetti.
- **Jeux de route** (`car-games.js`) : « je vois quelque chose de… » et « repère
  la plaque » (départements de l'itinéraire), en plus du compteur de vaches.
- **Contrôle « prêt hors-ligne ? »** (`offline-check.js`) : diagnostics de
  disponibilité locale + liste des seules fonctions qui exigent le réseau.
- **Fiches recettes du Cantal** éditables (nouvelle collection `recipes` au store,
  donc exportée en JSON) : aligot, truffade, pounti, chou farci, crème de châtaigne.
- **Carte postale « Carladès »** (`postcard.js`) : composition sur `<canvas>` d'une
  photo Souvenirs + légende, partagée via la feuille système (hors-ligne).

## [1.3.0] - 2026-07-19
Mineure fonctionnelle (builds 92→104). Assistant de premier lancement, multi-séjours,
album souvenir, suggestions météo et partage de config par QR, accessibilité renforcée,
et un socle d'outillage de développement (graphe de code, board Epiq, visualisation
d'agents). Suite 619 tests unitaires/intégration au vert.
### Ajouté
- **Assistant de configuration au premier lancement** (onboarding) + bouton
  « Relancer l'assistant » dans Réglages ; ne s'affiche qu'en installation neuve.
- **Multi-séjours réutilisables** : snapshot JSON du store, bascule entre séjours.
- **Album souvenir** de fin de séjour, partageable.
- **Suggestions d'activités selon la météo** (repli indoor s'il pleut).
- **Partage de config par QR + copier/coller** entre téléphones, 100 % hors-ligne.
- **« Enregistrer & nouveau »** dans les modales d'ajout d'items (listes) : saisie
  en rafale sans refermer la feuille.
- **Tracking de parcours local + partage JSON** (Réglages) pour l'analyse UX.
### Accessibilité
- Visionneuses plein écran accessibles (Échap, `role=presentation`) ; 9 modales
  inline migrées vers `ModalShell` (piège de focus, aria).
### Technique
- **Outillage dev reproductible** : graphe de code (CodeGraphContext / `cgc` + MCP),
  board **Epiq** comme source de vérité unique du backlog (MCP), visualisation
  d'activité des sous-agents (`tools/agent-viz`, flint-chart — tokens & temps par
  agent et par outil), skills `dev-tooling` / `vega`.
- **Allègement d'`App.jsx`** : `Accueil.jsx` découpé en sous-composants de section ;
  **routeur de navigation extrait** dans `Navigation.jsx` (App.jsx 1528→1222 lignes).
- Consolidation typographique (11 → 7 tailles de texte).
### Corrigé
- Onboarding : ne se déclenche plus sur un store existant (déjà « onboarded »).

## [1.2.0] - 2026-07-17
Grosse mineure fonctionnelle (builds 68→91). Deux cartes du séjour, personnalisation
totale de l'app, et de nombreux ajouts famille. Suite de tests 542 unitaires + 29 E2E
au vert.
### Ajouté
- **Carte du séjour hors-ligne** : carte schématique SVG (gîte au centre, visites
  placées à leurs coordonnées réelles, **position de la voiture**), tap = détail.
- **Carte détaillée OpenTopoMap** (en ligne, sans dépendance ni clé API) : tuiles
  topographiques, zoom, mêmes marqueurs, **repli automatique** hors-ligne.
- **Fonctions désactivables** : écran **Réglages** (interrupteurs Onglets / Modules /
  Extras) piloté par des *feature-flags* persistés dans le store.
- **Tout personnalisable** : plus aucune donnée en constante statique — jeux enfants,
  grille du bingo et numéros d'urgence passent dans le store, donc dans l'export JSON.
- **Journal de bord** quotidien (récit libre) + **dictée vocale** du récit.
- **Mémo voiture** : mémorise le point GPS de stationnement + retour guidé via Maps.
- **Budget** : reçu photo attaché à une dépense ; partage « qui doit combien ? ».
- **Visites** : notes & avis post-visite (0–5 ★ + commentaire) ; itinéraire du jour
  ordonné par proximité.
- **Départ du gîte** : checklist sensible à la date de retour.
- **Défi du jour** pour les enfants (mini-quête déterministe).
### Technique
- Extraction de hooks de domaine d'`App.jsx` (`useRestos`, `useDeparture`,
  `useRatings`, `useFeatures`…) ; modules purs testables `geo.js` / `osm.js`.
- Migrations de store v2→v3 (coordonnées) et v3→v4 (données de référence).
- Moteur déterministe de cohérence de design (CIEDE2000) + consolidation
  palette / typographie / rayons / espacements. Modales chargées en lazy (−40 kB).
### Corrigé
- `parseDist` interprète les durées en heures (« 1 h 10 » → 70 min).
- Test `jour-j` : écran Souvenirs lazy attendu de façon asynchrone.

## [1.1.0] - 2026-07-12
Release de qualité (builds 60→67). Aucune régression fonctionnelle ; focus tests,
performance, accessibilité, sécurité et outillage. Voir `docs/retex/` pour le détail chiffré.
### Ajouté
- **Tests** : couverture unitaire 65→75 % (369 tests), E2E en pattern **PCOM** + couche
  **Cucumber/Gherkin** (`npm run test:bdd`), +11 scénarios (couverture E2E 39,7→49,3 %).
- **Outillage** : `npm run quality` (audit Trivy + Lighthouse + SonarQube + couverture).
- **Perf** : code-splitting des sous-écrans (démarrage allégé).
- **Accessibilité** : associations `label`/champ sur les modales (Sonar S6853 → 0).
- **Sécurité** : identifiants via `crypto.randomUUID` ; ADR-009 (stratégie keystore).
- **Escalade Telegram** : notification automatique quand l'assistant a besoin d'une réponse.
### Corrigé
- Bug conditionnel `ExportModal` (Sonar S3923), SEO (meta-description + robots.txt),
  favicon (404), demande de permission notifications au démarrage.
### Modifié
- README réécrit (vue projet complète), REX complets dans `docs/retex/`.

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
