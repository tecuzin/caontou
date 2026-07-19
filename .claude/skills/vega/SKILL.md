---
name: vega
description: >-
  Créer des visualisations avec Vega-Lite (specs déclaratives) et flint-chart
  (données + types sémantiques → spec Vega-Lite), rendues via vega-embed. Pour
  les **artefacts de dev/analyse** (activité des sous-agents, sorties d'analyse
  UX, exploration de données) — PAS pour l'app Cantou elle-même (offline-first /
  bundle léger → SVG maison, voir skill `dataviz`). À utiliser dès qu'on génère
  un graphe Vega/Vega-Lite ou qu'on veut visualiser un jeu de données hors de l'app.
---

# Vega / Vega-Lite — Cantou

Visualiser des données via **Vega-Lite** (grammaire déclarative) et **flint-chart**
(compile `données + types sémantiques → spec Vega-Lite / ECharts / Chart.js`).

## ⚠️ Où l'utiliser (décision clé)

| Contexte | Outil | Pourquoi |
|---|---|---|
| **App Cantou** (écrans, ex. Budget dataviz) | **SVG maison** via le helper `s()` (comme `Carte.jsx`/`osm.js`) | Offline-first, bundle léger, palette + audit design. **Ne jamais embarquer Vega** dans l'app (lourd, dépend du réseau pour le CDN). Suivre le skill `dataviz`. |
| **Dev / analyse** (activité agents, analyse UX, exploration ad-hoc, rapports) | **Vega-Lite + flint-chart** | Rapide, expressif ; réseau OK (CDN) ; hors du build APK. |

## Vega-Lite en bref

Une spec = `{ data, mark, encoding }`. Rendu navigateur avec **vega-embed** :

```html
<script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
<div id="chart"></div>
<script>
  vegaEmbed('#chart', { data:{values:[...]}, mark:'bar',
    encoding:{ x:{field:'cat',type:'nominal'}, y:{field:'val',type:'quantitative'} } },
    { actions:false });
</script>
```

## flint-chart (recommandé) — data + sémantique → spec

`flint-chart@0.2.2` (MIT, sans deps runtime) évite d'écrire la spec à la main :
tu décris **quoi** montrer, il produit la spec.

```js
import { assembleVegaLite } from 'flint-chart' // aussi assembleECharts / assembleChartjs
const spec = assembleVegaLite({
  data: { values: [{ agent: 'onboarding', tool: 'Edit', count: 12 }, /* … */] },
  semantic_types: { agent: 'Category', tool: 'Category', count: 'Quantity' },
  chart_spec: { chartType: 'Bar Chart',
    encodings: { x:{field:'agent'}, y:{field:'count'}, color:{field:'tool'} } },
})
// puis vegaEmbed(el, spec)
```

Types sémantiques usuels : `Category`, `Quantity`, `Temporal`. Sous-exports :
`flint-chart/vegalite`, `flint-chart/core`.

## Installation (isolée, hors app)

flint-chart pèse ~25 Mo → **installé dans `tools/agent-viz/` uniquement** (son
propre `package.json`, `node_modules` gitignoré), **jamais** dans le `package.json`
de l'app. Réinstaller : `cd tools/agent-viz && npm install`. En cas de blocage
`allow-scripts` (config npm globale), voir le skill `dev-tooling`
(`npm_config_allow_scripts="" npm install --userconfig=/dev/null`).

## Exemple concret dans le repo

`tools/agent-viz/build.mjs` — visualise l'**activité des sous-agents** Claude Code :
parse les transcripts JSONL → `[{agent, tool, count}]` → `assembleVegaLite` → page
HTML (vega-embed CDN) + tableau récap.

```bash
node tools/agent-viz/build.mjs [dossier-transcripts] [sortie.html]   # défaut: auto-découverte + /tmp/agent-activity.html
open /tmp/agent-activity.html
```

## Bonnes pratiques

- **On-brand** : réutiliser la palette du projet (`node scripts/design-audit.mjs`
  liste les couleurs) via `spec.config` ou `scale.range` plutôt que les couleurs
  Vega par défaut, surtout si le rendu est destiné à l'app/produit.
- **Accessibilité & lisibilité** : suivre les principes du skill `dataviz`
  (contrastes, titres d'axes, légendes claires, `actions:false` pour épurer).
- **Reproductible** : générer les specs par script (comme agent-viz), pas à la
  main, pour pouvoir régénérer.
- **Offline** : si un artefact doit marcher sans réseau, télécharger les libs
  vega en local ; sinon le CDN suffit pour un usage dev.
