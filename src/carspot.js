// ── Mémo voiture « où on s'est garé » ─────────────────────────────────────────
//
// Mémorise un point (lat/lng + horodatage) pour retrouver la voiture sur les
// grands parkings (Le Lioran, Puy Mary…). Le lien Maps réel est délégué à l'OS
// (links.js) ; ici, uniquement du formatage pur et testable.

/** Deux chiffres. */
const pad = (n) => String(n).padStart(2, '0')

/**
 * Libellé « garée » à afficher : heure du jour, ou « hier »/date si plus vieux.
 * @param {number} at  timestamp (ms) de la mise en mémoire
 * @param {Date}   now
 */
export function formatParkedAt(at, now = new Date()) {
  if (!at) return ''
  const d = new Date(at)
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (sameDay(d, now)) return `Garée à ${hm}`
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (sameDay(d, yesterday)) return `Garée hier à ${hm}`
  return `Garée le ${pad(d.getDate())}/${pad(d.getMonth() + 1)} à ${hm}`
}

/** Vrai si le point mémorisé est exploitable (coords numériques valides). */
export function hasCarSpot(spot) {
  return !!(spot && Number.isFinite(spot.lat) && Number.isFinite(spot.lng))
}
