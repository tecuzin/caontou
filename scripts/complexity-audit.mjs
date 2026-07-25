#!/usr/bin/env node
// ── Cantou — audit de complexité cyclomatique (heuristique textuelle) ─────────
//
// POURQUOI CE SCRIPT EXISTE
// -------------------------
// Le graphe de code (CodeGraphContext / `cgc analyze complexity`) ne calcule la
// complexité cyclomatique QUE pour Python sur ce projet : toutes les fonctions
// JS/JSX y ressortent à 1, y compris `App()` (>1200 lignes). La mesure est donc
// silencieusement inopérante et oriente mal les décisions de refactor.
// Ce script la remplace pour le JS/JSX. Il n'a AUCUNE dépendance (comme
// `scripts/design-audit.mjs`) : pur Node ESM, reproductible, hors-ligne.
//
// ⚠️ HONNÊTETÉ SUR LA MÉTHODE — CE N'EST PAS UN VRAI AST
// -----------------------------------------------------
// On ne parse pas le JavaScript : on masque d'abord les chaînes, gabarits,
// commentaires et littéraux regex (remplacés par des espaces, les retours à la
// ligne étant préservés), puis on applique des expressions régulières sur le
// source masqué. Conséquences assumées :
//   • les bornes de fonction sont trouvées par comptage d'accolades, pas par
//     analyse syntaxique → une construction exotique peut décaler une borne ;
//   • les fonctions IMBRIQUÉES sont comptées deux fois : une fois pour
//     elles-mêmes, et leurs points de décision comptent aussi dans la fonction
//     englobante (c'est voulu — un composant qui contient 30 callbacks EST
//     complexe à lire) ;
//   • les callbacks anonymes passés en argument (hors useCallback/useMemo) ne
//     sont pas listés séparément ; leur complexité remonte à la fonction hôte ;
//   • le JSX est traité comme du texte : `cond && <X/>` et `a ? <X/> : <Y/>`
//     comptent comme des branches (ce sont bien des branches de rendu).
// Les scores sont donc des ORDRES DE GRANDEUR comparables entre eux, pas des
// valeurs canoniques McCabe. À utiliser pour CLASSER des cibles de refactor,
// pas pour bloquer une CI. Le script sort toujours en code 0 (informatif).
//
// POINTS DE DÉCISION COMPTÉS (base 1 par fonction)
// ------------------------------------------------
//   if / else if ............... +1   (le `else` nu ne compte pas — McCabe)
//   for / for..of / while / do . +1
//   case (switch) .............. +1   (`default` ne compte pas)
//   catch ...................... +1
//   ternaire `? :` ............. +1
//   && , || , ?? ............... +1   (chaque opérateur de court-circuit)
//   .filter( .find( .some(
//   .every( .findIndex( ........ +1   (prédicat = branche)
//   .map( ...................... +0   (transformation pure, non branchante —
//                                      choix documenté, `--with-map` l'inclut)
//   ?. (chaînage optionnel) .... +0   (trop fréquent, écraserait le signal)
//
// USAGE
//   node scripts/complexity-audit.mjs            # rapport console (top 15)
//   node scripts/complexity-audit.mjs --json     # + ligne JSON machine
//   node scripts/complexity-audit.mjs --top 30   # allonger le classement
//   node scripts/complexity-audit.mjs --with-map # compter aussi .map(

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const SRC = join(ROOT, 'src')

const argv = process.argv.slice(2)
const WITH_MAP = argv.includes('--with-map')
const AS_JSON = argv.includes('--json')
const TOP = (() => {
  const i = argv.indexOf('--top')
  const n = i >= 0 ? Number(argv[i + 1]) : NaN
  return Number.isFinite(n) && n > 0 ? n : 15
})()

// ── 1. Collecte des fichiers ─────────────────────────────────────────────────
// Exclusions : tests (src/test/**) et stories Storybook (outil de dev isolé).
function walk(dir) {
  const out = []
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === 'test' || name === '__tests__' || name === 'node_modules') continue
      out.push(...walk(p))
    } else if (name.endsWith('.stories.jsx') || name.endsWith('.stories.js')) continue
    else if (name.endsWith('.test.js') || name.endsWith('.test.jsx')) continue
    else if (['.js', '.jsx'].includes(extname(p))) out.push(p)
  }
  return out
}

