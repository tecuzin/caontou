# Cantou — TODO & Backlog

> Lire ce fichier en début de session. Mettre à jour les cases au fil du travail.
> Voyage paramétrable dans l'app (⚙️ sur l'accueil) — par défaut **5 → 15 août 2026**
> (Beauvais → Laschamps → Cantal). Deadline app : **15 juillet 2026**.

---

## 🔄 Drainage backlog Proposal (17-18 juillet, post-v1.2.0)

Les 5 propositions passées en Todo par David.
- [x] **🌦️ Suggestions météo** (repli indoor) — build **94**, UAT/EUA. `weather.js`.
- [x] **🧳 Multi-séjours** (profils réutilisables) — build **95**, UAT/EUA.
  `profiles.js`, écran Sejours, clé `cantou.profiles`.
- [x] **📕 Album souvenir** (carnet HTML partageable) — build **95**, UAT/EUA.
  `album.js`, bouton sur Souvenirs, sans dépendance.
- [x] **🧑‍🏫 Onboarding** (assistant 1er lancement) — build **95**, UAT/EUA.
  `onboarding.js`, flag `onboarded` (affiché seulement en install neuve).
- [x] **🔗 Partage QR** — livré **build 97**, UAT/EUA. Fait moi-même après échec
  agent : `share-config.js` (payload compact) + `qr.js` (encodeur QR **maison
  sans dépendance**, Reed-Solomon vérifié). Envoyer (QR + texte) / Recevoir
  (collage). Scan device à valider.
- [x] **🔁 Bouton « Relancer l'assistant »** (nouveau ticket) — livré **build 96**,
  UAT/EUA. Rejoue l'onboarding depuis Réglages.
- [ ] 🎨 Cohérence visuelle (In progress) — **seule carte restante**. QA device
  requise (typo/rayons/espacement/élévation, changements visibles pas à pas).

**Bilan drainage** : 5/5 propositions livrées (builds 94-97) + bouton relancer.
Suite **607 verte**. Toutes en UAT/EUA pour validation device.

> Note technique : les 4 features ci-dessus (météo + 3 du build 95) ont été
> implémentées en parallèle par agents dans des worktrees isolés, puis
> intégrées via une branche `integration/proposal-batch` (merge unique vers
> develop). Un agent avait commité un symlink `node_modules` par erreur →
> détracké ; deps réinstallées (`npm ci` en neutralisant `npm_config_allow_scripts`).
> Suite **585 verte**, audit design vert.

## ✅ Complété — a11y overlays (17 juillet, après v1.2.0)

- [x] **♿ Overlays accessibles** (carte Epiq In progress) : les 2 visionneuses
  plein écran (photo Souvenirs, reçu Budget) reçoivent `role="presentation"` +
  fermeture **Échap** (hook `useEscapeKey` factorisé) ; les 9 dernières modales
  inline d'`App.jsx` migrent vers **ModalShell** (backdrop presentation, Échap,
  feuille `role="dialog"`). Sonar S1082/S6848 résolus, plus aucun backdrop
  `<div onClick>` dupliqué. Rendu identique (vérifié en réel). +4 tests, suite
  **546 verte**. → **UAT/EUA** pour QA device (conversions d'overlays).

## 🚀 Release v1.2.0 — 17 juillet (build 92)

Tag `v1.2.0` posé sur `main`, APK `cantou-v1.2.0-build92` signé (keystore stable
`28ce1e58…`) et déployé sur Telegram + bundle QA Appium. Régression 542 unit +
29 E2E verte. Faits marquants (builds 68→91) : **cartes du séjour** (simplifiée
hors-ligne + détaillée OpenTopoMap), **fonctions désactivables** (Réglages),
**tout dans le JSON** (personnalisable), journal vocal, mémo voiture, reçu photo,
partage des dépenses, notes de visites, défi du jour. CHANGELOG + « Nouveautés »
in-app à jour.

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

## ✅ Complété — consigne reçue via Telegram (accueil)

- [x] **Nettoyage du haut de l'accueil** (consigne reçue dans le canal
  Telegram via le champ Suggestions) : montagnes du Panorama en fond
  plein cadre de la carte héro « Prochaine aventure » (dégradé sombre
  superposé pour la lisibilité du texte), suppression de la ligne
  « Bonjour 👋 » + avatar rond. Carte Panorama autonome (redondante)
  supprimée. 151 tests verts.

