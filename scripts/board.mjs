#!/usr/bin/env node
/**
 * Lecture FILTRÉE du board Epiq.
 *
 * Pourquoi ce script existe : `epiq_issue_list` renvoie l'intégralité du board
 * — plus de 250 000 caractères — descriptions et commentaires compris. Appelé
 * en boucle par les agents, c'est devenu le premier poste de consommation de
 * tokens de la session (les tâches « backlog » coûtaient 4× une fonctionnalité).
 *
 * Ici on lit le même état, mais on n'imprime que ce qui a été demandé.
 *
 * Usage :
 *   node scripts/board.mjs                    # résumé par colonne
 *   node scripts/board.mjs --lane todo        # une colonne
 *   node scripts/board.mjs --tag p1           # par tag
 *   node scripts/board.mjs --show <id>        # UNE carte, description comprise
 *   node scripts/board.mjs --untagged         # cartes actives sans tag
 *   node scripts/board.mjs --json
 *
 * Aucune dépendance. L'état est lu depuis le worktree Epiq local.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const LANES = {
  '01KX43H1YZHXADB0SA2NRVC6F2': 'proposal',
  '01KWSTHN7AKWFJT9N28CGWDPXJ': 'todo',
  '01KWSTHN7AKWFJT9N28CGWDPXK': 'wip',
  '01KX43H1Z2K4EWCCG0TV8CC8P5': 'uat',
  '01KWSTHN7AKWFJT9N28CGWDPXM': 'done',
}
const ORDER = ['todo', 'wip', 'uat', 'proposal', 'done']

/**
 * Reconstruit l'état du board en REJOUANT le journal d'événements Epiq.
 * Epiq ne stocke pas d'état matérialisé : `.epiq/events/*.jsonl` est la
 * source de vérité, chaque ligne étant une opération (création, déplacement,
 * pose de tag…). On rejoue tout, puis on n'imprime que le demandé.
 */
function loadIssues() {
  const base = join(process.env.HOME || '', '.epiq-global', 'worktrees')
  if (!existsSync(base)) return null
  const files = []
  for (const wt of readdirSync(base)) {
    const evDir = join(base, wt, '.epiq', 'events')
    if (!existsSync(evDir)) continue
    for (const f of readdirSync(evDir)) files.push(join(evDir, f))
  }
  if (!files.length) return null

  const issues = new Map()   // id → { id, title, parentNodeId, tags:Set, isClosed }
  const tagNames = new Map() // id → nom

  for (const f of files) {
    let lines = []
    try { lines = readFileSync(f, 'utf8').split('\n').filter(Boolean) } catch { continue }
    for (const raw of lines) {
      let e
      try { e = JSON.parse(raw) } catch { continue }
      if (e['create.tag']) tagNames.set(e['create.tag'].id, e['create.tag'].name)
      if (e['add.issue']) {
        const a = e['add.issue']
        issues.set(a.id, { id: a.id, title: a.name, parentNodeId: a.parent, tags: new Set(), isClosed: false })
      }
      if (e['move.node']) {
        const m = e['move.node']
        const it = issues.get(m.id)
        if (it) it.parentNodeId = m.parent
      }
      if (e['add.issue.tag']) {
        const t = e['add.issue.tag']
        const it = issues.get(t.id)
        if (it) it.tags.add(t.tag)
      }
      if (e['remove.issue.tag']) {
        const t = e['remove.issue.tag']
        const it = issues.get(t.id)
        if (it) it.tags.delete(t.tag)
      }
      if (e['edit.description']) {
        const d = e['edit.description']
        const it = issues.get(d.id)
        if (it) it.description = d.description ?? d.body ?? ''
      }
      if (e['close.issue']) {
        const it = issues.get(e['close.issue'].id)
        if (it) it.isClosed = true
      }
    }
  }

  return [...issues.values()].map((x) => ({
    ...x,
    tags: [...x.tags].map((id) => ({ name: tagNames.get(id) || id })),
  }))
}

const args = process.argv.slice(2)
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null }

const issues = loadIssues()
if (!issues) {
  console.error('État Epiq introuvable. Ouvre le board ou utilise le MCP epiq.')
  process.exit(1)
}

const active = issues.filter((x) => x && !x.isClosed && LANES[x.parentNodeId])
const laneOf = (x) => LANES[x.parentNodeId]
const tagsOf = (x) => (x.tags || []).map((t) => t.name)
const line = (x) => `  ${x.id}  ${x.title}${tagsOf(x).length ? '  {' + tagsOf(x).join(',') + '}' : ''}`

const showId = flag('--show')
if (showId) {
  const x = issues.find((i) => i.id === showId)
  if (!x) { console.error('Carte introuvable :', showId); process.exit(1) }
  console.log(`${x.title}\n${'─'.repeat(Math.min(60, x.title.length))}`)
  console.log(`colonne : ${laneOf(x) || '—'}   tags : ${tagsOf(x).join(', ') || '—'}\n`)
  console.log(x.description || '(pas de description)')
  process.exit(0)
}

if (args.includes('--json')) {
  console.log(JSON.stringify(active.map((x) => ({ id: x.id, title: x.title, lane: laneOf(x), tags: tagsOf(x) })), null, 2))
  process.exit(0)
}

if (args.includes('--untagged')) {
  const bad = active.filter((x) => laneOf(x) !== 'done' && (!tagsOf(x).length || !tagsOf(x).some((t) => /^p[123]$/.test(t))))
  console.log(`Cartes actives sans tag/priorité : ${bad.length}`)
  bad.forEach((x) => console.log(line(x)))
  process.exit(0)
}

const lane = flag('--lane')
const tag = flag('--tag')
let sel = active
if (lane) sel = sel.filter((x) => laneOf(x) === lane.toLowerCase())
if (tag) sel = sel.filter((x) => tagsOf(x).includes(tag))

if (lane || tag) {
  console.log(`${sel.length} carte(s)${lane ? ` · ${lane}` : ''}${tag ? ` · ${tag}` : ''}`)
  sel.forEach((x) => console.log(line(x)))
} else {
  console.log('Board Epiq — résumé\n')
  for (const l of ORDER) {
    const n = active.filter((x) => laneOf(x) === l)
    console.log(`  ${l.padEnd(9)} ${String(n.length).padStart(3)}`)
  }
  console.log(`\n(détail : --lane todo · --tag p1 · --show <id> · --untagged)`)
}
