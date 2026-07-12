# REX socle — Histoire du projet Cantou (depuis le début)

**Période** : 2026-06-29 → 2026-07-11 (13 jours) · **239 commits** · jusqu'au **build 59**
**Reconstruit depuis** : `git log`, `CHANGELOG.md`, `TODO.md`, `docs/adr/`.

Répartition des commits : 60 `feat`, 54 `merge` (Git Flow), 50 `chore`, 23 `docs`,
19 `fix`, 17 `refactor`, 3 `test`, 3 `release`, 2 `perf`.

## Chronologie

### 29/06 — Amorçage & design hi-fi (v0.1.0 → v0.2.0)
- Squelette **React + Vite + Capacitor** ; dépôt initialisé avec la passation de design.
- **Pipeline de build APK Docker** (`feature/docker-apk-build`) — voir [ADR-003](../adr/003-docker-amd64.md).
- **Design haute-fidélité** porté dans `App.jsx` avec **persistance locale** (`localStorage`),
  fidèle au prototype `.dc.html` (helper `s("css…")`, styles inline — [ADR-006](../adr/006-inline-styles.md)).

### 30/06 — CRUD complet sur tous les écrans (v0.3.0)
- Édition + suppression sur **budget, repas, courses, planning, visites, trajet, météo,
  logistique**. Jours et POI éditables. Tri intelligent sur toutes les listes.
- Infra **Notifications PWA**. Icône Cantou.

### 01/07 — Déploiement & stratégie de tests
- **Versionning APK + envoi Telegram** (skill deploy). CRUD hébergement, budget total,
  checklist trajet.
- **[ADR-007](../adr/007-testing-strategy.md)** — 3 niveaux de tests (Vitest / RTL / Playwright).

### 02/07 — Signature stable & visuels (v0.3.1)
- **Keystore committé** pour signature APK stable (règle build #9) — évite les refus de
  MAJ Android. Illustrations montagne SVG offline (`Scenery.jsx`).

### 03/07 — Sauvegarde des données
- **Export JSON complet + import avec validation** ; modales extraites.

### 04/07 — Robustesse & confort (v0.4.0)
- **Notifications natives Android** (`@capacitor/local-notifications` — [ADR-005](../adr/005-pwa-notifications.md)).
- **Undo suppression** (bandeau 5 s). **Voyage paramétrable** (`trip`). Écran **« Aujourd'hui »**.
- **Partage natif**. Navigation **swipe**. **Mode sombre**. **Rappel de sauvegarde**.

### 09/07 — Re-base géographique & UX
- **Re-base sur Vezels-Roussy / Carladès** (le gîte n'est pas à Mandailles — cf. mémoire projet).
- Micro-animations, status bar Android thémée, splash. **Error Boundary React**.
- **Confetti** 100 % checklist. Extraction des premières modales.

### 10/07 — Store versionné & extraction massive
- **Schéma versionné + framework de migrations** (`migrations.js`).
- **Extraction des modales** en 3 passes (pass 1/2/3) → `src/modals/`.
- 5 features séjour : jour J, compteur, journal de bord, galerie photos souvenirs.

### 11/07 — Vague d'idées créatives (builds 52 → 59)
- **Brief du matin** (notif 8 h), **vote familial** pass-and-play, **bingo** enfants,
  **bilan de séjour** partageable, **« Quoi de neuf ? »** + historique des versions,
  **brique liens** `tel:`/Maps (urgences, restos), **carnet de restos**, **ma position** (géoloc native).
- **Audit qualité complet** → voir [2026-07-11-analyse-qualite](2026-07-11-analyse-qualite.md).

## Enseignements transverses

1. **Build APK = le point dur.** AAPT2 x86_64 only → image **amd64 obligatoire** + Rosetta ;
   pas de volume monté (TCC macOS) → copie dans l'image + `docker cp` ; pas de cache de
   layers en cross-platform → réutilisation d'image. Cf. règles build CLAUDE.md.
2. **`build.number` ne recule jamais** (= versionCode). Un incident « faux build 40 » a
   coûté un downgrade refusé (09/07).
3. **Keystore stable committé** : indispensable pour le sideload familial ; à remplacer
   par un keystore hors-repo avant tout Play Store.
4. **Application 100 % offline** assumée ([ADR-001](../adr/001-offline-first.md),
   [ADR-004](../adr/004-data-separation.md)) → pas de mocks réseau, tests simples.
5. **Dette portée par `App.jsx`** (monolithe 83 Ko) : l'extraction modales/hooks a
   commencé (10/07) mais reste le principal frein à la couverture et à la perf.
6. **Git Flow discipliné** (54 merges) : `main` ← `develop` ← `feature/*`, releases taguées.
