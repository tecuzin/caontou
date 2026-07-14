import { tripDate } from './utils.js'

/**
 * Checklist « départ du gîte » — items par défaut (éditables, persistés).
 * Rien à voir avec le « jour du grand départ » (début du voyage) : ici on
 * quitte le gîte le jour du retour (`trip.end`).
 */
export const DEPARTURE_INITIAL = [
  { id: 1, emoji: '🔑', label: 'Clés rendues / laissées comme convenu', done: false },
  { id: 2, emoji: '🧊', label: 'Frigo & congélateur vidés', done: false },
  { id: 3, emoji: '🔌', label: 'Chargeurs et câbles récupérés', done: false },
  { id: 4, emoji: '🗑️', label: 'Poubelles sorties et triées', done: false },
  { id: 5, emoji: '🪟', label: 'Fenêtres et volets fermés', done: false },
  { id: 6, emoji: '💡', label: 'Lumières éteintes, chauffage baissé', done: false },
  { id: 7, emoji: '🚿', label: 'Eau / gaz coupés si demandé', done: false },
  { id: 8, emoji: '🧹', label: 'Vaisselle rangée, ménage rapide', done: false },
  { id: 9, emoji: '🧳', label: 'Rien oublié (chambres, placards, salle de bain)', done: false },
]

/**
 * Fenêtre d'affichage de la checklist de départ : la veille du retour et le
 * jour même (comparaison en dates locales, heure ignorée).
 * @param {string} endIso  date de retour du voyage (`trip.end`)
 * @param {Date}   now
 */
export function isCheckoutWindow(endIso, now = new Date()) {
  if (!endIso) return false
  const end = tripDate(endIso, 0)
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const days = Math.round((startOfDay(end) - startOfDay(now)) / 86400000)
  return days === 0 || days === 1
}
