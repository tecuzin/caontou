#!/usr/bin/env node
/**
 * Métriques de consommation des sous-agents — « combien coûte une tâche ? ».
 *
 * Les transcripts JSONL des agents portent l'usage RÉEL par requête :
 *   input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens
 * Ces quatre postes n'ont pas le même prix — les agréger en un seul chiffre
 * (ce que faisait build.mjs) masque justement ce qu'on cherche à optimiser :
 * le cache lu coûte ~10 % d'un token d'entrée, la sortie ~5 fois plus.
 *
 * Usage :
 *   node tools/agent-viz/metrics.mjs [dossier-de-transcripts] [--json]
 *
 * Aucune dépendance, 100 % local (aucune donnée n'est envoyée).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/* ── Tarifs relatifs (unités arbitraires calées sur le token d'entrée) ──────
 * On ne prétend pas facturer : on pondère pour comparer les postes entre eux.
 * Ordres de grandeur publics des modèles Claude : sortie ≈ 5× l'entrée,
 * écriture de cache ≈ 1,25×, lecture de cache ≈ 0,1×.                     */
export const WEIGHTS = { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 }

/** Coût pondéré d'un relevé d'usage (en « équivalents tokens d'entrée »). */
export function weightedCost(u) {
  if (!u) return 0
  return (u.input || 0) * WEIGHTS.input
    + (u.output || 0) * WEIGHTS.output
    + (u.cacheWrite || 0) * WEIGHTS.cacheWrite
    + (u.cacheRead || 0) * WEIGHTS.cacheRead
}

/** Somme brute de tokens (tous postes confondus). */
export function totalTokens(u) {
  if (!u) return 0
  return (u.input || 0) + (u.output || 0) + (u.cacheWrite || 0) + (u.cacheRead || 0)
}

/**
 * Classe une tâche d'agent d'après l'ÉNONCÉ de la tâche.
 *
 * Piège corrigé : classer sur le prompt entier fait matcher des mots cités en
 * contexte (« ne repropose pas le catalogue Storybook » rangeait une tâche de
 * backlog dans « stories »). On ne regarde donc que le début du prompt, où se
 * trouve la consigne réelle.
 */
export function classifyTask(text = '', window = 400) {
  const t = String(text).slice(0, window).toLowerCase()
  // Ordre volontaire : du plus spécifique au plus générique.
  if (/\bticket|backlog|proposal|documente ces|colonne proposal/.test(t)) return 'backlog'
  if (/\bstor(y|ies)\b|storybook/.test(t)) return 'stories'
  if (/\btests?\b|couverture|vitest|non-régression/.test(t)) return 'tests'
  if (/recherche|sourc|fiche (visite|de visite)|lexique/.test(t)) return 'recherche'
  if (/audit|complexit|analyse/.test(t)) return 'analyse'
  return 'feature'
}

/** Un agent a-t-il abouti ? Un transcript sans résultat final = mort en route. */
export function isFailed(lines) {
  const lastAssistant = [...lines].reverse().find((l) => l?.type === 'assistant')
  if (!lastAssistant) return true
  // Les échecs d'API laissent une trace explicite dans le dernier message.
  const txt = JSON.stringify(lastAssistant).toLowerCase()
  return /session limit|connection closed|stalled|api error/.test(txt)
}

/** Agrège un transcript JSONL en une ligne de métriques. */
export function parseTranscript(raw, id) {
  const lines = raw.split('\n').filter(Boolean).map((l) => {
    try { return JSON.parse(l) } catch { return null }
  }).filter(Boolean)

  const usage = { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 }
  const tools = new Map()
  let firstTs = null, lastTs = null, firstUserText = ''

  for (const l of lines) {
    const u = l?.message?.usage
    if (u) {
      usage.input += u.input_tokens || 0
      usage.output += u.output_tokens || 0
      usage.cacheWrite += u.cache_creation_input_tokens || 0
      usage.cacheRead += u.cache_read_input_tokens || 0
    }
    if (l.timestamp) {
      const t = Date.parse(l.timestamp)
      if (Number.isFinite(t)) {
        if (firstTs === null || t < firstTs) firstTs = t
        if (lastTs === null || t > lastTs) lastTs = t
      }
    }
    for (const c of l?.message?.content || []) {
      if (c?.type === 'tool_use' && c.name) tools.set(c.name, (tools.get(c.name) || 0) + 1)
    }
    if (!firstUserText && l?.type === 'user') {
      const c = l?.message?.content
      firstUserText = typeof c === 'string' ? c : (Array.isArray(c) ? (c.find((x) => x?.type === 'text')?.text || '') : '')
    }
  }

  const toolCalls = [...tools.values()].reduce((a, b) => a + b, 0)
  return {
    id,
    label: firstUserText.slice(0, 80).replace(/\s+/g, ' ').trim() || id,
    kind: classifyTask(firstUserText),
    failed: isFailed(lines),
    usage,
    tokens: totalTokens(usage),
    cost: Math.round(weightedCost(usage)),
    durationMs: firstTs !== null && lastTs !== null ? lastTs - firstTs : 0,
    toolCalls,
    tools: Object.fromEntries([...tools.entries()].sort((a, b) => b[1] - a[1])),
  }
}

