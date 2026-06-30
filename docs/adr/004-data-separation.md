# ADR-004 — Données mutables dans `src/data.js`

**Date** : 2026-06-15  
**Statut** : Accepté

## Contexte

Le fichier `src/App.jsx` contient des données de référence en constantes. En essayant d'ajouter des données avec des apostrophes françaises typographiques (`'`, `'`) directement dans `App.jsx`, esbuild échouait avec `Unexpected apostrophe` car le fichier mélange encodages ASCII et UTF-8 curly quotes.

## Décision

Créer `src/data.js` pour héberger toutes les constantes de données **mutables** (celles qui deviennent des `useState`) avec du texte **ASCII-safe uniquement** (apostrophes droites `'`, pas de guillemets typographiques).

`App.jsx` conserve les constantes purement UI non mutables (`CATS`, `FILTERS`, `MODULES`, `BUDGET_TOTAL`).

## Conséquences

### Positives
- Séparation claire données / logique UI
- Évite les problèmes d'encodage esbuild
- Facilite les tests unitaires des données initiales
- `App.jsx` plus lisible

### Négatives / compromis
- Un import supplémentaire
- Texte légèrement dégradé (apostrophes droites vs typographiques)

## Alternatives considérées

| Alternative | Raison du rejet |
|---|---|
| Normaliser tout App.jsx en UTF-8 | Risque de casser les styles inline avec guillemets |
| Garder tout dans App.jsx | Conflits d'encodage récurrents |
