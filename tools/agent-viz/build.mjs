#!/usr/bin/env node
/**
 * Visualise l'activité des sous-agents Claude Code utilisés dans une session,
 * avec **flint-chart** (compile données + types sémantiques → spec Vega-Lite).
 * Outil de dev isolé (hors de l'app Cantou). Voir le skill `dev-tooling`.
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

const records = []      // { agent, tool, count } pour le graphe
const summary = []      // { agent, tools, turns, outcome }

for (const file of readdirSync(dir).filter((f) => /^a.*\.output$/.test(f)).sort()) {
  const id = file.replace('.output', '')
  let lines
  try { lines = readFileSync(join(dir, file), 'utf8').split('\n') } catch { continue }
  const tools = {}
  let turns = 0, firstUser = '', outcome = 'ok'
  for (const raw of lines) {
    const s = raw.trim(); if (!s) continue
    let o; try { o = JSON.parse(s) } catch { continue }
    const content = o?.message?.content
    if (o.type === 'user' && !firstUser) {
      firstUser = Array.isArray(content) ? content.map((c) => c.text || '').join(' ') : (typeof content === 'string' ? content : '')
    }
    if (o.type === 'assistant' && Array.isArray(content)) {
      turns++
      for (const c of content) if (c?.type === 'tool_use' && c.name) tools[c.name] = (tools[c.name] || 0) + 1
    }
    if (/session limit|API error|terminated early/i.test(s)) outcome = 'interrompu'
  }
  const label = labelFor(id, firstUser)
  for (const [tool, count] of Object.entries(tools)) records.push({ agent: label, tool, count })
  const total = Object.values(tools).reduce((a, b) => a + b, 0)
  summary.push({ agent: label, id: id.slice(0, 10), tools: total, distinct: Object.keys(tools).length, turns, outcome })
}

if (!records.length) { console.error('Aucune activité d\'agent trouvée dans', dir); process.exit(1) }

// --- flint-chart : données + types sémantiques → spec Vega-Lite ---
const input = {
  data: { values: records },
  semantic_types: { agent: 'Category', tool: 'Category', count: 'Quantity' },
  chart_spec: {
    chartType: 'Bar Chart',
    encodings: {
      x: { field: 'agent' },
      y: { field: 'count' },
      color: { field: 'tool' },
    },
  },
}
const spec = assembleVegaLite(input)
spec.title = 'Appels d\'outils par sous-agent (Cantou)'
spec.width = 620

const rows = summary.map((s) => `<tr><td>${s.agent}</td><td class=mono>${s.id}</td><td>${s.turns}</td><td>${s.tools}</td><td>${s.distinct}</td><td>${s.outcome === 'ok' ? '✅' : '⚠️ ' + s.outcome}</td></tr>`).join('')

const html = `<!doctype html><html lang=fr><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>Activité des agents — Cantou (flint-chart)</title>
<script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f6efe2;color:#2f2a22;margin:0;padding:28px;max-width:820px}
  h1{font-size:22px} .sub{color:#6b6354;font-size:14px;margin-bottom:20px}
  .card{background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:18px;box-shadow:0 2px 8px rgba(74,93,58,.06);margin-bottom:20px}
  table{border-collapse:collapse;width:100%;font-size:14px} th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #f1e9da}
  th{color:#6b6354;font-weight:700} .mono{font-family:ui-monospace,monospace;color:#6b6354;font-size:12px}
  code{background:#efe6d4;border-radius:6px;padding:1px 5px}
</style></head><body>
<h1>🔍 Activité des sous-agents — Cantou</h1>
<div class=sub>Généré par <code>tools/agent-viz</code> avec <b>flint-chart ${'0.2.2'}</b> (données + types sémantiques → Vega-Lite). Source : transcripts JSONL des sous-agents Claude Code de la session.</div>
<div class=card><div id=chart></div></div>
<div class=card>
  <table><thead><tr><th>Agent</th><th>ID</th><th>Tours</th><th>Appels d'outils</th><th>Outils distincts</th><th>État</th></tr></thead>
  <tbody>${rows}</tbody></table>
</div>
<script>vegaEmbed('#chart', ${JSON.stringify(spec)}, {actions:false}).catch(console.error);</script>
</body></html>`

writeFileSync(out, html)
console.log('Agents analysés :', summary.length, '· enregistrements :', records.length)
for (const s of summary) console.log(`  • ${s.agent.padEnd(26)} ${s.turns} tours, ${s.tools} appels d'outils (${s.distinct} distincts) ${s.outcome === 'ok' ? '' : '['+s.outcome+']'}`)
console.log('HTML écrit :', out)
