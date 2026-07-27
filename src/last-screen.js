/* ------------------------------------------------------------------ *
 * Reprise du dernier écran — en vacances, on ouvre l'app par à-coups
 * (une main libre, l'autre tient un enfant). Repartir systématiquement de
 * l'accueil oblige à re-naviguer à chaque fois.
 *
 * Purement local à l'appareil (comme les thèmes) : ce n'est pas une
 * donnée de séjour, ça n'a rien à faire dans l'export JSON.
 * ------------------------------------------------------------------ */

const KEY = 'cantou.lastScreen'
/** Au-delà, on repart de l'accueil : reprendre un écran d'il y a 3 jours n'a pas de sens. */
export const RESUME_MAX_AGE_MS = 6 * 60 * 60 * 1000 // 6 h

/**
 * Décide de l'écran de reprise. Pur, donc testable.
 * @param {{tab?:string, sub?:string|null, at?:number}|null} saved
 * @param {number} now
 * @param {string[]} validTabs
 * @returns {{tab:string, sub:string|null}|null} null = repartir de l'accueil
 */
export function resumeTarget(saved, now = Date.now(), validTabs = []) {
  if (!saved || typeof saved !== 'object') return null
  const { tab, sub, at } = saved
  if (!tab || !validTabs.includes(tab)) return null
  if (!Number.isFinite(at) || now - at > RESUME_MAX_AGE_MS || at > now) return null
  // L'accueil sans sous-écran est déjà l'état par défaut : rien à restaurer.
  if (tab === 'accueil' && !sub) return null
  return { tab, sub: sub || null }
}

/** Lit l'écran mémorisé. `null` si absent ou illisible. */
export function readLastScreen() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/** Mémorise l'écran courant. Silencieux en cas d'échec. */
export function writeLastScreen(tab, sub) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ tab, sub: sub || null, at: Date.now() }))
  } catch { /* quota plein : la reprise est un confort, pas une donnée */ }
}
