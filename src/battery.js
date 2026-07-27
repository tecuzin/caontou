/* ------------------------------------------------------------------ *
 * Alerte batterie faible — en rando, le téléphone porte le planning, la
 * carte hors-ligne et les photos. Tomber à plat sans prévenir, c'est
 * perdre la note en cours et le moyen de retrouver la voiture.
 *
 * Les seuils et messages sont PURS (testables) ; la lecture du niveau
 * réel est isolée (`readBattery`) et dégrade silencieusement — l'API
 * Battery n'existe pas partout (Safari, WebView selon la version).
 * ------------------------------------------------------------------ */

/** En dessous, on alerte franchement. */
export const BATTERY_LOW = 0.2
/** En dessous, on prévient discrètement. */
export const BATTERY_WARN = 0.35

/**
 * Niveau d'alerte pour un état de batterie donné.
 * @param {number} level   0 → 1
 * @param {boolean} charging
 * @returns {{ level:'ok'|'warn'|'low', pct:number, message:string }|null}
 *   `null` quand il n'y a rien à dire (batterie confortable ou en charge).
 */
export function batteryStatus(level, charging = false) {
  const n = Number(level)
  if (!Number.isFinite(n) || n < 0 || n > 1) return null
  const pct = Math.round(n * 100)
  // En charge : aucune raison d'inquiéter, même à 5 %.
  if (charging) return null
  if (n <= BATTERY_LOW) {
    return { level: 'low', pct, message: `Batterie à ${pct} % — pense à noter l’essentiel ou à recharger.` }
  }
  if (n <= BATTERY_WARN) {
    return { level: 'warn', pct, message: `Batterie à ${pct} % — la carte et les photos consomment.` }
  }
  return null
}

/**
 * Lit l'état réel de la batterie. Renvoie `null` si l'API n'est pas
 * disponible — jamais d'exception à l'appelant.
 * @returns {Promise<{ level:number, charging:boolean }|null>}
 */
export async function readBattery() {
  try {
    if (typeof navigator === 'undefined' || typeof navigator.getBattery !== 'function') return null
    const b = await navigator.getBattery()
    if (!b || typeof b.level !== 'number') return null
    return { level: b.level, charging: !!b.charging }
  } catch {
    return null
  }
}
