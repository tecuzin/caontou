#!/usr/bin/env node
/**
 * Visualise l'activité des sous-agents Claude Code utilisés dans une session,
 * avec **flint-chart** (compile données + types sémantiques → spec Vega-Lite).
 * Outil de dev isolé (hors de l'app Cantou). Voir le skill `dev-tooling`.
 *
 * Métriques : répartition des **tokens** ET du **temps passé** par sous-agent
 * (≈ tâche, un transcript = une invocation) et par **outil**.
 *
 * Usage : node tools/agent-viz/build.mjs [dossier-de-transcripts] [sortie.html]
 * - dossier-de-transcripts : dossier contenant les transcripts JSONL des agents
 *   (fichiers `a*.output`). Défaut : auto-découverte du dossier `tasks/` de la
 *   session Claude la plus récente sous /private/tmp/claude-*.
 * - sortie.html : défaut /tmp/agent-activity.html
 */
import { readFileSync, readdirSync, writeFileSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { assembleVegaLite } from 'flint-chart'

function newestTasksDir() {
  const roots = ['/private/tmp', '/tmp'].flatMap((base) => {
    try { return readdirSync(base).filter((d) => d.startsWith('claude-')).map((d) => join(base, d)) } catch { return [] }
  })
  let best = null, bestT = 0
  const walk = (dir, depth) => {
    if (depth > 6) return
    let entries; try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      const p = join(dir, e.name)
      if (e.isDirectory()) {
        if (e.name === 'tasks') { const t = statSync(p).mtimeMs; if (t > bestT) { bestT = t; best = p } }
        else walk(p, depth + 1)
      }
    }
  }
  for (const r of roots) walk(r, 0)
  return best
}

const dir = process.argv[2] || newestTasksDir()
const out = process.argv[3] || '/tmp/agent-activity.html'
if (!dir || !existsSync(dir)) { console.error('Dossier de transcripts introuvable. Passe-le en argument.'); process.exit(1) }

/** Extrait un label lisible d'un agent depuis son 1er message utilisateur. */
function labelFor(id, firstUserText) {
  const m = (firstUserText || '').match(/feature\/[\w-]+|refactor\/[\w-]+/)
  if (m) return m[0]
  const kw = (firstUserText || '').match(/\b(audit|onboarding|album|profiles|qr|weather|tracking|carte|budget)\b/i)
  return kw ? kw[1].toLowerCase() : id.slice(0, 8)
}

