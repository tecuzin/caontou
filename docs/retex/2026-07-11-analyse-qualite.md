# REX — Audit qualité complet (11/07/2026)

**Contexte** : backlog fonctionnel drainé (9 cartes créatives livrées en builds 52→59,
en attente d'acceptation UAT). Décision : faire un **audit qualité complet** avant
d'ouvrir un nouveau cycle — couverture de tests, E2E, sécurité, performance, dette.

## Ce qui a été fait

Analyses **réellement exécutées** ce 11/07 (pas d'estimation) :

| Analyse | Commande / outil | Statut |
|---|---|---|
| Couverture TU | `vitest run --coverage` (v8) | ✅ |
| Couverture E2E | `playwright test` + coverage V8 (`scripts/report-e2e-coverage.js`) | ✅ |
| Sécurité | `trivy fs --scanners vuln,secret,misconfig` | ✅ |
| Performance / A11y / SEO | Lighthouse 13.4 (mobile) sur preview build | ✅ |
| Qualité / dette | **SonarQube community** conteneurisé (Docker/Colima) + `sonar-scanner-cli` | ✅ |

## Analyse — résultats mesurés

### Couverture unitaire (vitest v8)
**65,0 % stmts · 66,6 % branches · 58,9 % fns · 69,2 % lignes.**
Points bas : écrans `Bilan`/`Meteo` **0 %**, `Repas` 9,5 %, `Souvenirs` 16 % ;
modales d'édition 0–25 % ; `usePhotos` 15,6 % ; `links.js` 34,6 % ; `App.jsx` 55,6 %.

### E2E (Playwright)
**39,7 % de fonctions couvertes.** Playwright **seul** : ni **Cucumber** (absent) ni
pattern **PCOM** (sélecteurs `data-testid` en dur, dupliqués). ~6 flux couverts sur
13 écrans + 23 modales.

### Sécurité (Trivy)
0 vuln npm, 0 secret, **1 misconfig HIGH** : `DS-0002` (Dockerfile sans `USER` non-root).

### Lighthouse (mobile)
**Perf 94 · A11y 100 · Best-practices 92 · SEO 82.**
Échecs : SEO (meta-description, robots.txt), Best-pract. (`notification-on-start`,
`errors-in-console`), Perf (unused-JS, render-blocking, bf-cache ; FCP/LCP 2,5 s).

### SonarQube (community)
Quality Gate **OK**. **65 bugs · 6 vulnérabilités · 190 code smells · complexité cognitive
552 · couverture 68,4 % · duplication 0,0 % · dette 937 min (note maintenabilité A).**
- 6 « vulns » = `S2245` (Math.random non-crypto) → **faux positifs**.
- 65 bugs = 64× `S1082` (a11y clavier) + **1 vrai bug** `S3923` (`ExportModal.jsx:7`,
  ternaire renvoyant la même valeur des deux côtés).
- 190 smells dominés par l'a11y (`<div onClick>` ×64, labels ×16) + qualité (index-key
  ×13, `Number.parseInt` ×13, optional chaining ×12, imports/vars morts ×24).

## Gains obtenus

| Gain | Détail |
|---|---|
| **Visibilité** | Chiffres de référence établis (baseline qualité) pour mesurer les progrès. |
| **17 actions tracées** | Backlog qualité priorisé, tagué par domaine (voir fiche action). |
| **SonarQube reproductible** | Serveur conteneurisé + `sonar-project.properties` versionné → réutilisable en pipeline. |
| **1 vrai bug identifié** | `ExportModal.jsx:7` (S3923) — sinon invisible. |
| _(voir fiche action pour les gains post-traitement, mesurés)_ | |

## Enseignements

1. **Lighthouse a11y=100 mais Sonar remonte 144 findings a11y** : les deux sont
   complémentaires (rendu ARIA vs pattern source `<div onClick>`).
2. **Le mount de volume Docker fonctionne** hors du contexte build — la règle « no mount »
   de CLAUDE.md est spécifique au pipeline APK, pas à tout usage Docker.
3. **SonarQube en local = faisable** via Colima (engine arm64, image multi-arch) sans
   toucher au profil de build amd64.
4. **La dette est concentrée** : `App.jsx` + le pattern `<div onClick>` expliquent la
   majorité des findings couverture/a11y. Deux chantiers structurants (extraction,
   accessibilité) régleraient l'essentiel.

## Actions

Voir [fiches-actions/2026-07-11-qualite.md](fiches-actions/2026-07-11-qualite.md) —
17 tickets Epiq (Todo), p1×4 / p2×8 / p3×5.
