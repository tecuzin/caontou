/* ------------------------------------------------------------------ *
 * Taille de texte ajustable — confort de lecture (yeux fatigués, soleil,
 * grands-parents). Même mécanique que les thèmes (`theme.js`) : on
 * transforme la chaîne CSS AVANT son parsing par `s()`, plutôt que de
 * réécrire des centaines d'appels (ADR-006).
 *
 * Seuls les `font-size:Npx` sont touchés : ni les rayons, ni les
 * paddings, ni les largeurs — agrandir le texte ne doit pas déformer la
 * mise en page.
 * ------------------------------------------------------------------ */

/** Paliers proposés à l'utilisateur. */
export const TEXT_SCALES = [
  { key: 'normal', factor: 1, label: 'Normal' },
  { key: 'grand', factor: 1.15, label: 'Grand' },
  { key: 'tresGrand', factor: 1.3, label: 'Très grand' },
]

/** Facteur d'un palier (1 si la clé est inconnue). */
export function scaleFactor(key) {
  return (TEXT_SCALES.find((s) => s.key === key) || TEXT_SCALES[0]).factor
}

const CACHE = new Map()

/**
 * Applique un facteur d'échelle aux tailles de police d'une chaîne CSS.
 * Facteur 1 (ou invalide) → chaîne rendue telle quelle.
 * @param {string} css
 * @param {number} factor
 */
export function applyTextScale(css, factor = 1) {
  if (typeof css !== 'string') return css
  const f = Number(factor)
  if (!Number.isFinite(f) || f <= 0 || f === 1) return css

  const cacheKey = `${f}|${css}`
  const hit = CACHE.get(cacheKey)
  if (hit !== undefined) return hit

  // `font-size:` uniquement — `border-radius`, `padding`, `width`… intacts.
  const out = css.replace(/font-size:(\d+(?:\.\d+)?)px/g, (_, n) => {
    const scaled = Math.max(1, Math.round(parseFloat(n) * f))
    return `font-size:${scaled}px`
  })

  if (CACHE.size > 4000) CACHE.clear()
  CACHE.set(cacheKey, out)
  return out
}
