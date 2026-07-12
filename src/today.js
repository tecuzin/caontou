import { tripDate } from './utils.js'

/**
 * Tableau de bord « Aujourd'hui » — actif si `now` tombe dans la fenêtre du
 * voyage. Retrouve le jour de planning par date calendaire réelle (mois/année
 * dérivés de `trip.start`), puis la météo par numéro de jour et le repas par
 * libellé `"dow num"`. Fonction pure (extraite d'App.jsx) — `now` injectable
 * pour les tests. Renvoie `null` hors séjour ou si le jour n'est pas au planning.
 */
export function computeToday(trip, days, meteo, meals, now = new Date()) {
  const start = tripDate(trip.start, 0)
  const end = tripDate(trip.end, 23, 59)
  if (now < start || now > end) return null
  const [ty, tm] = trip.start.split('-').map(Number)
  const dayIdx = days.findIndex((d) => {
    const dd = new Date(ty, tm - 1, d.num)
    return dd.getFullYear() === now.getFullYear() && dd.getMonth() === now.getMonth() && dd.getDate() === now.getDate()
  })
  if (dayIdx === -1) return null
  const d = days[dayIdx]
  const w = meteo.find((m) => m.n === d.num) || null
  const meal = meals.find((m) => m.day === `${d.dow} ${d.num}`) || null
  return { dayIdx, d, w, meal }
}
