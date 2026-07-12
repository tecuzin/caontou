import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { tripDate } from './utils.js'

// Notifications — construit la liste de tous les rappels à venir
// (planning 30 min avant, menu du jour à 8 h, trajet J-1 + matin du départ).
// Ids déterministes : replanifier = annuler les pendantes + re-scheduler.
// Le mois/année des jours de planning est déduit de trip.start (les jours
// portent un numéro de jour du mois) ; le nom du mois vient du voyage.
export function buildNotificationList(daysData, mealsData, trip) {
  const now = Date.now()
  const list = []
  let id = 1
  const [ty, tm] = trip.start.split('-').map(Number)
  const monthName = tripDate(trip.start).toLocaleDateString('fr-FR', { month: 'long' })
  daysData.forEach((d) => {
    const dayDate = new Date(ty, tm - 1, d.num)
    d.items.forEach((item) => {
      const m = item.time.match(/^(\d{1,2}):(\d{2})$/)
      if (!m) return
      const t = new Date(dayDate)
      t.setHours(parseInt(m[1]), parseInt(m[2]), 0, 0)
      const at = new Date(t.getTime() - 30 * 60 * 1000)
      if (at.getTime() > now) list.push({ id: id++, title: `🗓️ Dans 30 min · ${item.title}`, body: `${d.dow} ${d.num} ${monthName} · ${item.time}`, at })
    })
  })
  const start = tripDate(trip.start)
  const veille = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 1, 20, 0, 0)
  const matin = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 7, 0, 0)
  const end = tripDate(trip.end)
  const veilleRetour = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1, 20, 0, 0)
  const via = trip.etape ? ` (via ${trip.etape})` : ''
  if (veille.getTime() > now) list.push({ id: id++, title: '🚗 Départ demain !', body: 'Checklist trajet à valider ce soir', at: veille })
  if (matin.getTime() > now) list.push({ id: id++, title: "🚗 C'est le grand jour !", body: `${trip.origin} → ${trip.destination}${via}`, at: matin })
  if (veilleRetour.getTime() > now) list.push({ id: id++, title: '🏠 Demain : fin du séjour', body: `Route du retour vers ${trip.origin}${via}`, at: veilleRetour })
  return list
}

// Rappel de sauvegarde — toutes les données vivent uniquement dans le
// localStorage de cet appareil ; sans rappel, un téléphone perdu/cassé/
// reseté efface tout le planning. Id réservé (9000), hors de la plage
// dynamique 1..N de buildNotificationList, pour ne jamais entrer en
// collision lors du cancel+reschedule.
const BACKUP_REMINDER_ID = 9000
export function buildBackupReminder(lastBackupAt, now = new Date(), intervalDays = 5) {
  const base = lastBackupAt ? new Date(lastBackupAt) : now
  const graceDays = lastBackupAt ? intervalDays : 2 // jamais sauvegardé -> relance plus tôt
  const due = new Date(base.getTime() + graceDays * 86400000)
  const at = due > now ? due : new Date(now.getTime() + 86400000) // déjà en retard -> demain
  at.setHours(9, 0, 0, 0)
  const body = lastBackupAt
    ? `Ça fait ${graceDays} jours — exporte ou partage une copie depuis l'accueil.`
    : "Tu n'as pas encore fait de sauvegarde — exporte ou partage une copie depuis l'accueil."
  return { id: BACKUP_REMINDER_ID, title: '💾 Pense à sauvegarder tes données', body, at }
}

// Rappel météo montagne — la météo du massif cantalien (Carladès, Plomb du
// Cantal, Puy Mary) change vite ; l'app n'a pas de prévisions temps réel (pas de
// backend), mais un rappel la veille au soir des journées « plein air » incite à
// vérifier la météo avant de partir. Ids réservés (9100+), hors des plages 1..N et 9000.
const WEATHER_REMINDER_BASE = 9100
const OUTDOOR_RE = /puy mary|plomb du cantal|lioran|rando|sentier|\bGR\b|cascade|\blac\b|gorges|passerelle|via ferrata|canyon|sommet|\bcol\b|crête|crete|balade|marche|montagne|ferrata|parapente|télécabine|telecabine|accrobranche|rocher|panorama/i
export function buildWeatherReminders(daysData, trip, now = Date.now()) {
  const [ty, tm] = trip.start.split('-').map(Number)
  const monthName = tripDate(trip.start).toLocaleDateString('fr-FR', { month: 'long' })
  const list = []
  let i = 0
  daysData.forEach((d) => {
    const hasOutdoor = d.items.some((it) => OUTDOOR_RE.test(it.title))
    if (!hasOutdoor) return
    const at = new Date(ty, tm - 1, d.num - 1, 20, 30, 0)
    if (at.getTime() > now) {
      list.push({ id: WEATHER_REMINDER_BASE + i, title: '🌦️ Vérifie la météo montagne', body: `Sortie plein air demain (${d.dow} ${d.num} ${monthName}) — la météo du Cantal change vite.`, at })
    }
    i++
  })
  return list
}

