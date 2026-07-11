# Cantou — app de séjour familial (Cantal)

Application mobile **100 % hors ligne** pour organiser un séjour familial dans le
**Carladès** (Cantal, gîte à **Vezels-Roussy 15130**) : compte à rebours, trajet,
hébergement, planning jour par jour, visites, repas & courses, budget partagé,
checklists, météo, souvenirs photo, et une pincée de jeux pour les enfants.

- **Nature** : PWA **React + Vite** empaquetée en **APK Android** via **Capacitor 6**.
- **Données** : **locales sur l'appareil** (`localStorage`, clé `cantou.v1`). Pas de backend,
  pas de réseau, pas de compte — l'app est autonome.
- **Cible** : famille (2 adultes + enfants), sideload familial de l'APK.
- **Statut** : v1.0.0, build 61, distribué sur Telegram. UI haute-fidélité livrée.

> Ce projet est développé de bout en bout selon une **démarche agentique** (Claude Code) :
> outillage de code augmenté, gestion de projet sur **Epiq**, tests multi-niveaux,
> **audits qualité outillés** (Lighthouse, Trivy, SonarQube), build APK reproductible en
> Docker et **publication automatisée sur Telegram**. Le détail suit.

---

## 1. Stack technique

| Couche | Choix |
|---|---|
| UI | React 18 + Vite 5, PWA mobile portrait (~402×874) |
| Natif | Capacitor 6 (`android/` généré, jamais versionné) |
| Persistance | `localStorage` (WebView Android), schéma **versionné + migrations** (`src/migrations.js`) |
| Plugins natifs | Haptics, Local Notifications, Camera, Geolocation, Share, Status Bar, Splash |
| Build | Docker (Colima), image `node:20-slim` épinglée **amd64** (Rosetta) |
| Styles | Inline via helper `s("css…")` fidèle au prototype ([ADR-006](docs/adr/006-inline-styles.md)) |

Décisions d'architecture documentées dans **[docs/adr/](docs/adr/)** (offline-first,
localStorage, Docker amd64, séparation des données, notifications, styles inline,
stratégie de tests, APK vs PWA).

## 2. Démarche agentique

Le développement s'appuie sur **Claude Code** et un outillage dédié :

- **CodeGraphContext** (`cgc` / MCP) — le code de `src/` est indexé dans un **graphe**
  (FalkorDB embarqué, resynchronisé à chaque commit via hook git). Sert aux analyses
  d'impact, recherches d'appelants et chasse au code mort **avant** toute modification.
- **rtk** (Rust Token Killer) — proxy CLI qui réduit de 60–90 % les tokens des
  opérations de dev (git, etc.), transparent via hook.
- **Skills** (procédures outillées, dans `.claude/`) : `build-apk`, `commit`,
  `deploy`, `release`, `refactor`, `test-unit`, `test-e2e`, `test-appium`,
  `project-manage`, `setup-build-env`.
- **Mémoire de projet** persistante (faits non dérivables du code : lieu réel,
  dates, conventions).

## 3. Gestion de projet — Epiq

