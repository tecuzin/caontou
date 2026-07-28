#!/usr/bin/env node
/**
 * Tableau de bord du COÛT des sous-agents.
 *
 * Complète `build.mjs` (qui montre l'activité) en répondant à une autre
 * question : où part l'argent, et quelle part est gaspillée ?
 *
 * Usage : node tools/agent-viz/cost-dashboard.mjs [dossier-transcripts] [sortie.html]
 *
 * Rendu local via vega-embed (CDN au chargement de la page uniquement — les
 * données, elles, ne quittent jamais la machine : elles sont inlinées).
 */
import { writeFileSync, existsSync } from 'node:fs'
import { collect, WEIGHTS } from './metrics.mjs'

const dir = process.argv[2]
const out = process.argv[3] || '/tmp/agent-cost.html'
if (!dir || !existsSync(dir)) {
  console.error('Usage : node tools/agent-viz/cost-dashboard.mjs <dossier-transcripts> [sortie.html]')
  process.exit(1)
}

const agents = collect(dir).sort((a, b) => b.cost - a.cost)
const fmt = (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1)} M` : n >= 1e3 ? `${Math.round(n / 1e3)} k` : String(n)

/* ── Palette : accessible, lisible en clair comme en sombre (skill dataviz).
 * Le rouge est RÉSERVÉ à l'échec — il ne sert à rien d'autre, pour qu'il
 * garde son sens.                                                        */
const OK = '#4a5d3a', KO = '#b8503f'
const POSTES = { 'lecture cache': '#8aa07a', 'écriture cache': '#e8c07a', 'entrée': '#4f8a86', 'sortie': '#b8503f' }

const totals = agents.reduce((a, x) => ({
  cost: a.cost + x.cost, tokens: a.tokens + x.tokens,
  wasted: a.wasted + (x.failed ? x.cost : 0),
  input: a.input + x.usage.input, output: a.output + x.usage.output,
  cacheWrite: a.cacheWrite + x.usage.cacheWrite, cacheRead: a.cacheRead + x.usage.cacheRead,
}), { cost: 0, tokens: 0, wasted: 0, input: 0, output: 0, cacheWrite: 0, cacheRead: 0 })
const pctWaste = totals.cost ? Math.round((totals.wasted / totals.cost) * 100) : 0

/* 1 ─ Coût par agent, coloré par issue : le gaspillage saute aux yeux. */
const specParAgent = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  data: { values: agents.slice(0, 20).map((a, i) => ({
    agent: `${i + 1}. ${a.label.slice(0, 38)}`, cost: a.cost, kind: a.kind,
    issue: a.failed ? 'Échoué (perdu)' : 'Abouti', outils: a.toolCalls,
  })) },
  mark: 'bar',
  encoding: {
    y: { field: 'agent', type: 'nominal', sort: '-x', title: null, axis: { labelLimit: 300 } },
    x: { field: 'cost', type: 'quantitative', title: 'Coût pondéré (équiv. tokens d’entrée)' },
    color: { field: 'issue', type: 'nominal', title: 'Issue',
      scale: { domain: ['Abouti', 'Échoué (perdu)'], range: [OK, KO] } },
    tooltip: [{ field: 'agent' }, { field: 'kind', title: 'type' }, { field: 'cost', format: ',' }, { field: 'outils' }],
  },
  height: { step: 20 }, width: 560,
}

/* 2 ─ Coût moyen par type de tâche : ce qui coûte cher à l'unité. */
const byKind = new Map()
for (const a of agents) {
  const k = byKind.get(a.kind) || { kind: a.kind, n: 0, cost: 0, failed: 0 }
  k.n++; k.cost += a.cost; if (a.failed) k.failed++
  byKind.set(a.kind, k)
}
const kinds = [...byKind.values()].map((k) => ({ ...k, moyen: Math.round(k.cost / k.n) }))
const specParType = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  data: { values: kinds },
  layer: [
    { mark: { type: 'bar', color: '#4f8a86' },
      encoding: {
        y: { field: 'kind', type: 'nominal', sort: '-x', title: null },
        x: { field: 'moyen', type: 'quantitative', title: 'Coût MOYEN par tâche' },
        tooltip: [{ field: 'kind' }, { field: 'moyen', format: ',' }, { field: 'n', title: 'tâches' }, { field: 'failed', title: 'échouées' }],
      } },
    { mark: { type: 'text', align: 'left', dx: 4, color: '#2f2a22' },
      encoding: {
        y: { field: 'kind', type: 'nominal', sort: '-x' },
        x: { field: 'moyen', type: 'quantitative' },
        text: { field: 'n', type: 'quantitative', format: 'd' },
      } },
  ],
  height: { step: 28 }, width: 560,
}

/* 3 ─ Où passent les tokens : le volume est-il du contexte relu ? */
const specPostes = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  data: { values: [
    { poste: 'lecture cache', tokens: totals.cacheRead },
    { poste: 'écriture cache', tokens: totals.cacheWrite },
    { poste: 'entrée', tokens: totals.input },
    { poste: 'sortie', tokens: totals.output },
  ] },
  mark: 'bar',
  encoding: {
    y: { field: 'poste', type: 'nominal', sort: '-x', title: null },
    x: { field: 'tokens', type: 'quantitative', title: 'Tokens bruts', scale: { type: 'sqrt' } },
    color: { field: 'poste', type: 'nominal', legend: null,
      scale: { domain: Object.keys(POSTES), range: Object.values(POSTES) } },
    tooltip: [{ field: 'poste' }, { field: 'tokens', format: ',' }],
  },
  height: { step: 30 }, width: 560,
}

/* 4 ─ Coût cumulé par type, part perdue incluse. */
const specCumul = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  data: { values: agents.map((a) => ({ kind: a.kind, cost: a.cost, issue: a.failed ? 'Échoué (perdu)' : 'Abouti' })) },
  mark: 'bar',
  encoding: {
    y: { field: 'kind', type: 'nominal', sort: '-x', title: null },
    x: { aggregate: 'sum', field: 'cost', type: 'quantitative', title: 'Coût TOTAL cumulé' },
    color: { field: 'issue', type: 'nominal', title: 'Issue',
      scale: { domain: ['Abouti', 'Échoué (perdu)'], range: [OK, KO] } },
    tooltip: [{ field: 'kind' }, { aggregate: 'sum', field: 'cost', format: ',' }],
  },
  height: { step: 28 }, width: 560,
}

/* 5 ─ Efficacité : coût vs nombre d'appels d'outils. Un agent qui multiplie
 *     les appels sans livrer est visible en haut à droite, en rouge.      */
const specEfficacite = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  data: { values: agents.map((a) => ({
    outils: a.toolCalls, cost: a.cost, kind: a.kind,
    issue: a.failed ? 'Échoué (perdu)' : 'Abouti', label: a.label.slice(0, 50),
  })) },
  mark: { type: 'point', filled: true, size: 90, opacity: 0.85 },
  encoding: {
    x: { field: 'outils', type: 'quantitative', title: 'Appels d’outils' },
    y: { field: 'cost', type: 'quantitative', title: 'Coût pondéré' },
    color: { field: 'issue', type: 'nominal', title: 'Issue',
      scale: { domain: ['Abouti', 'Échoué (perdu)'], range: [OK, KO] } },
    shape: { field: 'kind', type: 'nominal', title: 'Type' },
    tooltip: [{ field: 'label' }, { field: 'kind' }, { field: 'outils' }, { field: 'cost', format: ',' }],
  },
  height: 320, width: 560,
}

const card = (titre, note, id) => `
  <section>
    <h2>${titre}</h2>
    <p class="note">${note}</p>
    <div id="${id}"></div>
  </section>`

const html = `<!doctype html><html lang=fr><head><meta charset=utf-8>
<title>Cantou — coût des sous-agents</title>
<script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 28px;
         background: #f4ecdc; color: #2f2a22; max-width: 760px; }
  @media (prefers-color-scheme: dark) { body { background: #1c1a16; color: #f3ecda; } }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 28px 0 2px; }
  .sub { opacity: .7; font-size: 13px; margin: 0 0 20px; }
  .note { font-size: 12px; opacity: .75; margin: 0 0 10px; line-height: 1.5; }
  .kpis { display: flex; gap: 10px; flex-wrap: wrap; margin: 16px 0 4px; }
  .kpi { background: rgba(127,127,127,.12); border-radius: 14px; padding: 10px 14px; }
  .kpi b { display: block; font-size: 19px; }
  .kpi span { font-size: 12px; opacity: .75; }
  .alert { border-left: 4px solid ${KO}; padding-left: 12px; }
  footer { margin-top: 32px; font-size: 12px; opacity: .6; line-height: 1.6; }
</style></head><body>
<h1>Coût des sous-agents</h1>
<p class="sub">${agents.length} agents · ${dir}</p>

<div class="kpis">
  <div class="kpi"><b>${fmt(totals.tokens)}</b><span>tokens bruts</span></div>
  <div class="kpi"><b>${fmt(totals.cost)}</b><span>coût pondéré</span></div>
  <div class="kpi alert"><b>${fmt(totals.wasted)}</b><span>perdu en agents morts (${pctWaste} %)</span></div>
  <div class="kpi"><b>${agents.filter((a) => a.failed).length}/${agents.length}</b><span>agents échoués</span></div>
</div>

${card('Coût par agent', 'Les barres rouges sont des agents morts en route : ils ont consommé sans rien livrer.', 'c1')}
${card('Coût moyen par type de tâche', 'Le nombre en bout de barre est le nombre de tâches de ce type.', 'c2')}
${card('Où passent les tokens', 'Échelle racine carrée : sans elle, la lecture de cache écrase tout le reste. C’est le contexte relu à chaque tour.', 'c3')}
${card('Coût total cumulé par type', 'Ce qui pèse vraiment sur la facture, part perdue comprise.', 'c4')}
${card('Efficacité : coût vs appels d’outils', 'En haut à droite et en rouge : les agents qui ont beaucoup travaillé pour rien.', 'c5')}

<footer>
Coût « pondéré » = tokens ramenés à un équivalent d’entrée
(sortie ×${WEIGHTS.output}, écriture de cache ×${WEIGHTS.cacheWrite}, lecture de cache ×${WEIGHTS.cacheRead}).
Ce n’est pas une facture : c’est une base de comparaison entre postes.<br>
Données lues localement, jamais transmises.
</footer>

<script>
const embed=(s,spec)=>vegaEmbed(s,spec,{actions:false}).catch(console.error);
embed('#c1', ${JSON.stringify(specParAgent)});
embed('#c2', ${JSON.stringify(specParType)});
embed('#c3', ${JSON.stringify(specPostes)});
embed('#c4', ${JSON.stringify(specCumul)});
embed('#c5', ${JSON.stringify(specEfficacite)});
</script>
</body></html>`

writeFileSync(out, html)
console.log(`Tableau de bord écrit : ${out}`)
console.log(`  ${agents.length} agents · ${fmt(totals.cost)} de coût pondéré · ${pctWaste} % perdu`)
