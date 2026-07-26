/* ------------------------------------------------------------------ *
 * Occupation du stockage local — mesurer AVANT la panne.
 *
 * Deux espaces distincts, à ne pas confondre :
 *  · le store `cantou.v1` en localStorage (texte, quota navigateur ~5 Mo) ;
 *  · les photos en Filesystem (Directory.Data), sans quota strict mais
 *    limitées par l'espace disque du téléphone.
 *
 * Les fonctions de CALCUL sont pures et testables ; la lecture des tailles
 * réelles est isolée dans `measureStorage` (I/O).
 * ------------------------------------------------------------------ */

/** Budget indicatif du store texte : quota localStorage usuel (~5 Mo). */
export const STORE_BUDGET_BYTES = 5 * 1024 * 1024
/** Au-delà, on alerte (l'échec d'écriture n'est plus loin). */
export const WARN_RATIO = 0.8

/** Poids en octets d'une chaîne UTF-16 telle que stockée par localStorage. */
export function stringBytes(str) {
  if (typeof str !== 'string') return 0
  // localStorage stocke en UTF-16 : 2 octets par unité de code.
  return str.length * 2
}

/** Taille lisible par un humain (« 1,4 Mo »). */
export function formatBytes(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1024) return `${Math.round(n)} o`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`
  return `${(n / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

/**
 * Niveau d'occupation du store texte.
 * @returns {{ pct:number, level:'ok'|'warn'|'full', advice:string }}
 */
export function storeStatus(bytes, budget = STORE_BUDGET_BYTES) {
  const safeBudget = budget > 0 ? budget : STORE_BUDGET_BYTES
  const pct = Math.min(100, Math.round((Math.max(0, bytes) / safeBudget) * 100))
  if (pct >= 100) {
    return { pct, level: 'full', advice: 'Sauvegarde impossible : exporte puis supprime d’anciennes données.' }
  }
  if (pct >= WARN_RATIO * 100) {
    return { pct, level: 'warn', advice: 'Bientôt plein : exporte ta sauvegarde, puis allège (vieilles dépenses, journal).' }
  }
  return { pct, level: 'ok', advice: 'Il reste de la place.' }
}

/** Poids total des photos, à partir de leurs tailles individuelles. */
export function photosBytes(sizes = []) {
  return sizes.reduce((sum, n) => sum + (Number.isFinite(n) && n > 0 ? n : 0), 0)
}

/**
 * Mesure réelle (I/O). Dégrade en valeurs neutres si l'environnement ne
 * fournit pas ce qu'il faut — jamais d'exception à l'appelant.
 * @param {object} deps  { storeKey, photos, statFile } — `statFile(path)`
 *   renvoie une taille en octets (injecté pour rester testable).
 */
export async function measureStorage({ storeKey = 'cantou.v1', photos = [], statFile } = {}) {
  let storeBytes = 0
  try {
    storeBytes = stringBytes(localStorage.getItem(storeKey) || '')
  } catch { storeBytes = 0 }

  const sizes = []
  if (typeof statFile === 'function') {
    for (const p of photos) {
      try {
        const size = await statFile(p.file)
        if (Number.isFinite(size)) sizes.push(size)
      } catch { /* photo illisible : ignorée */ }
    }
  }

  return {
    storeBytes,
    photosBytes: photosBytes(sizes),
    photosCount: photos.length,
    ...storeStatus(storeBytes),
  }
}
