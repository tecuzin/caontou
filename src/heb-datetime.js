/* ------------------------------------------------------------------ *
 * Arrivée / départ de l'hébergement — composition d'une chaîne lisible
 * (« Mer 5 · dès 16:00 ») à partir d'une date ISO + heure + qualificatif.
 * Pure & testable. Le stockage garde les champs structurés (arriveeDate,
 * arriveeTime, …) ET la chaîne composée (arrivee/depart) pour l'affichage.
 * ------------------------------------------------------------------ */

/**
 * @param {string} dateIso  "YYYY-MM-DD" (d'un `<input type="date">`)
 * @param {string} time     "HH:MM" (d'un `<input type="time">`), optionnel
 * @param {string} qualifier "dès" | "avant" | "" (préfixe de l'heure)
 * @returns {string} ex. "Mer 5 · dès 16:00" ; "" si date absente/invalide.
 */
export function composeHebMoment(dateIso, time = '', qualifier = '') {
  if (!dateIso) return ''
  const d = new Date(`${dateIso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  let day = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }).replace('.', '')
  day = day.charAt(0).toUpperCase() + day.slice(1)
  if (!time) return day
  return `${day} · ${qualifier ? `${qualifier} ` : ''}${time}`
}