## ✅ Complété — audit complet (sécurité, perf, accessibilité)

**Outils utilisés** : Trivy (dépendances/secrets/config Docker), `npm audit`,
ESLint + `eslint-plugin-sonarjs` + `eslint-plugin-security` (équivalent
SonarQube hors-ligne — pas de serveur Sonar/token disponible dans cet
environnement), agent LLM dédié à la revue de sécurité (audit complet de
`src/` + scripts de build/déploiement), Lighthouse (performance +
accessibilité, mobile 402×874).

**Résultats sécurité** : 0 finding Critique/Élevé/Moyen. 3 Faibles
(validation import JSON superficielle, pas de limite de taille avant
`JSON.parse`, wifiPass en clair — attendu/voulu) + 4 Info (dont
prototype pollution non exploitable, keystore/mdp de secours déjà
documentés). Aucun secret dans l'historique git (`.env.deploy` jamais
committé). Pas de `dangerouslySetInnerHTML`/`eval`, rendu JSX safe partout.

- [x] Garde-fou taille sur l'import JSON (`parseImport`, backup.js) —
  rejette > 5 Mo avant `JSON.parse`, message d'erreur explicite.
- [x] Findings ESLint (object-injection, no-empty) revus : faux positifs
  (clés internes non issues d'une source non fiable, `catch {}`
  intentionnels pour la dégradation gracieuse du partage).
- [x] Trivy : 1 finding (Dockerfile tourne en root) — **risque accepté**,
  documenté : conteneur de build éphémère, 100% local, jamais exposé au
  réseau, détruit après chaque build ; le risque de casser le pipeline
  (déjà fragile aujourd'hui) dépasse le bénéfice réel.
- [x] `npm audit` : 7 vulnérabilités (3 modérées, 4 élevées) — toutes dans
  des devDependencies (`@capacitor/cli`, `vite`, `mocha`...), **aucune
  dans les dépendances runtime embarquées dans l'APK**. Pas de fix non
  cassant disponible ; pas forcé de breaking change pour un risque nul
  côté produit livré.

**Résultats Lighthouse (mobile)** :
| Catégorie | Avant | Après |
|---|---|---|
| Performance | 94/100 | 94/100 |
| Accessibilité | 74/100 | **91/100** |
| Bonnes pratiques | 92/100 | 92/100 |

- [x] Contraste de texte insuffisant (`#8a8273`, 74 occurrences, ratio
  3.2-3.7:1) → remplacé par `#6b6354` (déjà utilisé 34× ailleurs dans le
  design, ratio 5.0-5.8:1, conforme WCAG AA).
- [x] Viewport bloquait le zoom (`user-scalable=no`, `maximum-scale=1.0`)
  → `maximum-scale=5.0`, zoom autorisé (accessibilité basse vision).
- [x] Absence de landmark `<main>` → racine du composant `App` changée
  de `<div>` à `<main>`.
- [x] 3 tests de régression ajoutés (garde-fou taille import, landmark
  main) — 154 tests verts au total, 0 régression.

## ✅ Complété — rappel de sauvegarde, mode sombre, refacto (4-5 juillet)

- [x] **Rappel automatique de sauvegarde** — notification J+5/J+2 +
  indicateur "Dernière : …" sur l'accueil (`src/notifications.js`
  buildBackupReminder, `src/backup.js` formatLastBackup).
