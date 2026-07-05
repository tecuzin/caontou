#!/usr/bin/env node
// Fusionne les fichiers de couverture V8 bruts écrits par e2e/fixtures.js
// (un par test) et affiche un résumé par fichier.
//
// Métrique : % de fonctions réellement invoquées au moins une fois
// (équivalent de la colonne "% Funcs" de Vitest/Istanbul). On évite
// volontairement une reconstruction "byte range" façon Chrome DevTools :
// les ranges V8 sont imbriquées (une range enfant à count=0 peut être
// contenue dans une range parente à count>0), et un merge naïf des
// ranges "count>0" surcompte largement — chaque fonction a en revanche
// une range de tête (ranges[0]) dont le count reflète fidèlement le
// nombre d'appels de cette fonction, sans ambiguïté d'imbrication.
import fs from 'fs'
import path from 'path'

const RAW_DIR = 'coverage-e2e/raw'

if (!fs.existsSync(RAW_DIR)) {
  console.error(`Aucun fichier de couverture trouvé dans ${RAW_DIR} — lance d'abord "npm run test:e2e:coverage".`)
  process.exit(1)
}

const files = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith('.json'))
// url -> Map(functionKey -> called:boolean)
const byUrl = new Map()

for (const f of files) {
  const entries = JSON.parse(fs.readFileSync(path.join(RAW_DIR, f), 'utf8'))
  for (const entry of entries) {
    if (!byUrl.has(entry.url)) byUrl.set(entry.url, new Map())
    const fnMap = byUrl.get(entry.url)
    for (const fn of entry.functions) {
      const head = fn.ranges[0]
      if (!head) continue
      const key = `${fn.functionName || '(anonymous)'}:${head.startOffset}`
      const calledBefore = fnMap.get(key) || false
      fnMap.set(key, calledBefore || head.count > 0)
    }
  }
}

const rows = []
let totalFns = 0
let totalCalled = 0

for (const [url, fnMap] of byUrl) {
  const relPath = url.replace(/^.*\/src\//, 'src/').split('?')[0]
  const fns = [...fnMap.values()]
  const called = fns.filter(Boolean).length
  totalFns += fns.length
  totalCalled += called
  rows.push({ file: relPath, pct: fns.length ? (called / fns.length * 100) : 0, called, total: fns.length })
}

rows.sort((a, b) => a.file.localeCompare(b.file))

console.log('\nCouverture E2E (Playwright) — % de fonctions invoquées par fichier\n')
console.log('File'.padEnd(30), 'Coverage')
console.log('-'.repeat(55))
for (const r of rows) {
  console.log(r.file.padEnd(30), `${r.pct.toFixed(2)}%`.padStart(8), ` (${r.called}/${r.total} fns)`)
}
console.log('-'.repeat(55))
const overall = totalFns ? (totalCalled / totalFns * 100) : 0
console.log('TOTAL'.padEnd(30), `${overall.toFixed(2)}%`.padStart(8), ` (${totalCalled}/${totalFns} fns)`)
