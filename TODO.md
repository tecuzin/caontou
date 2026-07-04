# Cantou — TODO & Backlog

> Lire ce fichier en début de session. Mettre à jour les cases au fil du travail.
> Départ voyage : **7 août 2026**. Deadline app : **15 juillet 2026**.

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

## 📅 Backlog suivant

- [ ] **Écran « Aujourd'hui »** — tableau de bord du jour pendant le séjour
  (planning du jour + météo + repas du soir), affiché par défaut du 11 au 18 juillet
- [ ] **Partage natif de la sauvegarde** (`@capacitor/share`) — envoyer l'export JSON
  directement dans Telegram/WhatsApp pour synchroniser deux téléphones

---

## 📋 Backlog confirmé

### Notifications
- [x] Rappels **30 min avant** chaque activité planning (schedulés au démarrage si permission accordée)
- [x] Rappels **étapes trajet** (J-1 : 10 juillet 20 h · matin départ : 11 juillet 7 h)
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
