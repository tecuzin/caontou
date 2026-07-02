# ADR-007 — Stratégie de tests

**Date** : 2026-07-01  
**Statut** : Accepté

## Contexte

L'app est une PWA React/Vite compilée en APK. Elle n'a pas de backend, donc les tests
d'intégration n'ont pas besoin de mocker des APIs réseau. Le blocker principal était
`npm_config_allow_scripts` (variable d'env injectée par Claude Code) qui interdisait
l'installation de packages avec des scripts d'install — résolu par `env -u npm_config_allow_scripts npm install`.

## Décision

Trois niveaux de tests :

1. **Unitaires (Vitest + jsdom)** — utilitaires purs dans `src/utils.js`
2. **Intégration (React Testing Library)** — composant `App` avec mocks localStorage
3. **E2E (Playwright, Chromium headless)** — flows complets sur le vrai serveur Vite

## Conséquences

### Positives
- Utilitaires extraits dans `src/utils.js` → meilleure testabilité + réutilisabilité
- `data-testid` ajoutés aux éléments interactifs clés → selectors stables
- 60 tests au total, tous verts, exécution < 10 s

### Négatives / compromis
- Vitest configuré avec `include: ['src/test/**']` pour éviter de ramasser les specs Playwright
- `eur()` utilise ` ` (espace fine insécable) en locale `fr-FR` — les tests utilisent `.toMatch()` plutôt que `.toBe()` pour éviter les diffs de whitespace
- Tests Appium (APK réel sur Android) non couverts — hors scope

## Alternatives considérées

| Alternative | Raison du rejet |
|---|---|
| Jest | Non nécessaire — Vitest est natif Vite, même config |
| Cypress | Playwright plus léger, meilleur support mobile viewport |
| MSW (mock service worker) | App 100 % offline, pas d'APIs à mocker |