// Brief du matin — une notification à 8 h pour chaque jour du séjour, qui
// résume la journée en une ligne : météo (icône + max/min), première activité
// prévue et repas du jour. Remplace l'ancien rappel « Menu du jour » seul.
// Ids réservés (9200+), hors des plages 1..N, 9000 (backup) et 9100+ (météo).
const MORNING_BRIEF_BASE = 9200
export function buildMorningBrief(daysData, mealsData, meteoData, trip, now = Date.now()) {
  const [ty, tm] = trip.start.split('-').map(Number)
  const list = []
  daysData.forEach((d, i) => {
    const at = new Date(ty, tm - 1, d.num, 8, 0, 0)
    if (at.getTime() <= now) return
    const w = (meteoData || []).find((m) => m.n === d.num)
    const ml = mealsData.find((m) => m.day === `${d.dow} ${d.num}`)
    const first = d.items && d.items.length ? d.items[0] : null
    const parts = []
    if (w) parts.push(`${w.icon} ${w.hi}°/${w.lo}°`)
    if (first) parts.push(`${first.time} ${first.title}`)
    if (ml) parts.push(`🍽️ ${ml.dish}`)
    list.push({
      id: MORNING_BRIEF_BASE + i,
      title: `${w ? w.icon : '🌅'} Aujourd'hui · ${d.dow} ${d.num}`,
      body: parts.length ? parts.join(' · ') : 'Bonne journée dans le Cantal !',
      at,
    })
  })
  return list
}

// Fallback web (dev navigateur) : setTimeout + Notification API.
// Les timeouts sont suivis pour éviter les doublons à la replanification.
let webNotifTimeouts = []
// Demande explicite de permission — à câbler sur un geste utilisateur (bouton
// « activer les rappels »), jamais au chargement (best practice Lighthouse
// notification-on-start). Renvoie l'état de permission résultant.
export async function requestWebNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'default') return await Notification.requestPermission()
  return Notification.permission
}

export async function dispatchWebNotifications(list) {
  if (!('Notification' in window)) return
  // On ne PROMPT pas au chargement : on planifie uniquement si la permission
  // est déjà accordée (sinon la demande passe par requestWebNotificationPermission).
  if (Notification.permission !== 'granted') return
  webNotifTimeouts.forEach(clearTimeout)
  webNotifTimeouts = list.map((n) => setTimeout(() => {
    new Notification(n.title, { body: n.body, icon: '/cantou-icon.png' })
  }, n.at.getTime() - Date.now()))
}

// Natif Android : planification via AlarmManager — les rappels partent
// même app fermée, téléphone verrouillé ou redémarré.
export async function dispatchNativeNotifications(list) {
  const perm = await LocalNotifications.requestPermissions()
  if (perm.display !== 'granted') return
  const pending = await LocalNotifications.getPending()
  if (pending.notifications.length) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) })
  }
  if (list.length) {
    await LocalNotifications.schedule({
      notifications: list.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        schedule: { at: n.at, allowWhileIdle: true },
      })),
    })
  }
}

export async function scheduleAllNotifications(daysData, mealsData, meteoData, trip, lastBackupAt = null) {
  const list = [
    ...buildNotificationList(daysData, mealsData, trip),
    ...buildMorningBrief(daysData, mealsData, meteoData, trip),
    ...buildWeatherReminders(daysData, trip),
    buildBackupReminder(lastBackupAt),
  ]
  if (Capacitor.isNativePlatform()) await dispatchNativeNotifications(list)
  else await dispatchWebNotifications(list)
}