/** Formate une durée en ms → « 2 min 14 s » / « 43 s ». */
function fmtDur(ms) {
  if (!ms || ms < 0) return '—'
  const s = Math.round(ms / 1000)
  return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`
}
/** Formate un nombre de tokens → « 12,3k » / « 1,1M ». */
function fmtTok(n) {
  if (!n) return '0'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.', ',') + 'k'
  return String(Math.round(n))
}

const NO_TOOL = '(génération / réflexion)'   // tours sans appel d'outil

const toolRecords = []  // { agent, tool, count } — appels d'outils par agent (empilé)
const tokenRecords = [] // { agent, kind, tokens } — tokens par agent (entrée/sortie)
const durRecords = []   // { agent, durMs } — temps passé par agent
const summary = []      // récap par agent
const byTool = {}       // { tool: { calls, tokIn, tokOut, timeMs } } — agrégat par outil

for (const file of readdirSync(dir).filter((f) => /^a.*\.output$/.test(f)).sort()) {
  const id = file.replace('.output', '')
  let lines
  try { lines = readFileSync(join(dir, file), 'utf8').split('\n') } catch { continue }

  // 1) collecte ordonnée des événements horodatés (pour attribuer le temps aux outils)
  const events = []       // { ts, tools:[...], tokIn, tokOut }
  const toolCounts = {}
  let turns = 0, firstUser = '', outcome = 'ok'
  for (const raw of lines) {
    const s = raw.trim(); if (!s) continue
    let o; try { o = JSON.parse(s) } catch { continue }
    const content = o?.message?.content
    const ts = o.timestamp ? Date.parse(o.timestamp) : 0
    if (o.type === 'user' && !firstUser) {
      firstUser = Array.isArray(content) ? content.map((c) => c.text || '').join(' ') : (typeof content === 'string' ? content : '')
    }
    if (o.type === 'assistant' && Array.isArray(content)) {
      turns++
      const tools = []
      for (const c of content) if (c?.type === 'tool_use' && c.name) { tools.push(c.name); toolCounts[c.name] = (toolCounts[c.name] || 0) + 1 }
      const u = o?.message?.usage || {}
      const tin = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0)
      const tout = u.output_tokens || 0
      events.push({ ts, tools, tokIn: tin, tokOut: tout })
    } else if (ts) {
      events.push({ ts, tools: null, tokIn: 0, tokOut: 0 }) // marqueur temporel (tool_result, etc.)
    }
    if (/session limit|API error|terminated early/i.test(s)) outcome = 'interrompu'
  }

  // 2) attribution tokens + temps aux outils (temps d'un tour = écart jusqu'à l'événement suivant)
  let tokIn = 0, tokOut = 0, firstTs = 0, lastTs = 0
  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    if (e.ts) { if (!firstTs) firstTs = e.ts; lastTs = e.ts }
    if (e.tools === null) continue
    tokIn += e.tokIn; tokOut += e.tokOut
    // durée de ce tour : jusqu'au prochain événement horodaté
    let gap = 0
    for (let j = i + 1; j < events.length; j++) { if (events[j].ts && e.ts) { gap = events[j].ts - e.ts; break } }
    const buckets = e.tools.length ? e.tools : [NO_TOOL]
    const share = 1 / buckets.length
    for (const t of buckets) {
      const b = (byTool[t] ||= { calls: 0, tokIn: 0, tokOut: 0, timeMs: 0 })
      if (e.tools.length) b.calls += 1
      b.tokIn += e.tokIn * share
      b.tokOut += e.tokOut * share
      b.timeMs += gap * share
    }
  }

  const label = labelFor(id, firstUser)
  for (const [tool, count] of Object.entries(toolCounts)) toolRecords.push({ agent: label, tool, count })
  tokenRecords.push({ agent: label, kind: 'entrée (+cache)', tokens: tokIn }, { agent: label, kind: 'sortie', tokens: tokOut })
  const durMs = firstTs && lastTs ? lastTs - firstTs : 0
  durRecords.push({ agent: label, durMs })
  const totalCalls = Object.values(toolCounts).reduce((a, b) => a + b, 0)
  summary.push({ agent: label, id: id.slice(0, 10), tools: totalCalls, distinct: Object.keys(toolCounts).length, turns, outcome,
    tokIn, tokOut, tokTotal: tokIn + tokOut, durMs })
}

if (!toolRecords.length && !summary.length) { console.error('Aucune activité d\'agent trouvée dans', dir); process.exit(1) }

// ---------- specs flint-chart ----------
const bar = (values, x, y, color, title) => {
  const semantic_types = { [x]: 'Category', [y]: 'Quantity' }
  if (color) semantic_types[color] = 'Category'
  const spec = assembleVegaLite({ data: { values }, semantic_types,
    chart_spec: { chartType: 'Bar Chart', encodings: { x: { field: x }, y: { field: y }, ...(color ? { color: { field: color } } : {}) } } })
  spec.title = title; spec.width = 620
  return spec
}

// données par outil (tri décroissant par tokens)
const toolRows = Object.entries(byTool).map(([tool, b]) => ({ tool, calls: b.calls, tokTotal: Math.round(b.tokIn + b.tokOut), timeMs: Math.round(b.timeMs) }))
  .sort((a, b) => b.tokTotal - a.tokTotal)
const durSec = durRecords.map((d) => ({ agent: d.agent, sec: Math.round(d.durMs / 1000) }))
const toolTokVals = toolRows.map((r) => ({ outil: r.tool, tokens: r.tokTotal }))
const toolSecVals = toolRows.map((r) => ({ outil: r.tool, sec: Math.round(r.timeMs / 1000) }))

const specCalls = bar(toolRecords, 'agent', 'count', 'tool', 'Appels d\'outils par sous-agent')
const specTokAgent = bar(tokenRecords, 'agent', 'tokens', 'kind', 'Tokens par sous-agent (entrée+cache / sortie)')
const specDurAgent = bar(durSec, 'agent', 'sec', null, 'Temps passé par sous-agent (secondes)')
const specTokTool = bar(toolTokVals, 'outil', 'tokens', null, 'Tokens par outil (répartition)')
const specDurTool = bar(toolSecVals, 'outil', 'sec', null, 'Temps passé par outil (secondes)')

// ---------- tables + totaux ----------
const totTok = summary.reduce((a, s) => a + s.tokTotal, 0)
const totDur = summary.reduce((a, s) => a + s.durMs, 0)
const totCalls = summary.reduce((a, s) => a + s.tools, 0)

const agentRows = summary.map((s) => `<tr><td>${s.agent}</td><td class=mono>${s.id}</td><td>${s.turns}</td><td>${s.tools}</td><td>${s.distinct}</td><td>${fmtDur(s.durMs)}</td><td class=num>${fmtTok(s.tokIn)}</td><td class=num>${fmtTok(s.tokOut)}</td><td class=num><b>${fmtTok(s.tokTotal)}</b></td><td>${s.outcome === 'ok' ? '✅' : '⚠️ ' + s.outcome}</td></tr>`).join('')
const agentFooter = `<tr class=tot><td colspan=3>Total (${summary.length} agents)</td><td>${totCalls}</td><td></td><td>${fmtDur(totDur)}</td><td class=num></td><td class=num></td><td class=num><b>${fmtTok(totTok)}</b></td><td></td></tr>`

const toolTableRows = toolRows.map((r) => `<tr><td>${r.tool}</td><td>${r.calls}</td><td>${fmtDur(r.timeMs)}</td><td class=num>${fmtTok(r.tokTotal)}</td></tr>`).join('')

const html = `<!doctype html><html lang=fr><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>Activité des agents — Cantou (flint-chart)</title>
<script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f6efe2;color:#2f2a22;margin:0;padding:28px;max-width:820px}
  h1{font-size:22px} h2{font-size:16px;color:#4a5d3a;margin:6px 0 12px} .sub{color:#6b6354;font-size:14px;margin-bottom:20px}
  .card{background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:18px;box-shadow:0 2px 8px rgba(74,93,58,.06);margin-bottom:20px}
  table{border-collapse:collapse;width:100%;font-size:14px} th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #f1e9da}
  th{color:#6b6354;font-weight:700} .mono{font-family:ui-monospace,monospace;color:#6b6354;font-size:12px}
  .num{text-align:right;font-variant-numeric:tabular-nums} tr.tot td{border-top:2px solid #d8cbb0;font-weight:700}
  code{background:#efe6d4;border-radius:6px;padding:1px 5px}
</style></head><body>
<h1>🔍 Activité des sous-agents — Cantou</h1>
<div class=sub>Généré par <code>tools/agent-viz</code> avec <b>flint-chart 0.2.2</b> (données + types sémantiques → Vega-Lite). Source : transcripts JSONL des sous-agents Claude Code de la session. Chaque transcript = une invocation d'agent (≈ une tâche). Temps passé = bornes de <code>timestamp</code> ; tokens = <code>usage</code> (entrée + cache créé/lu, sortie). L'attribution par outil répartit tokens et temps de chaque tour sur le(s) outil(s) appelé(s).</div>

<div class=card><h2>Par sous-agent (≈ tâche)</h2><div id=chartCalls></div><div id=chartTokAgent></div><div id=chartDurAgent></div>
  <table><thead><tr><th>Agent</th><th>ID</th><th>Tours</th><th>Appels</th><th>Outils</th><th>Temps</th><th class=num>Tok. entrée</th><th class=num>Tok. sortie</th><th class=num>Tok. total</th><th>État</th></tr></thead>
  <tbody>${agentRows}${agentFooter}</tbody></table>
</div>

<div class=card><h2>Par outil</h2><div id=chartTokTool></div><div id=chartDurTool></div>
  <table><thead><tr><th>Outil</th><th>Appels</th><th>Temps</th><th class=num>Tokens</th></tr></thead>
  <tbody>${toolTableRows}</tbody></table>
</div>

<script>
const embed=(sel,spec)=>vegaEmbed(sel,spec,{actions:false}).catch(console.error);
embed('#chartCalls', ${JSON.stringify(specCalls)});
embed('#chartTokAgent', ${JSON.stringify(specTokAgent)});
embed('#chartDurAgent', ${JSON.stringify(specDurAgent)});
embed('#chartTokTool', ${JSON.stringify(specTokTool)});
embed('#chartDurTool', ${JSON.stringify(specDurTool)});
</script>
</body></html>`

writeFileSync(out, html)
console.log('Agents analysés :', summary.length, '· outils distincts :', toolRows.length)
for (const s of summary) console.log(`  • ${s.agent.padEnd(26)} ${s.turns} tours, ${s.tools} appels, ${fmtDur(s.durMs).padStart(9)}, ${fmtTok(s.tokTotal).padStart(6)} tok ${s.outcome === 'ok' ? '' : '[' + s.outcome + ']'}`)
console.log('  — par outil —')
for (const r of toolRows) console.log(`  · ${r.tool.padEnd(22)} ${String(r.calls).padStart(3)} appels, ${fmtDur(r.timeMs).padStart(9)}, ${fmtTok(r.tokTotal).padStart(6)} tok`)
console.log(`  Σ ${summary.length} agents · ${fmtDur(totDur)} · ${fmtTok(totTok)} tokens`)
console.log('HTML écrit :', out)