// ── 2. Masquage chaînes / commentaires / regex ───────────────────────────────
// Remplace le contenu non-code par des espaces (longueur et lignes préservées),
// pour que les regex de comptage ne se déclenchent pas sur du texte.
function mask(src) {
  const out = src.split('')
  const blank = (from, to) => {
    for (let k = from; k < to && k < out.length; k++) if (out[k] !== '\n') out[k] = ' '
  }
  let i = 0
  const n = src.length
  // Dernier caractère de code significatif : sert à décider si un `/` ouvre une
  // regex (après un opérateur) ou est une division (après une valeur).
  let prevCode = ''
  while (i < n) {
    const c = src[i]
    const c2 = src[i + 1]
    if (c === '/' && c2 === '/') {                       // commentaire ligne
      let j = i
      while (j < n && src[j] !== '\n') j++
      blank(i, j); i = j; continue
    }
    if (c === '/' && c2 === '*') {                       // commentaire bloc
      let j = i + 2
      while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j++
      blank(i, Math.min(j + 2, n)); i = j + 2; continue
    }
    if (c === '"' || c === "'" || c === '`') {           // chaîne / gabarit
      let j = i + 1
      while (j < n) {
        if (src[j] === '\\') { j += 2; continue }
        if (src[j] === c) break
        j++
      }
      blank(i + 1, j); i = j + 1; prevCode = 'x'; continue
    }
    if (c === '/') {                                     // regex vs division
      // Heuristique : regex si le précédent caractère de code est un opérateur
      // ou un ouvrant. `<` volontairement exclu pour ne pas avaler le JSX
      // fermant (`</div>` → traité comme division, inoffensif).
      const isRegex = prevCode === '' || '(,=:[!&|?{};+-*%^~'.includes(prevCode)
      if (isRegex) {
        let j = i + 1, inClass = false
        while (j < n && src[j] !== '\n') {
          if (src[j] === '\\') { j += 2; continue }
          if (src[j] === '[') inClass = true
          else if (src[j] === ']') inClass = false
          else if (src[j] === '/' && !inClass) break
          j++
        }
        if (j < n && src[j] === '/') { blank(i + 1, j); i = j + 1; prevCode = 'x'; continue }
      }
    }
    if (!/\s/.test(c)) prevCode = c
    i++
  }
  return out.join('')
}

// ── 3. Détection des fonctions ───────────────────────────────────────────────
const KEYWORDS = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'return', 'function', 'else', 'do',
  'typeof', 'await', 'new', 'delete', 'void', 'case', 'in', 'of', 'yield',
])

// Fin d'un corps `{ … }` par comptage d'accolades sur le source masqué.
function matchBrace(masked, openIdx) {
  let depth = 0
  for (let i = openIdx; i < masked.length; i++) {
    if (masked[i] === '{') depth++
    else if (masked[i] === '}') { depth--; if (depth === 0) return i + 1 }
  }
  return masked.length
}

// Fin d'un corps d'arrow concise (`=> expr`) : jusqu'au `;`/`,` de profondeur 0,
// ou au saut de ligne de profondeur 0 (le projet omet les points-virgules, on
// applique donc une règle façon ASI). Une expression peut légitimement courir
// sur plusieurs lignes : on ne coupe pas si la ligne se termine par un
// opérateur, ni si la ligne suivante commence par un continuateur.
const CONT_END = /[+\-*/%=<>&|^,?:.([{]$/
const CONT_START = /^(?:[.?:)\]}]|&&|\|\||\?\?|=>|[+\-*/%<>=]|\b(?:instanceof|in)\b)/
function endOfExpression(masked, from) {
  let p = 0, b = 0, k = 0
  for (let i = from; i < masked.length; i++) {
    const c = masked[i]
    if (c === '(') p++
    else if (c === ')') { if (p === 0) return i; p-- }
    else if (c === '{') b++
    else if (c === '}') { if (b === 0) return i; b-- }
    else if (c === '[') k++
    else if (c === ']') { if (k === 0) return i; k-- }
    else if ((c === ';' || c === ',') && p === 0 && b === 0 && k === 0) return i
    else if (c === '\n' && p === 0 && b === 0 && k === 0) {
      const before = masked.slice(0, i).trimEnd()
      if (CONT_END.test(before)) continue
      const rest = masked.slice(i + 1)
      const next = rest.replace(/^\s+/, '')
      if (next && CONT_START.test(next)) continue
      return i
    }
  }
  return masked.length
}

