/**
 * Progression par enfant — socle commun au bingo, aux défis et aux badges.
 *
 * ── Forme des données (schéma ≥ 5) ──────────────────────────────────────────
 *   bingo:          { [prénom]: { [index de case]: true } }
 *   challengesDone: { [prénom]: { [jour 'YYYY-MM-DD']: true } }
 *
 * Avant le schéma 5, ces deux champs étaient PLATS et globaux à la famille :
 *   bingo:          { 0: true, 5: true }
 *   challengesDone: { '2026-08-07': true }
 *
 * La progression historique, non attribuable à un enfant, est rattachée à la
 * clé de repli FAMILY_KEY (« Famille »). C'est aussi le bucket utilisé quand
 * aucun prénom n'est fourni → les appelants existants continuent de marcher.
 *
 * Tous les lecteurs de ce module sont TOLÉRANTS : ils acceptent aussi bien la
 * forme plate héritée que la forme par enfant, et même un mélange des deux
 * (cas d'un store migré mais réécrit par une ancienne version de l'UI). Les
 * clés plates rencontrées sont toujours interprétées comme appartenant à
 * FAMILY_KEY. Aucune donnée n'est donc jamais perdue ni ignorée.
 *
 * Module pur, hors-ligne, zéro dépendance.
 */

/** Clé de repli : progression non attribuée à un enfant nommé. */
export const FAMILY_KEY = 'Famille'

const isBucket = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/** Nom d'enfant nettoyé, avec repli sur FAMILY_KEY. */
export function childKey(child) {
  const clean = typeof child === 'string' ? child.trim() : ''
  return clean || FAMILY_KEY
}

/**
 * True si la valeur est déjà à la forme « par enfant » (aucune clé plate).
 * Un objet vide est considéré comme déjà à la nouvelle forme (rien à migrer).
 */
export function isPerChild(raw) {
  if (!isBucket(raw)) return false
  return Object.values(raw).every(isBucket)
}

/**
 * Normalise n'importe quelle forme (plate, par enfant, mixte) vers
 * `{ [prénom]: { [clé]: valeur } }`. Les clés plates atterrissent dans
 * FAMILY_KEY. Non destructif : rien n'est jamais écarté.
 */
export function normalizeProgress(raw) {
  if (!isBucket(raw)) return {}
  const out = {}
  for (const [k, v] of Object.entries(raw)) {
    if (isBucket(v)) {
      out[k] = { ...(out[k] || {}), ...v }
    } else {
      out[FAMILY_KEY] = { ...(out[FAMILY_KEY] || {}), [k]: v }
    }
  }
  return out
}

/** Progression plate `{ clé: valeur }` d'un enfant (repli FAMILY_KEY). */
export function childProgress(raw, child) {
  return normalizeProgress(raw)[childKey(child)] || {}
}

/** Liste des prénoms présents dans la progression (ordre d'apparition). */
export function childNames(raw) {
  return Object.keys(normalizeProgress(raw))
}

/**
 * Écrit une entrée pour un enfant. Retourne un NOUVEAU store de progression à
 * la forme par enfant (l'entrée est supprimée si `value` est falsy).
 */
export function setChildEntry(raw, child, key, value = true) {
  const next = normalizeProgress(raw)
  const name = childKey(child)
  const bucket = { ...(next[name] || {}) }
  if (value) bucket[key] = value
  else delete bucket[key]
  next[name] = bucket
  return next
}

/** Bascule une entrée (true ↔ absente) pour un enfant. */
export function toggleChildEntry(raw, child, key) {
  const current = childProgress(raw, child)[key]
  return setChildEntry(raw, child, key, !current)
}

/** Nombre d'entrées vraies d'un enfant. */
export function countChildEntries(raw, child) {
  return Object.values(childProgress(raw, child)).filter(Boolean).length
}
