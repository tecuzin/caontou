import { eur, parseDist, buildList, sortItemsByTime, tripDate, fmtDayShort, fmtMonthYear } from './utils.js'
import { buildExport, exportFilename, parseImport, formatLastBackup } from './backup.js'
import { applyDarkTheme } from './theme.js'

/**
 * Auto-diagnostic embarqué dans l'app — un sous-ensemble d'assertions
 * réécrites pour tourner en JS pur dans la WebView, PAS les suites Vitest/
 * Playwright/Appium elles-mêmes (celles-ci nécessitent Node.js/jsdom ou un
 * driver externe, incompatibles avec une WebView de production — voir
 * skill `release`). Objectif : donner une confiance rapide directement sur
 * le téléphone, sans remplacer les vraies suites de tests avant un build.
 */

const check = (name, fn) => {
  try {
    const detail = fn()
    return { name, pass: true, detail: detail || 'OK' }
  } catch (e) {
    return { name, pass: false, detail: e.message || String(e) }
  }
}

const assert = (cond, msg) => { if (!cond) throw new Error(msg || 'assertion échouée') }

export function runSelfTests() {
  const results = []

  results.push(check('eur() formate en euros', () => {
    assert(eur(12) === '12 €', `eur(12) = "${eur(12)}"`)
    assert(eur(12.5) === '12,50 €', `eur(12.5) = "${eur(12.5)}"`)
  }))

  results.push(check('parseDist() extrait les minutes', () => {
    assert(parseDist('25 min') === 25, `parseDist('25 min') = ${parseDist('25 min')}`)
    assert(parseDist('') === 999, `parseDist('') = ${parseDist('')}`)
  }))

  results.push(check('buildList() calcule les stats de progression', () => {
    const r = buildList({ k: { a: true } }, 'k', ['a', 'b'])
    assert(r.done === 1 && r.total === 2 && r.pct === 50, `done=${r.done} total=${r.total} pct=${r.pct}`)
  }))

  results.push(check('sortItemsByTime() trie par heure croissante', () => {
    const r = sortItemsByTime([{ time: '14:00' }, { time: '09:00' }])
    assert(r[0].time === '09:00' && r[1].time === '14:00', `ordre obtenu: ${r.map(x => x.time).join(',')}`)
  }))

  results.push(check('tripDate()/fmtDayShort()/fmtMonthYear() ne plantent pas', () => {
    const d = tripDate('2026-08-05')
    assert(d.getFullYear() === 2026 && d.getMonth() === 7 && d.getDate() === 5, 'date mal construite')
    assert(typeof fmtDayShort('2026-08-05') === 'string' && fmtDayShort('2026-08-05').length > 0, 'fmtDayShort vide')
    assert(typeof fmtMonthYear('2026-08-05') === 'string' && fmtMonthYear('2026-08-05').length > 0, 'fmtMonthYear vide')
  }))

  results.push(check('buildExport()/parseImport() round-trip', () => {
    const json = buildExport({ trip: { origin: 'Beauvais' } }, 1)
    const { data, error } = parseImport(json)
    assert(!error, `erreur inattendue: ${error}`)
    assert(data && data.trip && data.trip.origin === 'Beauvais', 'données perdues au round-trip')
  }))

  results.push(check('parseImport() rejette un JSON invalide', () => {
    const { error } = parseImport('{ceci-nest-pas-du-json')
    assert(!!error, 'aurait dû retourner une erreur')
  }))

  results.push(check('exportFilename() est horodaté et .json', () => {
    const name = exportFilename(new Date('2026-08-05T10:30:00Z'))
    assert(name.startsWith('cantou-export-') && name.endsWith('.json'), `nom obtenu: ${name}`)
  }))

  results.push(check('formatLastBackup() gère les cas jamais/aujourd\'hui/N jours', () => {
    const now = new Date('2026-08-10T12:00:00Z')
    assert(formatLastBackup(null, now) === 'jamais', 'cas "jamais" incorrect')
    assert(formatLastBackup(new Date('2026-08-10T08:00:00Z').toISOString(), now) === "aujourd'hui", 'cas "aujourd\'hui" incorrect')
    assert(formatLastBackup(new Date('2026-08-05T08:00:00Z').toISOString(), now) === 'il y a 5 jours', 'cas "il y a N jours" incorrect')
  }))

  results.push(check('applyDarkTheme() substitue les couleurs connues', () => {
    const out = applyDarkTheme('background:#f4ecdc;color:#2f2a22;')
    assert(out.includes('#1c1a16') && out.includes('#f3ecda'), `résultat: ${out}`)
  }))

  results.push(check('localStorage : écriture/lecture/suppression', () => {
    const key = '__cantou_selftest__'
    window.localStorage.setItem(key, 'ok')
    assert(window.localStorage.getItem(key) === 'ok', 'lecture après écriture a échoué')
    window.localStorage.removeItem(key)
    assert(window.localStorage.getItem(key) === null, 'suppression a échoué')
  }))

  return results
}
