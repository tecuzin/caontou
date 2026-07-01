/**
 * Parse CSS shorthand string into a React style object.
 * e.g. "color:red;font-size:14px" → { color: 'red', fontSize: '14px' }
 */
export function s(css) {
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

/**
 * Format a number as euros (French locale).
 */
export const eur = (n) =>
  Number(n).toLocaleString('fr-FR', { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 }) + ' €'

/**
 * Build a checkbox list with stats.
 */
export function buildList(checks, key, items) {
  const mapped = items.map((l) => ({ label: l, checked: !!(checks[key] && checks[key][l]) }))
  const done = mapped.filter((x) => x.checked).length
  return { items: mapped, done, total: mapped.length, pct: Math.round(mapped.length ? (done / mapped.length) * 100 : 0) }
}

/**
 * Sort planning activities by time string (HH:MM). Non-time entries go last.
 */
export function sortItemsByTime(items) {
  const toMin = (t) => {
    const m = t.match(/(\d{1,2}):(\d{2})/)
    return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 9999
  }
  return [...items].sort((a, b) => toMin(a.time) - toMin(b.time))
}

/**
 * Parse a distance string (e.g. "25 min") to integer minutes.
 */
export function parseDist(d) {
  const m = String(d).match(/\d+/)
  return m ? parseInt(m[0]) : 999
}