// Depuis la fin d'un nom de fonction, saute la liste de paramètres puis rend
// l'index du `{` ouvrant le corps.
function bodyStartAfterParams(masked, parenIdx) {
  let depth = 0, i = parenIdx
  for (; i < masked.length; i++) {
    if (masked[i] === '(') depth++
    else if (masked[i] === ')') { depth--; if (depth === 0) { i++; break } }
  }
  while (i < masked.length && /[\s]/.test(masked[i])) i++
  return masked[i] === '{' ? i : -1
}

function findFunctions(masked, file) {
  const found = []
  const push = (name, kind, start, end) => {
    if (end > start) found.push({ name, kind, start, end })
  }

  // a) déclarations `function foo(…) {` (y compris async / générateurs)
  for (const m of masked.matchAll(/(?:^|[\s;}(,=:[])(?:async\s+)?function\s*\*?\s*([A-Za-z0-9_$]*)\s*\(/g)) {
    const parenIdx = masked.indexOf('(', m.index + m[0].length - 1)
    const bodyIdx = bodyStartAfterParams(masked, parenIdx)
    if (bodyIdx < 0) continue
    push(m[1] || '(anonyme)', 'function', m.index, matchBrace(masked, bodyIdx))
  }

  // b) arrows nommées : `const foo = (…) => …` / `const foo = async x => …`
  for (const m of masked.matchAll(
    /\b(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s+)?(?:\([^()]*\)|[A-Za-z0-9_$]+)\s*=>/g)) {
    const after = m.index + m[0].length
    let j = after
    while (j < masked.length && /\s/.test(masked[j])) j++
    const end = masked[j] === '{' ? matchBrace(masked, j) : endOfExpression(masked, j)
    push(m[1], 'arrow', m.index, end)
  }

  // c) arrows enveloppées dans useCallback/useMemo (très fréquent en React)
  for (const m of masked.matchAll(
    /\b(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:React\.)?use(?:Callback|Memo)\s*\(\s*(?:async\s+)?(?:\([^()]*\)|[A-Za-z0-9_$]+)\s*=>/g)) {
    const after = m.index + m[0].length
    let j = after
    while (j < masked.length && /\s/.test(masked[j])) j++
    const end = masked[j] === '{' ? matchBrace(masked, j) : endOfExpression(masked, j)
    push(m[1], 'hook', m.index, end)
  }

  // d) méthodes abrégées d'objet/classe : `foo(a, b) {`
  for (const m of masked.matchAll(/(?:^|\n)[ \t]*(?:async\s+)?([A-Za-z0-9_$]+)\s*\(([^()]*)\)\s*\{/g)) {
    if (KEYWORDS.has(m[1])) continue
    const bodyIdx = masked.indexOf('{', m.index + m[0].length - 1)
    push(m[1], 'method', m.index, matchBrace(masked, bodyIdx))
  }

  // Dédoublonnage (une même fonction peut matcher deux motifs) : on garde la
  // plus grande étendue pour un même index de départ approximatif.
  const byKey = new Map()
  for (const f of found) {
    const key = `${f.name}@${f.end}`
    const prev = byKey.get(key)
    if (!prev || f.start < prev.start) byKey.set(key, f)
  }
  return [...byKey.values()].map(f => ({ ...f, file }))
}

// ── 4. Comptage des points de décision ───────────────────────────────────────
const RULES = [
  ['if', /\bif\s*\(/g],
  ['for', /\bfor\s*\(/g],
  ['while', /\bwhile\s*\(/g],
  ['case', /\bcase\b/g],
  ['catch', /\bcatch\s*[({]/g],
  ['&&', /&&/g],
  ['||', /\|\|/g],
  ['??', /\?\?/g],
  ['predicate', /\.(?:filter|find|findIndex|some|every)\s*\(/g],
]
if (WITH_MAP) RULES.push(['map', /\.map\s*\(/g])

function complexity(body) {
  const detail = {}
  let score = 1
  for (const [label, re] of RULES) {
    const n = [...body.matchAll(re)].length
    if (n) { detail[label] = n; score += n }
  }
  // Ternaires : un `?` qui n'est ni `??`, ni `?.`, ni la 2ᵉ moitié d'un `??`.
  let ternary = 0
  for (let i = 0; i < body.length; i++) {
    if (body[i] !== '?') continue
    if (body[i + 1] === '?' || body[i + 1] === '.') { i++; continue }
    if (body[i - 1] === '?') continue
    ternary++
  }
  if (ternary) { detail['?:'] = ternary; score += ternary }
  return { total: score, detail }
}

// ── 5. Analyse ───────────────────────────────────────────────────────────────
const files = walk(SRC)
const fns = []
const perFile = []
for (const file of files) {
  const src = readFileSync(file, 'utf8')
  const masked = mask(src)
  // Table de conversion index → ligne
  const lineOf = idx => src.slice(0, idx).split('\n').length
  const local = findFunctions(masked, file)
  let fileScore = 0
  for (const f of local) {
    const { total, detail } = complexity(masked.slice(f.start, f.end))
    const rec = {
      name: f.name,
      kind: f.kind,
      file: relative(ROOT, file),
      line: lineOf(f.start),
      lines: src.slice(f.start, f.end).split('\n').length,
      score: total,
      detail,
    }
    fns.push(rec)
    fileScore += total
  }
  perFile.push({
    file: relative(ROOT, file),
    lines: src.split('\n').length,
    fns: local.length,
    sum: fileScore,
  })
}

fns.sort((a, b) => b.score - a.score || b.lines - a.lines)
const top = fns.slice(0, TOP)

// ── 6. Rapport ───────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s).padEnd(n)
const bandOf = s => (s >= 50 ? 'CRITIQUE' : s >= 25 ? 'élevée  ' : s >= 11 ? 'modérée ' : 'faible  ')
const bar = s => '█'.repeat(Math.min(24, Math.round(s / 4))).padEnd(24, '░')

const buckets = { faible: 0, modérée: 0, élevée: 0, critique: 0 }
for (const f of fns) {
  if (f.score >= 50) buckets.critique++
  else if (f.score >= 25) buckets.élevée++
  else if (f.score >= 11) buckets.modérée++
  else buckets.faible++
}

console.log('\n╭─ Cantou · Complexité cyclomatique JS/JSX (heuristique textuelle) ──╮')
console.log(`│ ${pad(`Fichiers : ${files.length}   ·   Fonctions analysées : ${fns.length}`, 66)}│`)
console.log('│ ⚠ Heuristique regex sur source masqué, PAS un AST. Les scores sont │')
console.log('│   des ordres de grandeur comparables entre eux, pas du McCabe      │')
console.log('│   canonique. Les fonctions imbriquées comptent aussi dans leur     │')
console.log('│   englobante (voulu). Sert à CLASSER des cibles de refactor.       │')
console.log('╰────────────────────────────────────────────────────────────────────╯\n')

console.log(`  TOP ${TOP} des fonctions les plus complexes\n`)
console.log('   #  ' + pad('fonction', 26) + pad('fichier:ligne', 34) + 'lignes  score')
console.log('   ' + '─'.repeat(76))
top.forEach((f, i) => {
  console.log(
    '  ' + String(i + 1).padStart(2) + '  ' +
    pad(f.name, 26) +
    pad(`${f.file}:${f.line}`, 34) +
    String(f.lines).padStart(5) + '  ' +
    String(f.score).padStart(5) + '  ' + bandOf(f.score)
  )
})

console.log('\n  Détail des points de décision (top 5)')
top.slice(0, 5).forEach(f => {
  const d = Object.entries(f.detail).map(([k, v]) => `${k}×${v}`).join(' ')
  console.log(`   ${pad(f.name, 24)} ${bar(f.score)} ${String(f.score).padStart(4)}   ${d}`)
})

console.log('\n  Répartition : ' +
  `faible (<11) ${buckets.faible}  ·  modérée (11-24) ${buckets.modérée}  ·  ` +
  `élevée (25-49) ${buckets.élevée}  ·  CRITIQUE (≥50) ${buckets.critique}`)

const topFiles = [...perFile].sort((a, b) => b.sum - a.sum).slice(0, 5)
console.log('\n  Fichiers les plus chargés (somme des scores)')
topFiles.forEach(f =>
  console.log(`   ${pad(f.file, 34)} ${String(f.lines).padStart(5)} lignes  ${String(f.fns).padStart(3)} fn  Σ${f.sum}`))

console.log(`\n  Méthode : voir l'en-tête de scripts/complexity-audit.mjs.`)
console.log(`  ${WITH_MAP ? '.map( COMPTÉ (--with-map)' : '.map( non compté (transformation pure) ; --with-map pour l\'inclure'}`)
console.log('  Rappel : `cgc analyze complexity` ne mesure PAS le JS sur ce projet')
console.log('  (complexité Python uniquement) — utiliser ce script à la place.\n')

if (AS_JSON) {
  console.log('JSON ' + JSON.stringify({
    files: files.length,
    functions: fns.length,
    buckets,
    top: top.map(f => ({ name: f.name, file: f.file, line: f.line, lines: f.lines, score: f.score, detail: f.detail })),
  }))
}

process.exit(0)
