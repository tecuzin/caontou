# Cantou — TODO & Backlog

> Lire ce fichier en début de session. Mettre à jour les cases au fil du travail.
> Voyage paramétrable dans l'app (⚙️ sur l'accueil) — par défaut **5 → 15 août 2026**
> (Beauvais → Laschamps → Cantal). Deadline app : **15 juillet 2026**.

---

## ✅ Complété

- [x] Design hi-fi porté dans `src/App.jsx` (fidèle au prototype)
- [x] Persistance locale `localStorage` (clé `cantou.v1`)
- [x] Pipeline build APK Docker/Rosetta opérationnel (`./build-docker.sh`)
- [x] **Versionning APK** — `build.number` auto-incrémenté, `versionCode`/`versionName` injectés dans Gradle, APK renommé `cantou-v{ver}-build{N}-{ts}.apk`
- [x] **Déploiement Telegram** — `./build-docker.sh --deploy` envoie l'APK dans un canal via Bot API (`scripts/deploy-telegram.sh`)
- [x] Skills créés : `build-apk`, `commit`, `test-unit`, `test-e2e`, `test-appium`
- [x] **CRUD Budget** — edit/delete dépenses + modal ajout
- [x] **CRUD Repas** — edit plat du jour via modal
- [x] **CRUD Shopping (shoppingItems)** — toggle + delete items
- [x] **CRUD Planning (activités)** — edit/delete activités + ajout avec couleur
- [x] **CRUD Planning (jours)** — edit titre/sous-titre + delete jour
- [x] **CRUD Visites** — edit/delete POI (nom, catégorie, distance, durée, âge)
- [x] **CRUD Trajet** — edit/delete étapes (heure, lieu, note, couleur)
- [x] **CRUD Météo** — edit prévision par jour (icône, temp, pluie)
- [x] **CRUD Logistique** — add/delete items par liste (valises, pharmacie, voiture, maison)
- [x] **CRUD Courses** — add/delete items par catégorie
- [x] Infrastructure notifications PWA (`Notification` API, permission au démarrage)
- [x] Création skill `project-manage` (ADR + todo)
- [x] Création fichier `TODO.md`

---

## 🔄 En cours

- [x] **Tri intelligent des listes**
  - [x] Logi/Courses : bouton toggle "Non cochés en premier"
  - [x] Visites : boutons toggle Distance / Catégorie
  - [x] Planning : tri automatique par heure après chaque add/edit
  - [x] Budget : tri par montant décroissant (toggle bouton « ↓ Par montant »)

---

## ✅ Complété depuis la v0.3.0 (2-3 juillet)

- [x] **Release Git Flow v0.3.0** (main taguée) puis **hotfix v0.3.1**
- [x] **Signature APK stable** — `cantou.keystore` committé, fini le conflit de package à la mise à jour
- [x] **Icône Android Cantou** — remplace le logo Capacitor (legacy + adaptive icon, générée au build)
- [x] **Illustrations montagne & vacances** — `src/Scenery.jsx` (panorama accueil, crêtes filigrane, scène gîte)
- [x] **Export complet JSON** — copie presse-papiers + téléchargement (accueil > Sauvegarde)
- [x] **Import complet** — collage ou fichier, validation + aperçu, remplace le store et recharge
- [x] **CRUD météo complet** + fixes CRUD (repas id stable, checks orphelins, add shopping)

---

## 🔄 En cours — soirée du 3 juillet

- [x] **Notifications natives** (`@capacitor/local-notifications`) — planification
  native Android (AlarmManager) : les rappels partent app fermée, téléphone
  verrouillé ou redémarré. Annule+replanifie à chaque changement de
  planning/repas (ids déterministes). Fallback web (Notification API) en dev.
- [x] **Undo suppression** — bandeau « Supprimé · Annuler » (5 s) après chaque 🗑️
  (11 handlers), restaure un instantané complet du store

## ✅ Complété — 4 juillet : voyage paramétrable

> Brief : trajet **Beauvais → Laschamps (étape nuit) → Cantal** aller ET retour ;
> dates **5 → 15 août 2026 par défaut mais paramétrables** ; préparatifs et
> courses **entièrement personnalisables** (listes/catégories, pas seulement items).

- [x] **Paramètres du voyage** — modal ⚙️ sur la carte héros de l'accueil : ville
  de départ, étape, destination, date de départ, date de retour. Persisté
  (`trip`), tout le reste en dérive : compte à rebours J-, textes des cartes
  (accueil, trajet, météo, planning), notifications (mois/année dynamiques).