- [x] **Mode sombre** — substitution de couleurs de surface à l'exécution
  (`src/theme.js`), bouton 🌙/☀️ sur l'accueil, préférence locale
  persistée séparément (clé `cantou.darkMode`, pas dans l'export/import).
- [x] **`useMeteo`** et **`useTrajets`** extraits (même pattern que
  `useVisits`/`useExpenses`/`useMeals`) — 100% de couverture chacun.
- [x] 189 tests verts, couverture globale 57.01% → **60.11%**.

## ✅ Complété — extraction complète des écrans (6 juillet)

- [x] **Poursuivre l'extraction de hooks** (skill `refactor`, priorité 1) :
  `useLogi`, `useCourses`, `usePlanning`, `useTripConfig` extraits, même
  pattern que `useVisits`/`useExpenses`/`useMeals`/`useMeteo`/`useTrajets`.
- [x] **Extraire les écrans en composants** (priorité 2 du skill) — les 9
  écrans sortis de `App.jsx` vers `src/screens/` : Hébergement, Logistique,
  Météo, Trajet, Budget, Repas, Planning, Visites, **Accueil** (dernier,
  6 juillet — carte héro, carte Aujourd'hui, préparatifs, modules,
  suggestions, sauvegarde). 231 tests verts, 0 régression.
- [x] **Hook Git Flow automatique** — `.claude/settings.json` : tout merge
  amenant sur `develop` déclenche `./build-docker.sh --deploy` (build APK +
  envoi Telegram) sans confirmation manuelle. Testé en conditions réelles.

## ✅ Complété — Release v1.0.0 (7 juillet)

- [x] **Release Git Flow v1.0.0** — première version majeure. Régression
  complète verte (231 Vitest + 15 E2E Playwright), CHANGELOG [1.0.0]
  finalisé, bump `package.json` 0.4.0 → 1.0.0, merge `--no-ff` dans `main`,
  tag `v1.0.0`, merge retour dans `develop`. APK `cantou-v1.0.0-build27`
  buildé depuis `main` (digest keystore stable `28ce1e58…` vérifié) et
  envoyé sur Telegram. Hook auto-déploiement neutralisé sur le merge
  develop (marqueur `.git/.last-auto-deploy-sha`) pour éviter un double
  build. Contenu main/develop en parité (diff = `build.number` seul).

## ✅ Complété — drainage du backlog produit + qualité (7 juillet)

- [x] **Contacts d'urgence** (Hébergement) — bloc 🚨 avec numéros FR (112/15/18/17/114)
  en liens `tel:`, consultable hors ligne.
- [x] **Navette estivale Puy Mary** + **marché fermier de Mandailles** ajoutés aux visites.
- [x] **Spécialités Cantal enrichies** (Repas) — pounti, chou farci, crème de châtaigne, gentiane.
- [x] **Rappel météo avant sortie plein air** — notification la veille 20h30 des journées
  avec rando/canyoning/via ferrata… (`buildWeatherReminders`, 4 tests).
- [x] **ADR-008** — livraison APK Capacitor vs PWA (pas de service worker).
- [x] **Audit Lighthouse rejoué** (mobile) : Perf 91 · A11y 91→**100** · BP 92.
- [x] **Fix contraste WCAG AA** — `#b3a892` (ratio 2,29) → `#6b6354`, accessibilité **100/100**.
- [x] **Prune Docker `[0/5]`** au début du build (évite « no space left on device »).
- [x] **Alerte Telegram en cas d'échec de build** (trap + `deploy-telegram.sh --message`).
- [x] Tags de priorité (p1/p2/p3) sur le board Epiq. APK `cantou-v1.0.0-build29/30` déployés.
- [x] **Clarifier le lieu réel dans le Cantal** (Telegram #48) — **résolu** : lieu
  confirmé **Vezels-Roussy (15130), Carladès**. Toute la géographie re-basée
  (commit `d674c09`) + migration store v1→v2 purgeant les anciennes valeurs
  Lyon/Mandailles (`f55db59`). Hébergement, planning, trajet, visites, météo à jour.

## ✅ Complété — sécurité build + qualité tests (13 juillet)

- [x] **Conteneur de build non-root** (Epiq, Trivy DS-0002 HIGH) — bascule sur
  l'utilisateur `node` (uid 1000) : `GRADLE_USER_HOME=/home/node/.gradle`, chown
  SDK/workspace/artefacts/home, `USER node` avant le warm-up (cache Gradle
  préservé), `--chown=node:node` sur les COPY, et tar de `docker cp` taggé
  uid 1000 dans `build-docker.sh`. Vérifié end-to-end : build 69 signé, artefacts
  `node:node`, keystore stable `28ce1e58…`. Invariants build tous préservés.
- [x] **Fix test cassé `jour-j.test.jsx`** — depuis le code-splitting des
  sous-écrans (44acb05), l'écran Souvenirs est lazy : `getByTestId` synchrone
  échouait → `findByTestId`. Suite complète repassée **379/379 verts**.
- [x] Git Flow respecté (branches `feature/`/`fix/`, merges `--no-ff`), APK
  builds 70-71 auto-déployés sur Telegram, 2 cartes Epiq passées en Done.

- [x] **A11y modales — `ModalShell` partagé** (lot ~44/48 findings Sonar
  S1082/S6848) — les 22 feuilles passent par une coquille accessible : backdrop
  `role="presentation"`, **fermeture Échap** (nouveau), feuille `role="dialog"
  aria-modal`. Rendu identique, +4 tests, 383 verts, APK build 72. (Carte Epiq
  gardée In progress pour le reste.)

> ⏭️ **Restant carte a11y** (avec QA visuelle device) : les `<div onClick>`
> **réellement interactifs** de `App.jsx` (chips/cartes/onglets → `<button>` avec
> reset de style) + le viewer photo plein écran de Souvenirs (même patron Échap).
> Ces conversions changent le rendu → à valider écran par écran sur device.

## ✅ Complété — carte détaillée OpenTopoMap (17 juillet)

- [x] **🗺️ Carte détaillée OpenTopoMap** (Ticket Epiq) : bouton « Carte détaillée »
  depuis la carte du séjour (en ligne) → écran topographique OpenTopoMap avec
  marqueurs (gîte, visites, voiture), zoom +/− et attribution OSM. **Repli auto**
  sur la carte simplifiée hors-ligne. **Sans dépendance ni clé API** : `src/osm.js`
  (projection Web Mercator, choix de zoom, grille de tuiles) ; tuiles chargées à
  la demande. +13 tests, suite **542 verte**, vérifié en réel (Playwright).
- ✅ **Duo carte complet** : simplifiée hors-ligne + détaillée OpenTopoMap.

## ✅ Complété — toutes les données dans le JSON (17 juillet)

- [x] **📦 Toutes les données de référence dans le JSON** (Ticket Epiq) : plus
  aucune constante statique — jeux enfants (`kidsGames`), grille du bingo
  (`bingoItems`) et numéros d'urgence (`emergencyNumbers`) passent dans le store
  `cantou.v1`, donc **exportés/personnalisables** via import JSON. DEFAULTS,
  loadStore, currentStoreData, persistance, `STORE_KEYS` + migration **v3→v4**
  (seed depuis constantes si absent). Accueil/Bingo lisent depuis le store.
  +12 tests, suite **529 verte**. ⏭️ Édition in-app dédiée (CRUD) = suivi
  optionnel ; la personnalisation passe par l'export/import JSON.
- ✅ **Refacto « tout personnalisable » complet** : feature-flags + données JSON.

## ✅ Complété — fonctions désactivables (17 juillet)

- [x] **🎛️ Toutes les fonctions désactivables** (Ticket Epiq) : écran **Réglages**
  (tuile ⚙️ Accueil, jamais coupable) avec interrupteurs groupés Onglets /
  Modules / Extras. Catalogue `src/features.js` (clés `tab_`/`mod_`/`extra_`,
  défaut = activé → aucune migration), hook `useFeatures`. Objet `features`
  persisté dans le store et **exporté dans le JSON** (`STORE_KEYS`). Gating :
  barre du bas filtrée (accueil toujours présent + garde-fou), tuiles Accueil,
  extras (défi, mémo voiture, vote). Données jamais supprimées. +15 tests,
  suite **522 verte**, vérifié en réel (Playwright).
- [ ] **📦 Toutes les données de référence dans le JSON** (jeux, bingo, urgences)
  — ticket Epiq créé, à faire (dernier volet du refacto « tout personnalisable »).

## ✅ Complété — carte hors-ligne du séjour (16 juillet)

- [x] **🗺️ Carte simplifiée hors-ligne** (module Accueil → « Carte ») : carte
  schématique SVG sans réseau — gîte au centre, 17 visites placées à leurs
  coordonnées relatives réelles (Carladès/Cantal), **position voiture**
  (`carSpot`) si mémorisée, traits gîte→visites, tap = détail, « M'y guider ».
  Coords ajoutées au gîte (`GITE_COORDS`) + `VISITS_INITIAL` ; migration store
  **v2→v3** backfille par id (visites perso intactes). Module `src/geo.js`
  (projection équirectangulaire pure). Couleurs 100 % palette (audit design
  redundant=0 / composite=78). +27 tests, suite **507 verte**. Vérifié en réel
  (Playwright). ⏭️ Carte détaillée **OpenTopoMap** en ligne = ticket séparé.
- [ ] **🎛️ Fonctions désactivables + 📦 tout dans le JSON** — tickets Epiq créés
  (feature-flags/store + Réglages ; sortir KIDS_GAMES/BINGO_CANTAL/urgences des
  constantes vers le store). À faire.

## ✅ Complété — refactor hooks de domaine (16 juillet)

- [x] **Extraction de 3 hooks de données purs d'`App.jsx`** (clean code, aligné
  sur useLogi/useMeals) : `useRestos` (CRUD bonnes adresses, id stable max+1),
  `useDeparture` (checklist « Départ du gîte »), `useRatings` (notes/avis des
  visites). App conserve les wrappers haptics et l'orchestration modale.
  carSpot/bingo/challenges laissés dans App (side-effects natifs/confetti, pas
  des hooks de données — pas d'abstraction gratuite). +22 tests renderHook,
  suite **489 verte**. Git Flow : `refactor/extract-restos-hook` → develop.

## ✅ Complété — journal vocal (16 juillet)

- [x] **🎙️ Journal de bord vocal (dictée)** — le récit du jour peut être dicté à
  la voix. Module `src/speech.js` (wrapper Web Speech API, `webkitSpeechRecognition`
  dans la WebView Android) : `isSpeechSupported`, `startDictation` (fr-FR, continu,
  bribes finalisées) et `appendSegment`. Bouton 🎙️ dans `JournalModal` : bascule
  enregistre/stop, concatène au texte existant, gère le refus micro et masque le
  bouton si la plateforme ne sait pas dicter. 10 tests (`speech.test.js`,
  `journal-mic.test.jsx`), suite complète **472 verte**. Carte Epiq (reçu photo
  déjà livré → Done ; journal vocal → In progress puis Done).

## 📅 Backlog suivant

- [x] **Tests Appium sur device réel** — suite écrite (`tests/appium/`,
  `npm run test:appium`), jamais exécutée : nécessite un Appium server +
  device/émulateur Android connecté (non disponible dans cet environnement
  de développement) — à lancer côté utilisateur avec un téléphone branché.
- [x] Tests device réel (notifications natives, écran Aujourd'hui).

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
| [ADR-008](docs/adr/008-apk-vs-pwa.md) | Livraison APK Capacitor (pas de service worker PWA) | Accepté |