Le backlog vit sur un board **Epiq** (local, intégration MCP), swimlanes
**Todo → In progress → Done**, plus **Proposal** et **UAT/EUA** (livré, en attente
d'acceptation). Chaque ticket est **tagué** :

- **Domaine** : `tests`, `qualite`, `securite`, `outillage`, `ci-build`, `ux`,
  `produit`, `refactor`, `technique`, `doc`, `release`, `notifications`, `contenu-cantal`…
- **Priorité** : `p1` / `p2` / `p3`.

Convention de travail : un ticket est déplacé en **In progress** au démarrage et en
**Done** à la fin (avec commentaire de gain mesuré). Rien ne reste en Todo pendant
son traitement.

## 4. Tests

Trois niveaux ([ADR-007](docs/adr/007-testing-strategy.md)) :

| Niveau | Outils | Emplacement | Commande |
|---|---|---|---|
| **Unitaire / intégration** | Vitest + jsdom + React Testing Library | `src/test/**` | `npm test` |
| **E2E** | Playwright (Chromium, viewport Pixel 5) + couverture V8 | `e2e/**` | `npm run test:e2e` |
| **Device réel** | WebdriverIO + Appium (APK sur Android) | `tests/appium/**` | `npm run test:appium` |

État actuel : **310 tests unitaires verts** (33 fichiers), **couverture ~68 %**.
Couverture E2E instrumentée (`npm run test:e2e:coverage` → `scripts/report-e2e-coverage.js`).

```bash
npm test                 # suite unitaire
npm run test:coverage    # + couverture (lcov)
npm run test:e2e         # Playwright
```

## 5. Audits qualité

Audits outillés, rejouables, tracés en **retours d'expérience** dans **[docs/retex/](docs/retex/)** :

| Audit | Outil | Dernier résultat (11/07) |
|---|---|---|
| Couverture | `vitest --coverage` (v8) | 68,4 % lignes |
| Performance / A11y / SEO | **Lighthouse** (mobile) | Perf 94 · A11y 100 · Best-pract. 92 · **SEO 100** |
| Sécurité | **Trivy** (vuln, secret, misconfig) | 0 vuln npm, 0 secret, 1 misconfig Docker à traiter |
| Qualité / dette | **SonarQube** (conteneurisé, `sonar-project.properties`) | Quality Gate OK · 64 bugs · 4 vulns · 164 smells · dette 864 min |

Les REX consignent contexte, résultats mesurés, **gains obtenus** et pièges rencontrés ;
les **fiches actions** relient chaque ticket Epiq à son gain attendu puis mesuré.

## 6. Build APK

Compilation **entièrement en Docker** (rien sur le disque hôte), en **amd64 via Rosetta**
(AAPT2 n'existe qu'en x86_64) :

```bash
# prérequis une fois
colima start cantou --vm-type vz --vz-rosetta --cpu 4 --memory 8 --disk 30
# build
./build-docker.sh            # → build/outputs/apk/cantou-release.apk
```

Points durs (détaillés dans [CLAUDE.md](CLAUDE.md)) : image amd64 obligatoire, aucun
volume monté (copie dans l'image + `docker cp`), réutilisation d'image plutôt que cache
de layers, **APK signé avec un keystore stable committé** (`cantou.keystore`, sideload
familial), et **`build.number` qui ne recule jamais** (= `versionCode` Android).

## 7. Versionnage & release

- **Commits conventionnels** (Conventional Commits) + **Git Flow** :
  `main` (stable) ← `develop` (intégration) ← `feature/*`, `release/*`, `hotfix/*`.
- **SemVer** pour la version applicative (`package.json`, `CHANGELOG.md` façon *Keep a Changelog*).
- **`build.number`** monotone → `versionCode` Android (un downgrade est refusé en MAJ).
- Les releases (skill `release`) déroulent régression, bump, merge `main`+`develop`, tag,
  build et déploiement.

## 8. Publication Telegram

Chaque APK est **versionné et envoyé automatiquement dans un canal Telegram** familial
(`build-docker.sh --deploy` → `scripts/deploy-telegram.sh`, doc :
[docs/deploy-telegram.md](docs/deploy-telegram.md)). Dans le flux agentique, un **merge sur
`develop`** déclenche le build + l'envoi Telegram, et met à jour le changelog in-app
(`src/changelog.js`, écran « Quoi de neuf ? » / historique des versions).

## 9. Structure du repo

```
src/
  App.jsx            point d'entrée UI (orchestrateur)
  screens/           13 écrans (Accueil, Planning, Visites, Repas, Budget, Trajet…)
  modals/            23 feuilles modales (ajout/édition CRUD)
  hooks/             12 hooks de domaine (useExpenses, useMeals, usePlanning…)
  data.js            données de référence (Carladès)
  migrations.js      schéma versionné + migrations du store
  notifications.js   notifications natives + brief du matin
  changelog.js       journal des versions (in-app)
  test/              tests unitaires (Vitest)
e2e/                 tests Playwright (+ couverture)
tests/appium/        tests device réel (WebdriverIO)
docs/adr/            décisions d'architecture (8 ADR)
docs/retex/          retours d'expérience + fiches actions
build-docker.sh      pipeline de build APK
```

## 10. Documentation

- **[CLAUDE.md](CLAUDE.md)** — règles projet & reproduction (build, conventions, état).
- **[docs/adr/](docs/adr/)** — décisions d'architecture.
- **[docs/retex/](docs/retex/)** — retours d'expérience, audits, fiches actions (avec gains).
- **[CHANGELOG.md](CHANGELOG.md)** — historique des versions (SemVer).
- **[docs/deploy-telegram.md](docs/deploy-telegram.md)** — publication APK.
- **Archives du handoff initial** (non utilisées) : `AIRTABLE.md`, `ARCHITECTURE.md`,
  `Cantou - Vacances Cantal.dc.html` — le backend Airtable évoqué a été abandonné au
  profit du **tout-local**.

## 11. Design (tokens)

UI haute-fidélité reprise du prototype. Palette principale : vert profond `#4a5d3a`
(primaire/actif), vert `#5b7042` (validé), terracotta `#cf7d3c` (accent), fond app
`#f4ecdc`, cartes `#fffdf8`. Typo : **Quicksand** (titres/chiffres) + **Nunito Sans**
(courant). Mode sombre supporté (fond `#1c1a16`, anti-flash au boot). Détail des tokens
dans l'historique de ce README (`git log`) et le prototype archivé.