- [x] **Trajet aller/retour** — toggle Aller · Retour sur l'écran Trajet, chaque
  direction avec ses étapes éditables (CRUD existant réutilisé). Défauts :
  Beauvais → Laschamps (nuit) → Mandailles à l'aller, inverse au retour.
  Store migré `trajetSteps` → `trajets.{aller,retour}` (migration auto au
  chargement d'un ancien store).
- [x] **Préparatifs personnalisables** — bouton « + Nouvelle liste » (logistique,
  nom + emoji) et « + Nouvelle catégorie » (courses), en plus des items déjà
  éditables ; suppression avec undo et nettoyage des checks orphelins.
- [x] **Planning : ajouter un jour** — bouton ＋ dans la rangée des onglets
  jours ; 11 jours par défaut (Mer 5 → Sam 15 août), avec les 2 jours d'étape
  à Laschamps (aller et retour) inclus dans le planning par défaut.
- [x] Tests RTL pour les 4 nouvelles fonctionnalités (54 tests verts au total).

## ✅ Complété — écran « Aujourd'hui »

- [x] **Écran « Aujourd'hui »** — carte tableau de bord sur l'accueil, visible
  uniquement quand la date réelle tombe dans la fenêtre du voyage (`trip.start`
  → `trip.end`) : titre/sous-titre du jour, activités du planning du jour,
  météo (icône + hi/lo), repas du soir, bouton vers le planning complet du jour.
  Aucun impact hors période de voyage (carte masquée). 3 tests RTL avec date
  système mockée (`vi.setSystemTime`) — 57 tests verts.

## ✅ Complété — partage natif de la sauvegarde

- [x] **Partage natif** (`@capacitor/share` + `@capacitor/filesystem`) — bouton
  « 📤 Envoyer vers Telegram / WhatsApp… » dans la modal export : écrit le
  JSON dans le cache natif puis ouvre le sheet de partage Android (fichier
  `.json` réel, pas un pavé de texte). Fallback Web Share API (fichier ou
  texte) hors app native, sinon téléchargement classique. 58 tests verts.

## ✅ Complété — release v0.4.0 + refactor (4 juillet, soirée)

- [x] **Release Git Flow v0.4.0** taguée sur `main` (voyage paramétrable,
  écran Aujourd'hui, partage natif). APK `cantou-v0.4.0-build14` envoyé
  sur Telegram (digest keystore stable vérifié, 4 plugins Capacitor).
- [x] **Skill `refactor`** créé (`.claude/skills/refactor/SKILL.md`) —
  codifie les cibles prioritaires, les règles à ne pas casser
  (data-testid, schéma localStorage, pattern `s()`) et la boucle
  petits-pas-tests-verts.
- [x] **Extraction `src/notifications.js`** — logique de rappels pure,
  sortie de App.jsx. 80% de couverture, 16 tests dédiés.
- [x] **Extraction `src/backup.js`** — export/import JSON pur (validation,
  téléchargement, partage natif avec mocks Capacitor). 97% de couverture,
  15 tests dédiés.
- [x] **Extraction `src/hooks/useVisits.js`** — premier hook de domaine
  (visites + favoris), 100% de couverture, 8 tests `renderHook()`.
  Nettoyage au passage : suppression de `addVisit`/`closeVisitAdd`
  (code mort dans App.jsx, jamais appelés).
- [x] Couverture globale : **46% → 50.13%** statements, 99 tests verts
  (0 régression sur les 91 tests existants).

## ✅ Complété — 2 hooks supplémentaires (`useExpenses`, `useMeals`)

- [x] **`useExpenses`** — dépenses (Budget), identifiées par index (comportement
  existant préservé). 100% de couverture, 6 tests.
- [x] **`useMeals`** — repas, id stable, garde-fou dernier repas restant.
  100% de couverture, 7 tests.
- [x] Couverture globale : 50.13% → **51.84%**, 112 tests verts.

## ✅ Complété — fix bug + suggestions + swipe (4 juillet, fin de soirée)

- [x] **Fix « + Ajouter visite »** — la modal ne s'ouvrait jamais (condition
  `editingVisitId !== null` qui excluait le mode ajout, même bug que la
  météo corrigé dans une session précédente, raté ici). 2 tests de
  régression.
- [x] **Champ « Suggestions »** sur l'accueil — notes libres pour de
  futures fonctionnalités ou consignes d'intégration de données, avec
  bouton « 📤 Envoyer sur Telegram / WhatsApp… » (texte brut lisible
  directement, pas un JSON à parser). `src/suggestions.js` (formatage +
  partage) + `src/hooks/useSuggestions.js`. **Process à suivre en début
  de session future : vérifier le canal Telegram pour d'éventuelles
  suggestions envoyées depuis l'app, et les intégrer ici dans le
  backlog.**
- [x] **Navigation par glissement (swipe)** — swipe gauche/droite sur la
  barre d'onglets pour changer d'écran, swipe gauche→droite sur un
  sous-écran pour revenir en arrière (équivalent bouton ‹).
  `src/hooks/useSwipe.js`, pur et testable.
- [x] 149 tests verts, couverture globale 51.84% → **57.01%**.

## 📅 Backlog suivant

- [ ] **Poursuivre l'extraction de hooks** (voir skill `refactor`, priorité 1) :
  `useTrajets`, `useLogi`, `useCourses`, `useMeteo`, `usePlanning`,
  `useTripConfig` — même pattern que `useVisits`/`useExpenses`/`useMeals`
  (état + actions pures, haptic/undo restent des wrappers côté App.jsx).
  `useSuggestions` déjà fait sur ce modèle.
- [ ] **Extraire les écrans en composants** (priorité 2 du skill) une fois
  les hooks sortis — Budget, Repas, Planning, Trajet, Logistique,
  Hébergement, Météo, Visites, Accueil.
- [ ] **Tests Appium sur device réel** — suite écrite (`tests/appium/`,
  `npm run test:appium`), jamais exécutée : nécessite un Appium server +
  device/émulateur Android connecté (non disponible dans cet environnement
  de développement) — à lancer côté utilisateur avec un téléphone branché.
- [ ] Tests device réel (notifications natives, écran Aujourd'hui).

---

## 📋 Backlog confirmé

### Notifications
- [x] Rappels **30 min avant** chaque activité planning (schedulés au démarrage si permission accordée)
- [x] Rappels **étapes trajet** (veille 20 h + matin du départ 7 h, dates dérivées de `trip.start`/`trip.end` — voir voyage paramétrable ci-dessus)
- [x] Rappels **repas du jour** (8 h chaque matin de séjour)
- [x] Alerte **budget** si dépensé > 80 % du total

### CRUD restant / améliorations
- [x] **Ajout de visite** depuis l'écran Visites (bouton +)
- [x] **Ajout de repas** (bouton + dans l'onglet Menus, champ jour libre)
- [x] **Ajout d'étape trajet** (bouton + dans l'écran trajet)
- [x] **Edit checklist trajet** (items "Avant de partir" — add/delete)
- [x] **Hébergement éditable** — nom, adresse, contact, Wi-Fi (modal 8 champs)
- [x] **Budget total éditable** (modal avec input numérique)
- [x] **Alerte budget > 80 %** (bandeau orange dans l'onglet Budget)

### UX / Polish
- [x] Boutons edit/delete : textes `"edit"` / `"delete"` remplacés par icônes ✏️ 🗑️ (repas, shopping)
- [x] Animations sur les modals — `sheetUp` + `fadeIn` uniformisés sur tous les modals (3 nouveaux corrigés)
- [x] Retour haptique — `@capacitor/haptics` intégré sur toutes les actions (toggle, save, delete)

### Tests
- [x] Tests unitaires vitest — 27 tests (`s`, `eur`, `buildList`, `sortItemsByTime`, `parseDist`)
- [x] Tests intégration React Testing Library — 18 tests (navigation, CRUD budget, planning, visites, persistance)
- [x] Tests E2E Playwright — 15 tests (navigation, CRUD budget, planning, visites, persistance)
- [x] Tests Appium (WebdriverIO) — `tests/appium/` : navigation, budget, repas, shopping · `npm run test:appium` (requiert device + Appium server)

---

## 🏗️ Architecture Decision Records

Voir `docs/adr/` pour toutes les décisions techniques.

| # | Décision | Statut |
|---|---|---|
| [ADR-001](docs/adr/001-offline-first.md) | Offline-first, pas de backend | Accepté |
| [ADR-002](docs/adr/002-local-storage.md) | localStorage comme seule persistance | Accepté |
| [ADR-003](docs/adr/003-docker-amd64.md) | Build APK via Docker amd64/Rosetta | Accepté |
| [ADR-004](docs/adr/004-data-separation.md) | Données mutables dans `src/data.js` | Accepté |
| [ADR-005](docs/adr/005-pwa-notifications.md) | Notifications via PWA `Notification` API | Accepté |
| [ADR-006](docs/adr/006-inline-styles.md) | Styles inline via helper `s()` | Accepté |
| [ADR-007](docs/adr/007-testing-strategy.md) | Stratégie tests : Vitest + RTL + Playwright | Accepté |
