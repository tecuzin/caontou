# ADR-006 — Styles inline via helper `s()`

**Date** : 2026-06-01  
**Statut** : Accepté

## Contexte

Le prototype de design (`Cantou - Vacances Cantal.dc.html`) utilise des styles CSS inline. Pour une reproduction fidèle au pixel, il faut pouvoir coller ces chaînes directement dans le code React sans les réécrire manuellement en objets.

## Décision

Utiliser un helper `s(cssString)` qui parse une chaîne CSS (`"font-size:14px;color:#333"`) en objet de style React (`{ fontSize: '14px', color: '#333' }`).

```js
function s(css) {
  const o = {}
  css.split(';').forEach((decl) => {
    const i = decl.indexOf(':')
    if (i < 0) return
    const k = decl.slice(0, i).trim()
    const v = decl.slice(i + 1).trim()
    if (!k) return
    o[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v
  })
  return o
}
```

## Conséquences

### Positives
- Reproduction pixel-perfect du design sans réécriture
- Copier-coller direct depuis les outils de design
- Pas de fichier CSS séparé à maintenir

### Négatives / compromis
- Pas d'autocomplétion CSS dans l'éditeur
- Styles non factorisables (duplication inévitable)
- Bundle légèrement plus lourd (styles inline vs classes CSS)
- Performances : chaque render re-crée les objets de style (négligeable à cette échelle)

## Alternatives considérées

| Alternative | Raison du rejet |
|---|---|
| CSS Modules | Réécriture complète du prototype, temps trop long |
| Tailwind CSS | Même problème + courbe d'apprentissage mapping |
| styled-components | Dépendance, syntaxe différente du prototype |
