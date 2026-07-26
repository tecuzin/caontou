/* ------------------------------------------------------------------ *
 * Toise de vacances — logique pure (testable, sans React ni DOM).
 *
 * Rituel familial : on mesure les enfants pendant le séjour et on garde une
 * trace horodatée. Une mesure vaut :
 *   { id: number, name: string, cm: number, date: 'YYYY-MM-DD' }
 *
 * Toutes les fonctions sont pures et immuables : elles renvoient une NOUVELLE
 * liste et ne mutent jamais l'entrée. Une saisie invalide renvoie la liste
 * inchangée (même référence) — l'écran peut donc comparer par identité.
 * ------------------------------------------------------------------ */

/** Bornes plausibles d'une taille humaine mesurée à la toise (cm). */
export const HEIGHT_MIN_CM = 30
export const HEIGHT_MAX_CM = 250

/** Date du jour au format ISO court (`YYYY-MM-DD`), en heure locale. */
export function todayIso(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

/** True si `date` est une date calendaire réelle au format `YYYY-MM-DD`. */
export function isValidHeightDate(date) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date ?? ''))
  if (!m) return false
  const [, y, mo, d] = m.map(Number)
  const dt = new Date(y, mo - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d
}

/** True si `cm` est un nombre exploitable dans les bornes de la toise. */
export function isValidHeightCm(cm) {
  const n = Number(cm)
  return Number.isFinite(n) && n >= HEIGHT_MIN_CM && n <= HEIGHT_MAX_CM
}

/**
 * Normalise une saisie en mesure valide, ou `null` si elle ne l'est pas.
 * Le prénom est « trimé » ; `cm` est converti en nombre (arrondi au mm).
 */
export function normalizeHeight({ name, cm, date } = {}) {
  const clean = String(name ?? '').trim()
  if (!clean) return null
  if (!isValidHeightCm(cm)) return null
  if (!isValidHeightDate(date)) return null
  return { name: clean, cm: Math.round(Number(cm) * 10) / 10, date: String(date) }
}

/** Identifiant unique, stable dans la liste même en cas d'ajouts rapprochés. */
function nextId(list) {
  let id = Date.now()
  const used = new Set((list || []).map((m) => m.id))
  while (used.has(id)) id += 1
  return id
}

/**
 * Ajoute une mesure. Renvoie une NOUVELLE liste, ou la liste **inchangée**
 * si la saisie est invalide (prénom vide, cm hors 30–250, date incorrecte).
 * @param {Array} list
 * @param {{name:string, cm:number|string, date:string}} entry
 */
export function addHeight(list, entry) {
  const base = Array.isArray(list) ? list : []
  const clean = normalizeHeight(entry)
  if (!clean) return list
  return [...base, { id: nextId(base), ...clean }]
}

/** Supprime une mesure par id (immuable). */
export function removeHeight(list, id) {
  const base = Array.isArray(list) ? list : []
  return base.filter((m) => m.id !== id)
}

/**
 * Regroupe les mesures par enfant.
 * @returns {Array<{name:string, measures:Array}>} enfants triés par prénom
 *   (alphabétique, insensible à la casse et aux accents), mesures triées par
 *   date croissante. Le regroupement ignore la casse ; le libellé retenu est
 *   celui de la première mesure rencontrée pour cet enfant.
 */
export function groupByChild(list) {
  const base = Array.isArray(list) ? list : []
  const byKey = new Map()
  for (const m of base) {
    if (!m || !m.name) continue
    const key = String(m.name).trim().toLocaleLowerCase('fr-FR')
    if (!key) continue
    if (!byKey.has(key)) byKey.set(key, { name: String(m.name).trim(), measures: [] })
    byKey.get(key).measures.push(m)
  }
  return [...byKey.values()]
    .map((c) => ({ ...c, measures: [...c.measures].sort((a, b) => String(a.date).localeCompare(String(b.date))) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr-FR'))
}

/**
 * Croissance entre la première et la dernière mesure d'un enfant (cm).
 * @param {Array<{cm:number, date:string}>} measures  (ordre indifférent)
 * @returns {number} 0 si moins de deux mesures. Arrondi au mm.
 */
export function growthSince(measures) {
  const base = Array.isArray(measures) ? measures : []
  if (base.length < 2) return 0
  const sorted = [...base].sort((a, b) => String(a.date).localeCompare(String(b.date)))
  const diff = Number(sorted[sorted.length - 1].cm) - Number(sorted[0].cm)
  return Number.isFinite(diff) ? Math.round(diff * 10) / 10 : 0
}