/** Découvre le dossier `tasks/` de la session Claude la plus récente. */
function newestTasksDir() {
  const roots = ['/private/tmp', '/tmp']
  let best = null
  for (const root of roots) {
    let entries = []
    try { entries = readdirSync(root).filter((n) => n.startsWith('claude-')) } catch { continue }
    for (const e of entries) {
      const stack = [join(root, e)]
      while (stack.length) {
        const dir = stack.pop()
        let names = []
        try { names = readdirSync(dir) } catch { continue }
        for (const n of names) {
          const p = join(dir, n)
          let st
          try { st = statSync(p) } catch { continue }
          if (!st.isDirectory()) continue
          if (n === 'tasks') {
            if (!best || st.mtimeMs > best.mtime) best = { path: p, mtime: st.mtimeMs }
          } else stack.push(p)
        }
      }
    }
  }
  return best?.path || null
}

export function collect(dir) {
  const files = readdirSync(dir).filter((n) => /^a.*\.output$/.test(n))
  return files.map((n) => {
    try { return parseTranscript(readFileSync(join(dir, n), 'utf8'), n.replace('.output', '')) } catch { return null }
  }).filter(Boolean).filter((a) => a.tokens > 0)
}

/* ── CLI ───────────────────────────────────────────────────────────────── */
const isMain = process.argv[1] && process.argv[1].endsWith('metrics.mjs')
if (isMain) {
  const args = process.argv.slice(2)
  const asJson = args.includes('--json')
  const dir = args.find((a) => !a.startsWith('--')) || newestTasksDir()

  if (!dir || !existsSync(dir)) {
    console.error('Dossier de transcripts introuvable. Passe-le en argument.')
    process.exit(1)
  }

  const agents = collect(dir).sort((a, b) => b.cost - a.cost)
  const sum = (f) => agents.reduce((a, x) => a + f(x), 0)
  const failed = agents.filter((a) => a.failed)

  const report = {
    dir,
    agents,
    totals: {
      agents: agents.length,
      failed: failed.length,
      tokens: sum((a) => a.tokens),
      cost: sum((a) => a.cost),
      wastedCost: failed.reduce((a, x) => a + x.cost, 0),
      input: sum((a) => a.usage.input),
      output: sum((a) => a.usage.output),
      cacheWrite: sum((a) => a.usage.cacheWrite),
      cacheRead: sum((a) => a.usage.cacheRead),
    },
  }

  if (asJson) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    const fmt = (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n)
    const t = report.totals
    console.log(`\n╭─ Consommation des sous-agents ─────────────────────────────╮`)
    console.log(`│ ${t.agents} agents · ${t.failed} échoués · ${fmt(t.tokens)} tokens bruts`)
    console.log(`╰────────────────────────────────────────────────────────────╯\n`)
    console.log(`Répartition des tokens :`)
    console.log(`  lecture de cache   ${fmt(t.cacheRead).padStart(7)}  (le moins cher)`)
    console.log(`  écriture de cache  ${fmt(t.cacheWrite).padStart(7)}`)
    console.log(`  entrée             ${fmt(t.input).padStart(7)}`)
    console.log(`  sortie             ${fmt(t.output).padStart(7)}  (le plus cher)\n`)
    const pctWaste = t.cost ? Math.round((t.wastedCost / t.cost) * 100) : 0
    console.log(`Coût pondéré total : ${fmt(t.cost)}  ·  perdu en agents morts : ${fmt(t.wastedCost)} (${pctWaste} %)\n`)
    console.log(`Top 10 par coût :`)
    for (const a of agents.slice(0, 10)) {
      const flag = a.failed ? '✗' : '✓'
      console.log(`  ${flag} ${fmt(a.cost).padStart(7)}  ${a.kind.padEnd(10)} ${a.toolCalls.toString().padStart(3)} outils  ${a.label.slice(0, 46)}`)
    }
    const byKind = new Map()
    for (const a of agents) {
      const k = byKind.get(a.kind) || { n: 0, cost: 0 }
      k.n++; k.cost += a.cost; byKind.set(a.kind, k)
    }
    console.log(`\nCoût moyen par type de tâche :`)
    for (const [kind, k] of [...byKind.entries()].sort((a, b) => b[1].cost - a[1].cost)) {
      console.log(`  ${kind.padEnd(11)} ${fmt(Math.round(k.cost / k.n)).padStart(7)} × ${k.n} tâche(s)  = ${fmt(k.cost)}`)
    }
    console.log()
  }
}
