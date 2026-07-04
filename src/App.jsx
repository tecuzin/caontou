import { useState, useEffect, useMemo, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Share } from '@capacitor/share'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { MEALS_INITIAL, SHOPPING_ITEMS_INITIAL, PLANNING_ACTIVITIES_INITIAL, LOGI_INITIAL, COURSES_INITIAL, VISITS_INITIAL, METEO_INITIAL, TRAJETS_INITIAL, TRIP_INITIAL } from './data.js'
import { s, eur, buildList, sortItemsByTime, parseDist } from './utils.js'
import { Ridge, Panorama, GiteScene } from './Scenery.jsx'

const haptic = (style = ImpactStyle.Light) => { Haptics.impact({ style }).catch(() => {}) }

// Planning par défaut : 11 jours (5 → 15 août), étape à Laschamps à
// l'aller (nuit du 5) comme au retour (nuit du 14).
const DAYS_INITIAL = [
  { dow: 'Mer', num: 5, title: 'Le grand départ', sub: 'Beauvais → Laschamps', items: [
    { time: '09:00', title: 'Départ de Beauvais', note: 'Voiture chargée, c\'est parti !', color: '#5b7042' },
    { time: '12:30', title: 'Pique-nique en route', note: 'Se dégourdir les jambes', color: '#4f8a86' },
    { time: '16:00', title: 'Arrivée à Laschamps', note: 'Étape pour la nuit', color: '#9c6b4a' },
    { time: '19:30', title: 'Dîner tranquille', note: 'Tout le monde au lit tôt', color: '#b8503f' },
  ] },
  { dow: 'Jeu', num: 6, title: 'Cap sur le Cantal', sub: 'Laschamps → Mandailles', items: [
    { time: '09:30', title: 'Départ de Laschamps', note: 'Volcans en vue', color: '#5b7042' },
    { time: '11:00', title: 'Pause à Murat', note: 'Café & jambes', color: '#cf7d3c' },
    { time: '13:00', title: 'Arrivée au gîte', note: 'Installation & goûter', color: '#9c6b4a' },
    { time: '16:00', title: 'Courses à Aurillac', note: 'Premier ravitaillement', color: '#8a8b3d' },
    { time: '19:30', title: 'Dîner au coin du cantou', note: 'Pâtes au pesto', color: '#b8503f' },
  ] },
  { dow: 'Ven', num: 7, title: 'Mise en jambes', sub: 'Vallée de Mandailles', items: [
    { time: '09:30', title: 'Petit-déj tranquille', note: 'On prend le temps', color: '#cf7d3c' },
    { time: '10:30', title: 'Cascade du Faillitoux', note: 'Balade facile (1 h)', color: '#5b7042' },
    { time: '12:30', title: 'Pique-nique au bord de l\'eau', note: '', color: '#4f8a86' },
    { time: '15:00', title: 'Sieste & jeux au jardin', note: '', color: '#9c6b4a' },
    { time: '18:00', title: 'Marché de producteurs', note: 'Fromages & charcuterie', color: '#8a8b3d' },
  ] },
  { dow: 'Sam', num: 8, title: 'Ascension du Puy Mary', sub: 'Pas de Peyrol', items: [
    { time: '08:30', title: 'Départ tôt', note: 'Avant la chaleur', color: '#5b7042' },
    { time: '09:30', title: 'Parking Pas de Peyrol', note: '1 589 m', color: '#9c6b4a' },
    { time: '10:00', title: 'Montée au sommet', note: 'Porte-bébé conseillé', color: '#5b7042' },
    { time: '12:30', title: 'Pique-nique panorama', note: 'Vue à 360° 🏔️', color: '#4f8a86' },
    { time: '15:00', title: 'Glace à Dienne', note: 'Récompense méritée', color: '#b8503f' },
  ] },
  { dow: 'Dim', num: 9, title: 'Fermes & fromages', sub: 'Autour de Salers', items: [
    { time: '10:00', title: 'Ferme pédagogique', note: 'Traite & petits animaux', color: '#5b7042' },
    { time: '12:30', title: 'Déjeuner truffade', note: 'À l\'auberge', color: '#b8503f' },
    { time: '15:00', title: 'Buronnerie & dégustation', note: 'Cantal AOP', color: '#8a8b3d' },
    { time: '17:00', title: 'Baignade au lac', note: '', color: '#4f8a86' },
  ] },
  { dow: 'Lun', num: 10, title: 'Cap sur Aurillac', sub: 'La ville', items: [
    { time: '10:00', title: 'Château Saint-Étienne', note: '', color: '#9c6b4a' },
    { time: '12:00', title: 'Déjeuner en ville', note: '', color: '#b8503f' },
    { time: '14:30', title: 'Maison des Volcans', note: 'Ludique pour les enfants', color: '#cf7d3c' },
    { time: '16:30', title: 'Parc & manège', note: '', color: '#5b7042' },
  ] },
  { dow: 'Mar', num: 11, title: 'Train & lacs', sub: 'Riom-ès-Montagnes', items: [
    { time: '10:00', title: 'Gentiane Express', note: 'Train touristique 🚂', color: '#cf7d3c' },
    { time: '13:00', title: 'Pique-nique au lac', note: '', color: '#4f8a86' },
    { time: '15:30', title: 'Pédalo & baignade', note: '', color: '#4f8a86' },
    { time: '18:00', title: 'Retour & repos', note: '', color: '#9c6b4a' },
  ] },
  { dow: 'Mer', num: 12, title: 'Journée libre', sub: 'Au gré de l\'envie', items: [
    { time: 'Matin', title: 'Grasse matinée', note: 'On souffle', color: '#cf7d3c' },
    { time: '11:00', title: 'Balade douce', note: '', color: '#5b7042' },
    { time: '16:00', title: 'Jeux au jardin', note: '', color: '#9c6b4a' },
  ] },
  { dow: 'Jeu', num: 13, title: 'Marché & baignade', sub: 'Dernier jour complet', items: [
    { time: '10:00', title: 'Marché de Salers', note: 'Souvenirs & fromages à ramener', color: '#8a8b3d' },
    { time: '15:00', title: 'Baignade au lac', note: 'Une dernière fois', color: '#4f8a86' },
    { time: '18:00', title: 'Rangement des valises', note: '', color: '#9c6b4a' },
  ] },
  { dow: 'Ven', num: 14, title: 'Retour — étape 1', sub: 'Mandailles → Laschamps', items: [
    { time: '09:30', title: 'Check-out du gîte', note: 'État des lieux', color: '#9c6b4a' },
    { time: '10:00', title: 'Route vers Laschamps', note: '', color: '#5b7042' },
    { time: '12:30', title: 'Pause déjeuner', note: '', color: '#b8503f' },
    { time: '16:00', title: 'Arrivée à Laschamps', note: 'Étape pour la nuit', color: '#9c6b4a' },
  ] },
  { dow: 'Sam', num: 15, title: 'Retour — étape 2', sub: 'Laschamps → Beauvais', items: [
    { time: '09:30', title: 'Départ de Laschamps', note: '', color: '#5b7042' },
    { time: '13:00', title: 'Pause déjeuner', note: '', color: '#b8503f' },
    { time: '17:00', title: 'Arrivée à Beauvais', note: 'Des souvenirs plein la tête 💛', color: '#4f8a86' },
  ] },
]

/* ------------------------------------------------------------------ *
 * Helper : transforme une chaîne CSS (issue du prototype) en objet de
 * style React. Permet de coller les styles inline du design tel quel,
 * pour une reproduction fidèle au pixel.
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * Données de référence (statiques) — reprises du prototype de design.
 * ------------------------------------------------------------------ */
const CATS = [
  { name: 'Hébergement', color: '#9c6b4a' },
  { name: 'Transport', color: '#4f8a86' },
  { name: 'Nourriture', color: '#cf7d3c' },
  { name: 'Visites', color: '#5b7042' },
  { name: 'Extra', color: '#b8503f' },
]
const VCAT = { Nature: '#5b7042', Famille: '#cf7d3c', Patrimoine: '#9c6b4a', Baignade: '#4f8a86', Gourmand: '#b8503f', Marché: '#8a8b3d' }
const FILTERS = ['Tous', 'Nature', 'Famille', 'Patrimoine', 'Baignade', 'Gourmand', 'Marché']

const MODULES = [
  { emoji: '🚗', name: 'Trajet', sub: 'Aller & retour', bg: '#dfeae6', action: 'sub:trajet' },
  { emoji: '🏡', name: 'Hébergement', sub: 'La Grange, Mandailles', bg: '#f1e4d4', action: 'sub:hebergement' },
  { emoji: '🧳', name: 'Préparatifs', sub: 'Valises & listes', bg: '#e7ecdf', action: 'sub:logistique' },
  { emoji: '⛅', name: 'Météo', sub: '7 jours sur place', bg: '#eee7d4', action: 'sub:meteo' },
  { emoji: '🍽️', name: 'Repas', sub: 'Menus & courses', bg: '#f3e2d6', action: 'tab:repas' },
  { emoji: '💶', name: 'Budget', sub: '1 800 € prévus', bg: '#e6ece0', action: 'tab:budget' },
]



const LOGI = [
  { key: 've', name: 'Valise enfants', emoji: '🧒', items: ['Bodies & sous-vêtements', 'Pulls chauds (montagne !)', 'K-way / imperméable', 'Bottes & baskets', 'Chapeaux & crème solaire', 'Doudous & jouets', 'Médicaments habituels'] },
  { key: 'va', name: 'Valise adultes', emoji: '🎒', items: ['Vêtements chauds', 'Chaussures de rando', 'Maillots de bain', 'Trousse de toilette', 'Chargeurs & batteries', 'Sac à dos de rando'] },
  { key: 'ph', name: 'Pharmacie', emoji: '🩹', items: ['Paracétamol adulte', 'Doliprane enfant', 'Pansements', 'Crème solaire', 'Anti-moustique', 'Tire-tique', 'Désinfectant'] },
  { key: 'vo', name: 'Voiture', emoji: '🚗', items: ['Sièges auto', 'Gilets & triangle', 'Plaid & oreillers', 'Jeux de voiture', 'En-cas & eau'] },
  { key: 'ma', name: 'Maison (avant départ)', emoji: '🏠', items: ['Couper l’eau & le gaz', 'Sortir les poubelles', 'Fermer les volets', 'Prévenir les voisins', 'Vider le frigo', 'Arroser les plantes'] },
]

const COURSES = [
  { key: 'co_frais', name: 'Frais', items: ['Lait', 'Œufs (x12)', 'Beurre', 'Cantal AOP', 'Saint-Nectaire', 'Yaourts enfants', 'Jambon'] },
  { key: 'co_epic', name: 'Épicerie', items: ['Pâtes', 'Riz', 'Pesto', 'Huile d’olive', 'Café', 'Céréales', 'Chocolat'] },
  { key: 'co_fl', name: 'Fruits & légumes', items: ['Pommes de terre (aligot)', 'Salade', 'Tomates', 'Pommes', 'Bananes', 'Oignons'] },
  { key: 'co_enf', name: 'Pour les enfants', items: ['Compotes à boire', 'Petits gâteaux', 'Jus de fruits', 'Sirop'] },
  { key: 'co_autre', name: 'Autres', items: ['Pain', 'Eau (pack)', 'Sacs poubelle', 'Charbon BBQ', 'Essuie-tout'] },
]

const TRAJET_CHECK_ITEMS_INITIAL = ['Pleins faits', 'Sièges auto installés', 'Eau & en-cas à portée', 'Doudous accessibles', 'Itinéraire chargé hors-ligne', 'Sac de change bébé']

const HEB_EQUIP = ['Wi-Fi', 'Cheminée (cantou)', 'Lave-linge', 'Lit bébé', 'Jardin clos', 'Parking', 'Lave-vaisselle', 'Barbecue']

const HEB_INITIAL = {
  nom: 'La Grange du Puy Mary',
  adresse: 'Mandailles-Saint-Julien (15590)',
  arrivee: 'Sam 11 · dès 16 h',
  depart: 'Sam 18 · avant 10 h',
  capacite: '4–5 personnes · 2 chambres · lit bébé fourni',
  wifiNom: 'LaGrange-Gite',
  wifiPass: 'puymary15',
  contact: 'Mme Vidal · 06 12 34 56 78',
  note: '🔥 La maison a son cantou (cheminée traditionnelle) — parfait pour les soirées, même en été en altitude.',
}

const BUDGET_INITIAL = 1800

/* ------------------------------------------------------------------ *
 * Persistance locale (sur le téléphone) — localStorage, persistant
 * dans la WebView Android. Aucune dépendance réseau / serveur.
 * ------------------------------------------------------------------ */
const STORE_KEY = 'cantou.v1'
const DEFAULTS = {
  saved: { 1: true, 5: true },
  checks: {
    ve: { 'Bodies & sous-vêtements': true, 'Pulls chauds (montagne !)': true, 'Bottes & baskets': true, 'Doudous & jouets': true },
    va: { 'Vêtements chauds': true, 'Chaussures de rando': true },
    ph: { 'Crème solaire': true, 'Pansements': true },
    vo: { 'Sièges auto': true },
    ma: {},
    tr_dep: { 'Sièges auto installés': true, 'Doudous accessibles': true },
    co_frais: { 'Lait': true, 'Œufs (x12)': true },
    co_epic: { 'Café': true },
    co_fl: {},
    co_enf: { 'Compotes à boire': true },
    co_autre: { 'Pain': true },
  },
  expenses: [
    { label: 'Acompte gîte', cat: 'Hébergement', amt: 360 },
    { label: 'Plein d’essence', cat: 'Transport', amt: 95 },
    { label: 'Courses Aurillac', cat: 'Nourriture', amt: 87.4 },
    { label: 'Gentiane Express', cat: 'Visites', amt: 32 },
    { label: 'Péage A75', cat: 'Transport', amt: 24.6 },
  ],
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return structuredClone(DEFAULTS)
    const p = JSON.parse(raw)
    return {
      saved: p.saved ?? structuredClone(DEFAULTS.saved),
      checks: p.checks ?? structuredClone(DEFAULTS.checks),
      expenses: p.expenses ?? structuredClone(DEFAULTS.expenses),
      meals: p.meals ?? structuredClone(MEALS_INITIAL),
      shoppingItems: p.shoppingItems ?? structuredClone(SHOPPING_ITEMS_INITIAL),
      days: p.days ?? structuredClone(DAYS_INITIAL),
      visits: p.visits ?? structuredClone(VISITS_INITIAL),
      meteo: p.meteo ?? structuredClone(METEO_INITIAL),
      // Migration : l'ancien store n'avait qu'un trajet aller (trajetSteps)
      trajets: p.trajets ?? (p.trajetSteps
        ? { aller: p.trajetSteps, retour: structuredClone(TRAJETS_INITIAL.retour) }
        : structuredClone(TRAJETS_INITIAL)),
      trip: p.trip ?? { ...TRIP_INITIAL },
      logi: p.logi ?? structuredClone(LOGI_INITIAL),
      courses: p.courses ?? structuredClone(COURSES_INITIAL),
      budgetTotal: p.budgetTotal ?? BUDGET_INITIAL,
      hebergement: p.hebergement ?? structuredClone(HEB_INITIAL),
      trajetCheckItems: p.trajetCheckItems ?? [...TRAJET_CHECK_ITEMS_INITIAL],
    }
  } catch {
    return structuredClone(DEFAULTS)
  }
}

/* ------------------------------------------------------------------ *
 * Utilitaires
 * ------------------------------------------------------------------ */
const catColor = (n) => (CATS.find((x) => x.name === n) || {}).color || '#8a8273'

/* ------------------------------------------------------------------ *
 * Brique réutilisable : ligne cochable (trajet / logistique / courses)
 * ------------------------------------------------------------------ */
function CheckRow({ label, checked, onToggle }) {
  return (
    <button onClick={onToggle} style={s('width:100%;text-align:left;border:none;border-bottom:1px solid #f1e9da;background:transparent;display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;')}>
      {checked ? (
        <>
          <span style={s('width:24px;height:24px;flex:0 0 auto;border-radius:8px;background:#5b7042;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;')}>✓</span>
          <span style={s('font-size:14px;color:#b3a892;text-decoration:line-through;')}>{label}</span>
        </>
      ) : (
        <>
          <span style={s('width:24px;height:24px;flex:0 0 auto;border-radius:8px;border:2px solid #d8cbb0;background:#fff;')} />
          <span style={s('font-size:14px;color:#2f2a22;')}>{label}</span>
        </>
      )}
    </button>
  )
}

const SectionLabel = ({ children }) => (
  <div style={s('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#8a8273;text-transform:uppercase;')}>{children}</div>
)

/* ================================================================== */
// Helpers dates du voyage — trip.start/end sont des ISO (yyyy-mm-dd).
const tripDate = (iso, h = 12, min = 0) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, h, min, 0)
}
const fmtDayShort = (iso) => tripDate(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
const fmtMonthYear = (iso) => tripDate(iso).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

// Notifications — construit la liste de tous les rappels à venir
// (planning 30 min avant, menu du jour à 8 h, trajet J-1 + matin du départ).
// Ids déterministes : replanifier = annuler les pendantes + re-scheduler.
// Le mois/année des jours de planning est déduit de trip.start (les jours
// portent un numéro de jour du mois) ; le nom du mois vient du voyage.
const buildNotificationList = (daysData, mealsData, trip) => {
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
  daysData.forEach((d) => {
    const at = new Date(ty, tm - 1, d.num, 8, 0, 0)
    if (at.getTime() > now) {
      const ml = mealsData.find((m) => m.day === `${d.dow} ${d.num}`)
      list.push({ id: id++, title: `🍽️ Menu du jour · ${d.dow} ${d.num}`, body: ml ? ml.dish : 'Voir les menus', at })
    }
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

// Fallback web (dev navigateur) : setTimeout + Notification API.
// Les timeouts sont suivis pour éviter les doublons à la replanification.
let webNotifTimeouts = []
const dispatchWebNotifications = async (list) => {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') await Notification.requestPermission()
  if (Notification.permission !== 'granted') return
  webNotifTimeouts.forEach(clearTimeout)
  webNotifTimeouts = list.map((n) => setTimeout(() => {
    new Notification(n.title, { body: n.body, icon: '/cantou-icon.png' })
  }, n.at.getTime() - Date.now()))
}

// Natif Android : planification via AlarmManager — les rappels partent
// même app fermée, téléphone verrouillé ou redémarré.
const dispatchNativeNotifications = async (list) => {
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

const scheduleAllNotifications = async (daysData, mealsData, trip) => {
  const list = buildNotificationList(daysData, mealsData, trip)
  if (Capacitor.isNativePlatform()) await dispatchNativeNotifications(list)
  else await dispatchWebNotifications(list)
}

/* ================================================================== */
export default function App() {
  // état UI (non persisté)
  const [tab, setTab] = useState('accueil')
  const [sub, setSub] = useState(null)
  const [day, setDay] = useState(0)
  const [filter, setFilter] = useState('Tous')
  const [mealTab, setMealTab] = useState('repas')
  const [showAdd, setShowAdd] = useState(false)
  const [showMealEdit, setShowMealEdit] = useState(false)
  const [editingExpenseIdx, setEditingExpenseIdx] = useState(null)
  const [editingMealId, setEditingMealId] = useState(null)
  const [editingActivityIdx, setEditingActivityIdx] = useState(null)
  const [showActivityEdit, setShowActivityEdit] = useState(false)
  const [newAmt, setNewAmt] = useState('')
  const [newCat, setNewCat] = useState('Nourriture')
  const [newLabel, setNewLabel] = useState('')
  const [newMealDish, setNewMealDish] = useState('')
  const [newActivityTime, setNewActivityTime] = useState('')
  const [newActivityTitle, setNewActivityTitle] = useState('')
  const [showDayEdit, setShowDayEdit] = useState(false)
  const [editingDayIdx, setEditingDayIdx] = useState(null)
  const [newDayTitle, setNewDayTitle] = useState('')
  const [newDaySub, setNewDaySub] = useState('')
  const [newActivityColor, setNewActivityColor] = useState('#5b7042')
  const [showActivityAdd, setShowActivityAdd] = useState(false)
  const [editingActivityDayIdx, setEditingActivityDayIdx] = useState(null)
  const [showVisitEdit, setShowVisitEdit] = useState(false)
  const [editingVisitId, setEditingVisitId] = useState(null)
  const [newVisitName, setNewVisitName] = useState('')
  const [newVisitDist, setNewVisitDist] = useState('')
  const [newVisitDur, setNewVisitDur] = useState('')
  const [newVisitAge, setNewVisitAge] = useState('')
  const [newVisitCat, setNewVisitCat] = useState('Nature')
  const [showTrajetEdit, setShowTrajetEdit] = useState(false)
  const [editingTrajetIdx, setEditingTrajetIdx] = useState(null)
  const [newTrajetTime, setNewTrajetTime] = useState('')
  const [newTrajetPlace, setNewTrajetPlace] = useState('')
  const [newTrajetNote, setNewTrajetNote] = useState('')
  const [newTrajetColor, setNewTrajetColor] = useState('#5b7042')
  const [showMeteoEdit, setShowMeteoEdit] = useState(false)
  const [editingMeteoIdx, setEditingMeteoIdx] = useState(null)
  const [newMeteoDay, setNewMeteoDay] = useState('')
  const [newMeteoNum, setNewMeteoNum] = useState('')
  const [newMeteoHi, setNewMeteoHi] = useState('')
  const [newMeteoLo, setNewMeteoLo] = useState('')
  const [newMeteoRain, setNewMeteoRain] = useState('')
  const [newMeteoIcon, setNewMeteoIcon] = useState('☀️')
  const [showAddLogiItem, setShowAddLogiItem] = useState(false)
  const [editingLogiKey, setEditingLogiKey] = useState(null)
  const [newLogiItem, setNewLogiItem] = useState('')
  const [showAddCourseItem, setShowAddCourseItem] = useState(false)
  const [editingCourseKey, setEditingCourseKey] = useState(null)
  const [newCourseItem, setNewCourseItem] = useState('')
  const [newShoppingItem, setNewShoppingItem] = useState('')
  const [trajetDir, setTrajetDir] = useState('aller')
  const [showTripEdit, setShowTripEdit] = useState(false)
  const [newTripStart, setNewTripStart] = useState('')
  const [newTripEnd, setNewTripEnd] = useState('')
  const [newTripOrigin, setNewTripOrigin] = useState('')
  const [newTripEtape, setNewTripEtape] = useState('')
  const [newTripDest, setNewTripDest] = useState('')
  const [showAddLogiList, setShowAddLogiList] = useState(false)
  const [newLogiListName, setNewLogiListName] = useState('')
  const [newLogiListEmoji, setNewLogiListEmoji] = useState('')
  const [showAddCourseCat, setShowAddCourseCat] = useState(false)
  const [newCourseCatName, setNewCourseCatName] = useState('')
  const [showDayAdd, setShowDayAdd] = useState(false)
  const [newDayDow, setNewDayDow] = useState('')
  const [newDayNum, setNewDayNum] = useState('')
  const [newDayTitle2, setNewDayTitle2] = useState('')
  const [newDaySub2, setNewDaySub2] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [exportCopied, setExportCopied] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [importPreview, setImportPreview] = useState(null)

  // état persisté (sur le téléphone)
  const initial = useMemo(loadStore, [])
  const [saved, setSaved] = useState(initial.saved)
  const [checks, setChecks] = useState(initial.checks)
  const [expenses, setExpenses] = useState(initial.expenses)
  const [meals, setMeals] = useState(initial.meals || structuredClone(MEALS_INITIAL))
  const [shoppingItems, setShoppingItems] = useState(initial.shoppingItems || structuredClone(SHOPPING_ITEMS_INITIAL))
  const [days, setDays] = useState(initial.days || structuredClone(DAYS_INITIAL))
  const [visits, setVisits] = useState(initial.visits || structuredClone(VISITS_INITIAL))
  const [meteo, setMeteo] = useState(initial.meteo || structuredClone(METEO_INITIAL))
  const [trajets, setTrajets] = useState(initial.trajets || structuredClone(TRAJETS_INITIAL))
  const [trip, setTrip] = useState(initial.trip || { ...TRIP_INITIAL })
  const [logi, setLogi] = useState(initial.logi || structuredClone(LOGI_INITIAL))
  const [courses, setCourses] = useState(initial.courses || structuredClone(COURSES_INITIAL))
  const [budgetTotal, setBudgetTotal] = useState(initial.budgetTotal || BUDGET_INITIAL)
  const [hebergement, setHebergement] = useState(initial.hebergement || structuredClone(HEB_INITIAL))
  const [trajetCheckItems, setTrajetCheckItems] = useState(initial.trajetCheckItems || [...TRAJET_CHECK_ITEMS_INITIAL])

  // Undo suppression : instantané complet du store avant chaque 🗑️,
  // restaurable pendant 5 s via le bandeau « Annuler »
  const [undoMsg, setUndoMsg] = useState(null)
  const undoSnapRef = useRef(null)
  const undoTimerRef = useRef(null)
  const offerUndo = (msg) => {
    undoSnapRef.current = { saved, checks, expenses, meals, shoppingItems, days, visits, meteo, trajets, trip, logi, courses, budgetTotal, hebergement, trajetCheckItems }
    setUndoMsg(msg)
    clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setUndoMsg(null), 5000)
  }
  const applyUndo = () => {
    const s0 = undoSnapRef.current
    if (!s0) return
    haptic(ImpactStyle.Medium)
    setSaved(s0.saved); setChecks(s0.checks); setExpenses(s0.expenses); setMeals(s0.meals)
    setShoppingItems(s0.shoppingItems); setDays(s0.days); setVisits(s0.visits); setMeteo(s0.meteo)
    setTrajets(s0.trajets); setTrip(s0.trip); setLogi(s0.logi); setCourses(s0.courses)
    setBudgetTotal(s0.budgetTotal); setHebergement(s0.hebergement); setTrajetCheckItems(s0.trajetCheckItems)
    setUndoMsg(null)
    undoSnapRef.current = null
  }

  // états UI modals nouveaux
  const [showBudgetTotalEdit, setShowBudgetTotalEdit] = useState(false)
  const [newBudgetTotal, setNewBudgetTotal] = useState('')
  const [showHebEdit, setShowHebEdit] = useState(false)
  const [newHebNom, setNewHebNom] = useState('')
  const [newHebAdresse, setNewHebAdresse] = useState('')
  const [newHebArrivee, setNewHebArrivee] = useState('')
  const [newHebDepart, setNewHebDepart] = useState('')
  const [newHebCapacite, setNewHebCapacite] = useState('')
  const [newHebWifiNom, setNewHebWifiNom] = useState('')
  const [newHebWifiPass, setNewHebWifiPass] = useState('')
  const [newHebContact, setNewHebContact] = useState('')
  const [showAddTrajetCheck, setShowAddTrajetCheck] = useState(false)
  const [newTrajetCheckItem, setNewTrajetCheckItem] = useState('')

  // états tri
  const [logiSorted, setLogiSorted] = useState(false)
  const [coursesSorted, setCoursesSorted] = useState(false)
  const [visitSort, setVisitSort] = useState(null) // null | 'dist' | 'cat'
  const [sortExpenses, setSortExpenses] = useState('date') // 'date' | 'amt'

  // états ajout repas
  const [newMealDay, setNewMealDay] = useState('')

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ saved, checks, expenses, meals, shoppingItems, days, visits, meteo, trajets, trip, logi, courses, budgetTotal, hebergement, trajetCheckItems })) } catch { }
  }, [saved, checks, expenses, meals, shoppingItems, days, visits, meteo, trajets, trip, logi, courses, budgetTotal, hebergement, trajetCheckItems])

  // (Re)planifie tous les rappels au démarrage et à chaque modification
  // du planning ou des menus — natif Android (survit à la fermeture) ou
  // fallback web en dev.
  useEffect(() => {
    scheduleAllNotifications(days, meals, trip).catch(() => { })
  }, [days, meals, trip])

  const toggleCheck = (key, label) => {
    haptic(ImpactStyle.Light)
    setChecks((c) => ({ ...c, [key]: { ...(c[key] || {}), [label]: !(c[key] && c[key][label]) } }))
  }
  const toggleSaved = (id) => { haptic(ImpactStyle.Medium); setSaved((sv) => ({ ...sv, [id]: !sv[id] })) }

  // compte à rebours depuis la date de départ paramétrée
  const countdown = useMemo(() => {
    return Math.max(0, Math.round((tripDate(trip.start, 0) - new Date()) / 86400000))
  }, [trip.start])

  // Tableau de bord « Aujourd'hui » — actif si la date du jour tombe dans
  // la fenêtre du voyage. Le jour de planning correspondant est retrouvé
  // par date calendaire réelle (mois/année dérivés de trip.start, comme
  // pour les notifications), la météo/le repas par numéro/libellé du jour.
  const today = useMemo(() => {
    const now = new Date()
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
  }, [trip.start, trip.end, days, meteo, meals])

  // dérivés préparatifs
  let packDone = 0, packTotal = 0
  logi.forEach((L) => { const b = buildList(checks, L.key, L.items); packDone += b.done; packTotal += b.total })
  const packPct = packTotal ? Math.round((packDone / packTotal) * 100) : 0

  // dérivés budget
  const spent = expenses.reduce((a, e) => a + e.amt, 0)
  const remain = budgetTotal - spent
  const spentPct = Math.round((spent / budgetTotal) * 100)
  const budgetCats = CATS
    .map((c) => { const a = expenses.filter((e) => e.cat === c.name).reduce((sum, e) => sum + e.amt, 0); return { ...c, amt: a, pct: Math.round(spent ? (a / spent) * 100 : 0) } })
    .filter((c) => c.amt > 0)
    .sort((a, b) => b.amt - a.amt)

  // dérivés courses
  let coursesDone = 0, coursesTotal = 0
  const coursesGroups = courses.map((g) => { const b = buildList(checks, g.key, g.items); coursesDone += b.done; coursesTotal += b.total; return { name: g.name, doneStr: `${b.done}/${b.total}`, items: b.items, key: g.key } })
  const coursesPct = coursesTotal ? Math.round((coursesDone / coursesTotal) * 100) : 0

  // visites filtrées + triées
  const CAT_ORDER = ['Nature', 'Famille', 'Patrimoine', 'Baignade', 'Gourmand', 'Marché', 'Marche']
  const filteredVisits = visits
    .filter((v) => filter === 'Tous' || v.cat === filter)
    .sort((a, b) => {
      if (visitSort === 'dist') return parseDist(a.dist) - parseDist(b.dist)
      if (visitSort === 'cat') return CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat)
      return 0
    })
  const savedCount = Object.values(saved).filter(Boolean).length

  const cur = days[day]
  const tr = buildList(checks, 'tr_dep', trajetCheckItems)
  const subTitle = { trajet: 'Le trajet', logistique: 'Valises & préparatifs', hebergement: 'Hébergement', meteo: 'Météo' }[sub] || ''

  const openModule = (action) =>
    action.indexOf('sub:') === 0 ? setSub(action.slice(4)) : (setTab(action.slice(4)), setSub(null))

  const submitExpense = () => {
    const a = parseFloat(String(newAmt).replace(',', '.'))
    if (!a || a <= 0) return
    haptic(ImpactStyle.Medium)
    if (editingExpenseIdx !== null) {
      setExpenses((list) => list.map((e, i) => i === editingExpenseIdx ? { label: newLabel || newCat, cat: newCat, amt: a } : e))
      setEditingExpenseIdx(null)
    } else {
      setExpenses((list) => [...list, { label: newLabel || newCat, cat: newCat, amt: a }])
    }
    setShowAdd(false); setNewAmt(''); setNewLabel('')
  }
  const deleteExpense = (idx) => {
    haptic(ImpactStyle.Medium)
    offerUndo('Dépense supprimée')
    setExpenses((list) => list.filter((_, i) => i !== idx))
  }
  const startEditExpense = (idx) => {
    const e = expenses[idx]
    setNewAmt(String(e.amt))
    setNewLabel(e.label)
    setNewCat(e.cat)
    setEditingExpenseIdx(idx)
    setShowAdd(true)
  }
  const closeAdd = () => { setShowAdd(false); setNewAmt(''); setNewLabel(''); setEditingExpenseIdx(null) }

  const editMeal = (id) => {
    const m = meals.find(x => x.id === id)
    if (m) { setNewMealDish(m.dish); setNewMealDay(m.day); setEditingMealId(id); setShowMealEdit(true) }
  }
  const openAddMeal = () => { setNewMealDay(''); setNewMealDish(''); setEditingMealId(null); setShowMealEdit(true) }
  const saveMeal = () => {
    if (!newMealDish.trim()) return
    haptic(ImpactStyle.Medium)
    if (editingMealId === null) {
      if (!newMealDay.trim()) return
      const newId = Math.max(0, ...meals.map(m => m.id)) + 1
      setMeals((list) => [...list, { id: newId, day: newMealDay.trim(), dish: newMealDish.trim() }])
    } else {
      setMeals((list) => list.map(m => m.id === editingMealId ? { ...m, day: newMealDay, dish: newMealDish } : m))
    }
    closeMealEdit()
  }
  const closeMealEdit = () => { setShowMealEdit(false); setEditingMealId(null); setNewMealDish(''); setNewMealDay('') }
  const deleteMeal = (id) => {
    if (meals.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Repas supprimé')
    setMeals((list) => list.filter(m => m.id !== id))
  }

  const deleteShoppingItem = (id) => {
    haptic(ImpactStyle.Medium)
    offerUndo('Article supprimé')
    setShoppingItems((list) => list.filter(item => item.id !== id))
  }
  const toggleShoppingItem = (id) => {
    haptic(ImpactStyle.Light)
    setShoppingItems((list) => list.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }
  const addShoppingItem = () => {
    if (!newShoppingItem.trim()) return
    haptic(ImpactStyle.Medium)
    const newId = Math.max(0, ...shoppingItems.map(i => i.id)) + 1
    setShoppingItems((list) => [...list, { id: newId, label: newShoppingItem.trim(), checked: false }])
    setNewShoppingItem('')
  }

  const editActivity = (dayIdx, itemIdx) => {
    const item = days[dayIdx].items[itemIdx]
    setNewActivityTime(item.time)
    setNewActivityTitle(item.title)
    setNewActivityColor(item.color || '#5b7042')
    setEditingActivityIdx({ dayIdx, itemIdx })
    setEditingActivityDayIdx(dayIdx)
    setShowActivityEdit(true)
  }
  const closeActivityEdit = () => { setShowActivityEdit(false); setEditingActivityIdx(null); setNewActivityTime(''); setNewActivityTitle('') }

  const editDay = (dayIdx) => {
    const d = days[dayIdx]
    setNewDayTitle(d.title)
    setNewDaySub(d.sub)
    setEditingDayIdx(dayIdx)
    setShowDayEdit(true)
  }
  const saveDay = () => {
    if (!newDayTitle.trim() || !newDaySub.trim() || editingDayIdx === null) return
    haptic(ImpactStyle.Medium)
    setDays((list) => list.map((d, i) => i === editingDayIdx ? { ...d, title: newDayTitle, sub: newDaySub } : d))
    closeDayEdit()
  }
  const closeDayEdit = () => { setShowDayEdit(false); setEditingDayIdx(null); setNewDayTitle(''); setNewDaySub('') }
  const deleteDay = (dayIdx) => {
    if (days.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Jour supprimé')
    setDays((list) => list.filter((_, i) => i !== dayIdx))
    if (day === dayIdx) setDay(Math.max(0, day - 1))
  }

  const startAddActivity = (dayIdx) => {
    setEditingActivityDayIdx(dayIdx)
    setNewActivityTime('')
    setNewActivityTitle('')
    setNewActivityColor('#5b7042')
    setShowActivityAdd(true)
  }
  const submitActivity = () => {
    if (!newActivityTime.trim() || !newActivityTitle.trim() || editingActivityDayIdx === null) return
    haptic(ImpactStyle.Medium)
    if (editingActivityIdx) {
      const { dayIdx, itemIdx } = editingActivityIdx
      setDays((list) => list.map((d, di) => {
        if (di !== dayIdx) return d
        const updated = d.items.map((it, ii) => ii === itemIdx ? { time: newActivityTime, title: newActivityTitle, note: it.note, color: newActivityColor } : it)
        return { ...d, items: sortItemsByTime(updated) }
      }))
      setShowActivityEdit(false)
      setEditingActivityIdx(null)
    } else {
      setDays((list) => list.map((d, di) => {
        if (di !== editingActivityDayIdx) return d
        const updated = [...d.items, { time: newActivityTime, title: newActivityTitle, note: '', color: newActivityColor }]
        return { ...d, items: sortItemsByTime(updated) }
      }))
      closeActivityAdd()
    }
  }
  const closeActivityAdd = () => { setShowActivityAdd(false); setEditingActivityDayIdx(null); setNewActivityTime(''); setNewActivityTitle(''); setNewActivityColor('#5b7042') }
  const deleteActivity = (dayIdx, itemIdx) => {
    haptic(ImpactStyle.Medium)
    offerUndo('Activité supprimée')
    setDays((list) => list.map((d, di) => di === dayIdx ? { ...d, items: d.items.filter((_, ii) => ii !== itemIdx) } : d))
  }

  const editVisit = (visitId) => {
    const v = visits.find(x => x.id === visitId)
    if (v) {
      setNewVisitName(v.name)
      setNewVisitDist(v.dist)
      setNewVisitDur(v.dur)
      setNewVisitAge(v.age)
      setNewVisitCat(v.cat)
      setEditingVisitId(visitId)
      setShowVisitEdit(true)
    }
  }
  const saveVisit = () => {
    if (!newVisitName.trim()) return
    haptic(ImpactStyle.Medium)
    if (!editingVisitId) {
      const newId = Math.max(...visits.map(v => v.id), 0) + 1
      setVisits((list) => [...list, { id: newId, emoji: '📍', name: newVisitName, cat: newVisitCat, dist: newVisitDist, dur: newVisitDur, age: newVisitAge }])
    } else {
      setVisits((list) => list.map(v => v.id === editingVisitId ? { ...v, name: newVisitName, dist: newVisitDist, dur: newVisitDur, age: newVisitAge, cat: newVisitCat } : v))
    }
    closeVisitEdit()
  }
  const closeVisitEdit = () => { setShowVisitEdit(false); setEditingVisitId(null); setNewVisitName(''); setNewVisitDist(''); setNewVisitDur(''); setNewVisitAge(''); setNewVisitCat('Nature') }
  const deleteVisit = (visitId) => {
    if (visits.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Visite supprimée')
    setVisits((list) => list.filter(v => v.id !== visitId))
  }
  const addVisit = () => {
    if (!newVisitName.trim()) return
    const newId = Math.max(...visits.map(v => v.id), 0) + 1
    setVisits((list) => [...list, { id: newId, emoji: '📍', name: newVisitName, cat: newVisitCat, dist: newVisitDist, dur: newVisitDur, age: newVisitAge }])
    closeVisitAdd()
  }
  const closeVisitAdd = () => { setShowVisitEdit(false); setEditingVisitId(null); setNewVisitName(''); setNewVisitDist(''); setNewVisitDur(''); setNewVisitAge(''); setNewVisitCat('Nature') }

  // Trajet : les étapes sont éditées par direction (aller / retour)
  const editTrajetStep = (idx) => {
    const st = trajets[trajetDir][idx]
    setNewTrajetTime(st.time)
    setNewTrajetPlace(st.place)
    setNewTrajetNote(st.note)
    setNewTrajetColor(st.color)
    setEditingTrajetIdx(idx)
    setShowTrajetEdit(true)
  }
  const saveTrajetStep = () => {
    if (!newTrajetTime.trim() || !newTrajetPlace.trim()) return
    haptic(ImpactStyle.Medium)
    const step = { time: newTrajetTime, place: newTrajetPlace, note: newTrajetNote, color: newTrajetColor }
    setTrajets((t) => ({
      ...t,
      [trajetDir]: editingTrajetIdx === null
        ? [...t[trajetDir], step]
        : t[trajetDir].map((st, i) => i === editingTrajetIdx ? step : st),
    }))
    closeTrajetEdit()
  }
  const closeTrajetEdit = () => { setShowTrajetEdit(false); setEditingTrajetIdx(null); setNewTrajetTime(''); setNewTrajetPlace(''); setNewTrajetNote(''); setNewTrajetColor('#5b7042') }
  const deleteTrajetStep = (idx) => {
    if (trajets[trajetDir].length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Étape supprimée')
    setTrajets((t) => ({ ...t, [trajetDir]: t[trajetDir].filter((_, i) => i !== idx) }))
  }

  // Paramètres du voyage
  const openTripEdit = () => {
    setNewTripStart(trip.start); setNewTripEnd(trip.end)
    setNewTripOrigin(trip.origin); setNewTripEtape(trip.etape); setNewTripDest(trip.destination)
    setShowTripEdit(true)
  }
  const saveTrip = () => {
    if (!newTripStart || !newTripEnd || !newTripOrigin.trim() || !newTripDest.trim()) return
    if (newTripEnd < newTripStart) return
    haptic(ImpactStyle.Medium)
    setTrip({ start: newTripStart, end: newTripEnd, origin: newTripOrigin.trim(), etape: newTripEtape.trim(), destination: newTripDest.trim() })
    setShowTripEdit(false)
  }

  // Listes logistique personnalisables (en plus des items)
  const addLogiList = () => {
    if (!newLogiListName.trim()) return
    haptic(ImpactStyle.Medium)
    const key = `cl_${Date.now()}`
    setLogi((list) => [...list, { key, name: newLogiListName.trim(), emoji: newLogiListEmoji.trim() || '📦', items: [] }])
    setNewLogiListName(''); setNewLogiListEmoji(''); setShowAddLogiList(false)
  }
  const deleteLogiList = (key) => {
    if (logi.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Liste supprimée')
    setLogi((list) => list.filter((L) => L.key !== key))
    setChecks((c) => { const nc = { ...c }; delete nc[key]; return nc })
  }

  // Catégories de courses personnalisables
  const addCourseCategory = () => {
    if (!newCourseCatName.trim()) return
    haptic(ImpactStyle.Medium)
    const key = `cc_${Date.now()}`
    setCourses((list) => [...list, { key, name: newCourseCatName.trim(), items: [] }])
    setNewCourseCatName(''); setShowAddCourseCat(false)
  }
  const deleteCourseCategory = (key) => {
    if (courses.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Catégorie supprimée')
    setCourses((list) => list.filter((g) => g.key !== key))
    setChecks((c) => { const nc = { ...c }; delete nc[key]; return nc })
  }

  // Planning : ajout d'un jour
  const addDay = () => {
    if (!newDayDow.trim() || !newDayNum.trim() || !newDayTitle2.trim()) return
    haptic(ImpactStyle.Medium)
    const num = parseInt(newDayNum, 10)
    if (!num) return
    setDays((list) => {
      const next = [...list, { dow: newDayDow.trim(), num, title: newDayTitle2.trim(), sub: newDaySub2.trim(), items: [] }]
      next.sort((a, b) => a.num - b.num)
      return next
    })
    setNewDayDow(''); setNewDayNum(''); setNewDayTitle2(''); setNewDaySub2(''); setShowDayAdd(false)
  }

  const editMeteo = (idx) => {
    const w = meteo[idx]
    setNewMeteoDay(w.d)
    setNewMeteoNum(String(w.n))
    setNewMeteoHi(String(w.hi))
    setNewMeteoLo(String(w.lo))
    setNewMeteoRain(w.rain)
    setNewMeteoIcon(w.icon)
    setEditingMeteoIdx(idx)
    setShowMeteoEdit(true)
  }
  const openAddMeteo = () => {
    setNewMeteoDay(''); setNewMeteoNum(''); setNewMeteoHi(''); setNewMeteoLo(''); setNewMeteoRain(''); setNewMeteoIcon('☀️')
    setEditingMeteoIdx(null)
    setShowMeteoEdit(true)
  }
  const saveMeteo = () => {
    const hi = parseInt(newMeteoHi, 10)
    const lo = parseInt(newMeteoLo, 10)
    const n = parseInt(newMeteoNum, 10)
    if (!hi || !lo || !newMeteoDay.trim() || !n) return
    haptic(ImpactStyle.Medium)
    if (editingMeteoIdx === null) {
      setMeteo((list) => [...list, { d: newMeteoDay.trim(), n, hi, lo, rain: newMeteoRain, icon: newMeteoIcon }])
    } else {
      setMeteo((list) => list.map((w, i) => i === editingMeteoIdx ? { ...w, d: newMeteoDay.trim(), n, hi, lo, rain: newMeteoRain, icon: newMeteoIcon } : w))
    }
    closeMeteoEdit()
  }
  const closeMeteoEdit = () => { setShowMeteoEdit(false); setEditingMeteoIdx(null); setNewMeteoDay(''); setNewMeteoNum(''); setNewMeteoHi(''); setNewMeteoLo(''); setNewMeteoRain(''); setNewMeteoIcon('☀️') }
  const deleteMeteo = (idx) => {
    if (meteo.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Jour météo supprimé')
    setMeteo((list) => list.filter((_, i) => i !== idx))
  }

  const addLogiItem = () => {
    if (!newLogiItem.trim() || !editingLogiKey) return
    haptic(ImpactStyle.Medium)
    setLogi((list) => list.map((L) => L.key === editingLogiKey ? { ...L, items: [...L.items, newLogiItem] } : L))
    closeAddLogiItem()
  }
  const closeAddLogiItem = () => { setShowAddLogiItem(false); setEditingLogiKey(null); setNewLogiItem('') }
  const deleteLogiItem = (key, item) => {
    haptic(ImpactStyle.Medium)
    offerUndo('Article supprimé')
    setLogi((list) => list.map((L) => L.key === key ? { ...L, items: L.items.filter((i) => i !== item) } : L))
    setChecks((c) => { const nr = { ...(c[key] || {}) }; delete nr[item]; return { ...c, [key]: nr } })
  }

  const addCourseItem = () => {
    if (!newCourseItem.trim() || !editingCourseKey) return
    haptic(ImpactStyle.Medium)
    setCourses((list) => list.map((g) => g.key === editingCourseKey ? { ...g, items: [...g.items, newCourseItem] } : g))
    closeAddCourseItem()
  }
  const closeAddCourseItem = () => { setShowAddCourseItem(false); setEditingCourseKey(null); setNewCourseItem('') }
  const deleteCourseItem = (key, item) => {
    haptic(ImpactStyle.Medium)
    offerUndo('Article supprimé')
    setCourses((list) => list.map((g) => g.key === key ? { ...g, items: g.items.filter((i) => i !== item) } : g))
    setChecks((c) => { const nr = { ...(c[key] || {}) }; delete nr[item]; return { ...c, [key]: nr } })
  }

  // Budget total éditable
  const saveBudgetTotal = () => {
    const val = parseFloat(String(newBudgetTotal).replace(',', '.'))
    if (val > 0) { haptic(ImpactStyle.Medium); setBudgetTotal(val); setShowBudgetTotalEdit(false); setNewBudgetTotal('') }
  }

  // Hébergement éditable
  const openHebEdit = () => {
    setNewHebNom(hebergement.nom); setNewHebAdresse(hebergement.adresse)
    setNewHebArrivee(hebergement.arrivee); setNewHebDepart(hebergement.depart)
    setNewHebCapacite(hebergement.capacite); setNewHebWifiNom(hebergement.wifiNom)
    setNewHebWifiPass(hebergement.wifiPass); setNewHebContact(hebergement.contact)
    setShowHebEdit(true)
  }
  const saveHebergement = () => {
    haptic(ImpactStyle.Medium)
    setHebergement({ ...hebergement, nom: newHebNom, adresse: newHebAdresse, arrivee: newHebArrivee, depart: newHebDepart, capacite: newHebCapacite, wifiNom: newHebWifiNom, wifiPass: newHebWifiPass, contact: newHebContact })
    setShowHebEdit(false)
  }

  // Checklist trajet éditable
  const addTrajetCheckItem = () => {
    if (!newTrajetCheckItem.trim()) return
    haptic(ImpactStyle.Medium)
    setTrajetCheckItems((list) => [...list, newTrajetCheckItem])
    setNewTrajetCheckItem(''); setShowAddTrajetCheck(false)
  }
  const deleteTrajetCheckItem = (label) => {
    haptic(ImpactStyle.Medium)
    offerUndo('Item supprimé')
    setTrajetCheckItems((list) => list.filter((i) => i !== label))
    setChecks((c) => { const nr = { ...(c.tr_dep || {}) }; delete nr[label]; return { ...c, tr_dep: nr } })
  }

  // Export / import complet des données (JSON)
  const STORE_KEYS = ['saved', 'checks', 'expenses', 'meals', 'shoppingItems', 'days', 'visits', 'meteo', 'trajets', 'trajetSteps', 'trip', 'logi', 'courses', 'budgetTotal', 'hebergement', 'trajetCheckItems']
  const buildExport = () => JSON.stringify({
    app: 'cantou',
    schema: STORE_KEY,
    exportedAt: new Date().toISOString(),
    data: { saved, checks, expenses, meals, shoppingItems, days, visits, meteo, trajets, trip, logi, courses, budgetTotal, hebergement, trajetCheckItems },
  }, null, 2)
  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(buildExport())
      setExportCopied(true)
      setTimeout(() => setExportCopied(false), 2500)
    } catch { }
  }
  const downloadExport = () => {
    try {
      const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-')
      const blob = new Blob([buildExport()], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cantou-export-${ts}.json`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch { }
  }
  // Partage natif du fichier d'export vers Telegram/WhatsApp/etc., pour
  // synchroniser deux téléphones sans passer par un copier-coller manuel.
  const shareExport = async () => {
    const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-')
    const filename = `cantou-export-${ts}.json`
    const content = buildExport()
    try {
      if (Capacitor.isNativePlatform()) {
        await Filesystem.writeFile({ path: filename, data: content, directory: Directory.Cache, encoding: Encoding.UTF8 })
        const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache })
        await Share.share({ title: 'Export Cantou', text: 'Sauvegarde des données Cantou', url: uri, dialogTitle: 'Envoyer la sauvegarde' })
      } else if (navigator.canShare && navigator.share) {
        const file = new File([content], filename, { type: 'application/json' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Export Cantou' })
        } else {
          await navigator.share({ title: 'Export Cantou', text: content })
        }
      } else {
        downloadExport()
      }
    } catch { }
  }
  const parseImport = (text) => {
    setImportError(''); setImportPreview(null)
    if (!text.trim()) return
    let parsed
    try { parsed = JSON.parse(text) } catch { setImportError('JSON invalide — vérifier le contenu collé.'); return }
    // Accepte l'export enveloppé ({app:'cantou', data:{…}}) ou le store brut
    const data = parsed && parsed.app === 'cantou' && parsed.data ? parsed.data : parsed
    if (!data || typeof data !== 'object' || !STORE_KEYS.some((k) => k in data)) {
      setImportError('Ce JSON ne ressemble pas à un export Cantou.')
      return
    }
    setImportPreview(data)
  }
  const handleImportFile = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => { setImportText(String(reader.result)); parseImport(String(reader.result)) }
    reader.readAsText(f)
    e.target.value = ''
  }
  const applyImport = () => {
    if (!importPreview) return
    haptic(ImpactStyle.Medium)
    try { localStorage.setItem(STORE_KEY, JSON.stringify(importPreview)) } catch { }
    // Recharge l'app pour ré-hydrater tous les états depuis le store importé
    try { window.location.reload() } catch { }
  }
  const closeImport = () => { setShowImport(false); setImportText(''); setImportError(''); setImportPreview(null) }

  const TABS = [['accueil', '🏠', 'Accueil'], ['planning', '📅', 'Planning'], ['visites', '🥾', 'À faire'], ['repas', '🍽️', 'Repas'], ['budget', '💶', 'Budget']]

  /* ---------------------------------------------------------------- */
  return (
    <div style={s("height:100%;display:flex;flex-direction:column;overflow:hidden;background:#f4ecdc;color:#2f2a22;font-family:'Nunito Sans',system-ui,sans-serif;position:relative;")}>

      {/* ============ SOUS-ÉCRANS ============ */}
      {sub && (
        <div style={s('height:100%;display:flex;flex-direction:column;')}>
          <div style={s('display:flex;align-items:center;gap:8px;padding:54px 14px 12px;background:#fffdf8;border-bottom:1px solid #ece2cf;flex:0 0 auto;')}>
            <button onClick={() => setSub(null)} style={s('width:36px;height:36px;border:none;background:#f1e9da;border-radius:50%;font-size:22px;line-height:1;cursor:pointer;color:#4a5d3a;display:flex;align-items:center;justify-content:center;padding-bottom:3px;')}>‹</button>
            <span style={s('font-family:Quicksand;font-weight:700;font-size:18px;')}>{subTitle}</span>
          </div>
          <div style={s('flex:1;overflow-y:auto;')}>

            {/* TRAJET */}
            {sub === 'trajet' && (
              <div style={s('padding:16px 18px 40px;')}>
                <div style={s('background:#4a5d3a;border-radius:20px;padding:18px;color:#f3ecda;box-shadow:0 8px 20px rgba(74,93,58,0.2);position:relative;overflow:hidden;')}>
                  <Ridge />
                  <div style={s('position:relative;')}>
                    <div style={s('display:flex;align-items:center;gap:10px;font-family:Quicksand;font-weight:700;font-size:19px;flex-wrap:wrap;')}>
                      <span>{trajetDir === 'aller' ? trip.origin : trip.destination}</span>
                      <span style={s('color:#c9d2b6;')}>→</span>
                      <span>{trajetDir === 'aller' ? trip.destination : trip.origin}</span>
                    </div>
                    <div style={s('display:flex;gap:20px;margin-top:14px;flex-wrap:wrap;')}>
                      <div><div style={s('font-size:12px;color:#c9d2b6;')}>{trajetDir === 'aller' ? 'Départ' : 'Retour'}</div><div style={s('font-family:Quicksand;font-weight:700;font-size:16px;')}>{fmtDayShort(trajetDir === 'aller' ? trip.start : trip.end)}</div></div>
                      {trip.etape && <div><div style={s('font-size:12px;color:#c9d2b6;')}>Étape (nuit)</div><div style={s('font-family:Quicksand;font-weight:700;font-size:16px;')}>{trip.etape}</div></div>}
                    </div>
                  </div>
                </div>
                <div style={s('margin-top:14px;display:flex;background:#ece2cf;border-radius:14px;padding:4px;')}>
                  <button data-testid="btn-trajet-aller" onClick={() => setTrajetDir('aller')} style={s(`flex:1;border:none;border-radius:10px;padding:9px;font-weight:700;font-family:Quicksand;font-size:15px;cursor:pointer;background:${trajetDir === 'aller' ? '#4a5d3a' : 'transparent'};color:${trajetDir === 'aller' ? '#fffaf0' : '#6b6354'};`)}>Aller</button>
                  <button data-testid="btn-trajet-retour" onClick={() => setTrajetDir('retour')} style={s(`flex:1;border:none;border-radius:10px;padding:9px;font-weight:700;font-family:Quicksand;font-size:15px;cursor:pointer;background:${trajetDir === 'retour' ? '#4a5d3a' : 'transparent'};color:${trajetDir === 'retour' ? '#fffaf0' : '#6b6354'};`)}>Retour</button>
                </div>
                <div style={s('margin-top:14px;background:#f1e4d4;border-radius:16px;padding:14px;font-size:13px;line-height:1.5;color:#6b5a45;')}>👶 Avec les enfants : une pause toutes les 1 h 30, et la playlist d’histoires audio prête pour la route.</div>
                <div style={s('margin:20px 0 12px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#8a8273;text-transform:uppercase;')}>Les etapes · {trajetDir}</div>
                {trajets[trajetDir].map((st, i) => (
                  <div key={i} style={s('display:flex;gap:12px;')}>
                    <div style={s('width:48px;flex:0 0 auto;font-size:13px;font-weight:700;color:#9a917f;padding-top:1px;')}>{st.time}</div>
                    <div style={s('display:flex;flex-direction:column;align-items:center;flex:0 0 auto;')}>
                      <div style={s(`width:13px;height:13px;border-radius:50%;background:${st.color};margin-top:3px;border:2px solid #f4ecdc;box-shadow:0 0 0 1px ${st.color};`)} />
                      <div style={s('flex:1;width:2px;background:#e3d8c2;margin:3px 0;')} />
                    </div>
                    <div style={s('flex:1;padding-bottom:18px;')}>
                      <div style={s('display:flex;align-items:center;gap:8px;')}>
                        <div style={s('flex:1;')}>
                          <div style={s('font-weight:700;font-size:15px;')}>{st.place}</div>
                          <div style={s('font-size:13px;color:#8a8273;margin-top:2px;')}>{st.note}</div>
                        </div>
                        <button onClick={() => editTrajetStep(i)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;flex:0 0 auto;')}>✏️</button>
                        <button onClick={() => deleteTrajetStep(i)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;flex:0 0 auto;color:#b8503f;')}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => { setEditingTrajetIdx(null); setNewTrajetTime(''); setNewTrajetPlace(''); setNewTrajetNote(''); setNewTrajetColor('#5b7042'); setShowTrajetEdit(true) }} style={s('width:100%;margin:4px 0 16px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:8px;cursor:pointer;')}>+ Ajouter une étape</button>
                <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;')}>
                  <div style={s('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#8a8273;text-transform:uppercase;')}>Avant de partir · {tr.done}/{tr.total}</div>
                  <button onClick={() => setShowAddTrajetCheck(true)} style={s('border:none;background:transparent;cursor:pointer;font-size:18px;padding:2px 4px;color:#9c6b4a;')}>＋</button>
                </div>
                <div style={s('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;overflow:hidden;')}>
                  {tr.items.map((it) => (
                    <div key={it.label} style={s('display:flex;align-items:center;border-bottom:1px solid #f1e9da;')}>
                      <div style={s('flex:1;')}><CheckRow label={it.label} checked={it.checked} onToggle={() => toggleCheck('tr_dep', it.label)} /></div>
                      <button onClick={() => deleteTrajetCheckItem(it.label)} style={s('border:none;background:transparent;cursor:pointer;font-size:13px;padding:4px 10px;color:#b8503f;flex:0 0 auto;')}>🗑️</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LOGISTIQUE */}
            {sub === 'logistique' && (
              <div style={s('padding:16px 18px 40px;')}>
                <div style={s('display:flex;justify-content:flex-end;margin-bottom:12px;')}>
                  <button onClick={() => setLogiSorted(!logiSorted)} style={s(`border:1px solid ${logiSorted ? '#4a5d3a' : '#ece2cf'};background:${logiSorted ? '#4a5d3a' : '#fffdf8'};color:${logiSorted ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:6px 13px;font-weight:700;font-size:12px;cursor:pointer;`)}>↑ Non cochés en premier</button>
                </div>
                {logi.map((L) => {
                  const b = buildList(checks, L.key, L.items)
                  const displayItems = logiSorted ? [...b.items].sort((a, b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0)) : b.items
                  return (
                    <div key={L.key} style={s('margin-bottom:18px;')}>
                      <div style={s('display:flex;align-items:center;gap:9px;margin-bottom:8px;')}>
                        <span style={s('font-size:18px;')}>{L.emoji}</span>
                        <span style={s('font-family:Quicksand;font-weight:700;font-size:16px;flex:1;')}>{L.name}</span>
                        <span style={s('font-size:12px;color:#8a8273;font-weight:700;')}>{b.done}/{b.total}</span>
                        <button onClick={() => deleteLogiList(L.key)} style={s('border:none;background:transparent;cursor:pointer;font-size:13px;padding:2px 4px;color:#b8503f;')}>🗑️</button>
                      </div>
                      <div style={s('height:7px;border-radius:7px;background:#efe6d4;overflow:hidden;margin-bottom:8px;')}><div style={s(`height:100%;background:#cf7d3c;width:${b.pct}%;`)} /></div>
                      <div style={s('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;overflow:hidden;')}>
                        {displayItems.map((it) => (
                          <div key={it.label} style={s('display:flex;align-items:center;width:100%;border-bottom:1px solid #f1e9da;')}>
                            <button onClick={() => toggleCheck(L.key, it.label)} style={s('flex:1;text-align:left;border:none;background:transparent;display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;')}>
                              {it.checked ? (
                                <>
                                  <span style={s('width:24px;height:24px;flex:0 0 auto;border-radius:8px;background:#5b7042;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;')}>✓</span>
                                  <span style={s('font-size:14px;color:#b3a892;text-decoration:line-through;')}>{it.label}</span>
                                </>
                              ) : (
                                <>
                                  <span style={s('width:24px;height:24px;flex:0 0 auto;border-radius:8px;border:2px solid #d8cbb0;background:#fff;')} />
                                  <span style={s('font-size:14px;color:#2f2a22;')}>{it.label}</span>
                                </>
                              )}
                            </button>
                            <button onClick={() => deleteLogiItem(L.key, it.label)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 8px;color:#b8503f;flex:0 0 auto;')}>🗑️</button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => { setEditingLogiKey(L.key); setShowAddLogiItem(true) }} style={s('width:100%;margin-top:8px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:8px;cursor:pointer;')}>+ Ajouter article</button>
                    </div>
                  )
                })}
                <button data-testid="btn-add-logi-list" onClick={() => setShowAddLogiList(true)} style={s('width:100%;margin-top:4px;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:13px;cursor:pointer;')}>+ Nouvelle liste</button>
              </div>
            )}

            {/* HEBERGEMENT */}
            {sub === 'hebergement' && (
              <div style={s('padding:16px 18px 40px;')}>
                <div style={s('height:150px;border-radius:18px;overflow:hidden;box-shadow:0 2px 8px rgba(74,93,58,0.1);')}>
                  <GiteScene />
                </div>
                <div style={s('display:flex;align-items:center;margin-top:14px;gap:10px;')}>
                  <div style={s('font-family:Quicksand;font-weight:700;font-size:20px;flex:1;')}>{hebergement.nom}</div>
                  <button onClick={openHebEdit} style={s('border:none;background:transparent;cursor:pointer;font-size:18px;padding:4px;')}>✏️</button>
                </div>
                <div style={s('font-size:13px;color:#8a8273;margin-top:2px;')}>📍 {hebergement.adresse}</div>
                <div style={s('display:flex;gap:10px;margin-top:14px;')}>
                  <div style={s('flex:1;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px;')}><div style={s('font-size:12px;color:#8a8273;')}>Arrivée</div><div style={s('font-weight:700;font-size:14px;margin-top:3px;')}>{hebergement.arrivee}</div></div>
                  <div style={s('flex:1;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px;')}><div style={s('font-size:12px;color:#8a8273;')}>Départ</div><div style={s('font-weight:700;font-size:14px;margin-top:3px;')}>{hebergement.depart}</div></div>
                </div>
                <div style={s('margin-top:10px;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px 14px;font-size:14px;')}>🛏️ {hebergement.capacite}</div>
                <div style={s('margin:18px 0 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#8a8273;text-transform:uppercase;')}>Équipements</div>
                <div style={s('display:flex;flex-wrap:wrap;gap:8px;')}>
                  {HEB_EQUIP.map((eq) => <span key={eq} style={s('background:#fffdf8;border:1px solid #e3d8c2;border-radius:999px;padding:7px 13px;font-size:13px;font-weight:600;color:#6b6354;')}>{eq}</span>)}
                </div>
                <div style={s('margin-top:16px;background:#e7ecdf;border-radius:14px;padding:14px;')}>
                  <div style={s('font-weight:700;font-family:Quicksand;')}>📶 Wi-Fi</div>
                  <div style={s('font-size:13px;color:#4a5d3a;margin-top:5px;')}>Réseau : <b>{hebergement.wifiNom}</b></div>
                  <div style={s('font-size:13px;color:#4a5d3a;margin-top:2px;')}>Code : <b>{hebergement.wifiPass}</b></div>
                </div>
                <div style={s('margin-top:10px;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px 14px;font-size:14px;')}>📞 {hebergement.contact}</div>
                <div style={s('margin-top:10px;background:#f1e4d4;border-radius:14px;padding:14px;font-size:13px;line-height:1.5;color:#6b5a45;')}>{hebergement.note}</div>
              </div>
            )}

            {/* METEO */}
            {sub === 'meteo' && (
              <div style={s('padding:16px 18px 40px;')}>
                <div style={s('background:#4a5d3a;border-radius:18px;padding:16px;color:#f3ecda;position:relative;overflow:hidden;')}>
                  <Ridge opacity={0.14} />
                  <div style={s('position:relative;')}>
                    <div style={s('font-family:Quicksand;font-weight:700;font-size:18px;')}>Puy Mary &amp; vallées</div>
                    <div style={s('font-size:13px;color:#dbe2c9;margin-top:2px;')}>Prévisions du {fmtDayShort(trip.start)} au {fmtDayShort(trip.end)}</div>
                  </div>
                </div>
                <div style={s('margin-top:12px;background:#eee7d4;border-radius:14px;padding:13px;font-size:13px;line-height:1.5;color:#6b5a45;')}>🧥 En altitude (Puy Mary, 1 783 m) il fait plus frais — prévoir une polaire même en été !</div>
                <div style={s('margin-top:14px;display:flex;flex-direction:column;gap:8px;')}>
                  {meteo.map((w, i) => (
                    <div key={i} style={s('display:flex;align-items:center;gap:6px;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:6px 8px 6px 16px;')}>
                      <button onClick={() => editMeteo(i)} style={s('flex:1;display:flex;align-items:center;gap:14px;border:none;background:transparent;cursor:pointer;text-align:left;padding:6px 0;')}>
                        <div style={s('width:64px;font-weight:700;font-size:14px;')}>{w.d} {w.n}</div>
                        <div style={s('font-size:24px;width:32px;text-align:center;')}>{w.icon}</div>
                        <div style={s('font-size:12px;color:#6f8fb0;flex:1;font-weight:600;')}>💧 {w.rain}</div>
                        <div style={s('font-family:Quicksand;font-weight:700;font-size:15px;')}>{w.hi}° <span style={s('color:#b3a892;')}>{w.lo}°</span></div>
                      </button>
                      <button onClick={() => deleteMeteo(i)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 8px;color:#b8503f;flex:0 0 auto;')}>🗑️</button>
                    </div>
                  ))}
                </div>
                <button onClick={openAddMeteo} style={s('width:100%;margin-top:10px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:14px;padding:10px;cursor:pointer;')}>+ Ajouter un jour</button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ============ ÉCRANS PRINCIPAUX (onglets) ============ */}
      {!sub && (
        <div style={s('height:100%;display:flex;flex-direction:column;')}>
          <div style={s('flex:1;overflow-y:auto;')}>

            {/* ACCUEIL */}
            {tab === 'accueil' && (
              <div data-testid="screen-accueil">
                <div style={s('padding:54px 18px 6px;display:flex;align-items:center;justify-content:space-between;')}>
                  <div style={s('font-family:Quicksand;font-weight:700;font-size:18px;')}>Bonjour 👋</div>
                  <div style={s('width:38px;height:38px;border-radius:50%;background:#cf7d3c;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:Quicksand;')}>F</div>
                </div>
                <div style={s('margin:8px 18px 14px;background:#4a5d3a;border-radius:26px;padding:20px;color:#f3ecda;box-shadow:0 10px 26px rgba(74,93,58,0.24);position:relative;overflow:hidden;')}>
                  <Ridge />
                  <button data-testid="btn-trip-settings" onClick={openTripEdit} style={s('position:absolute;top:14px;right:14px;z-index:2;border:none;background:rgba(255,255,255,0.15);color:#f3ecda;border-radius:10px;padding:6px 9px;font-size:15px;cursor:pointer;')}>⚙️</button>
                  <div style={s('position:relative;')}>
                    <div style={s('font-size:12px;letter-spacing:1.5px;font-weight:700;color:#c9d2b6;')}>PROCHAINE AVENTURE</div>
                    <div style={s('font-family:Quicksand;font-weight:700;font-size:30px;line-height:1.08;margin-top:8px;')}>Puy Mary,<br />Cantal</div>
                    <div style={s('margin-top:9px;font-size:14px;color:#dbe2c9;')}>{fmtDayShort(trip.start)} → {fmtDayShort(trip.end)} {fmtMonthYear(trip.end)}</div>
                    <div style={s('display:flex;gap:8px;margin-top:16px;')}>
                      <div style={s('background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 13px;font-weight:700;font-family:Quicksand;')}>J-{countdown}</div>
                      <div style={s('background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 13px;font-weight:700;')}>☀️ 24° sur place</div>
                    </div>
                  </div>
                </div>

                {today && (
                  <div data-testid="today-card" style={s('margin:0 18px 14px;background:#fffdf8;border:2px solid #cf7d3c;border-radius:20px;padding:16px;box-shadow:0 4px 14px rgba(207,125,60,0.18);')}>
                    <div style={s('display:flex;align-items:center;justify-content:space-between;')}>
                      <div style={s('font-size:12px;letter-spacing:1px;font-weight:700;color:#cf7d3c;')}>🗓️ AUJOURD'HUI · {today.d.dow} {today.d.num}</div>
                      {today.w && <div style={s('font-family:Quicksand;font-weight:700;font-size:14px;')}>{today.w.icon} {today.w.hi}° <span style={s('color:#b3a892;')}>{today.w.lo}°</span></div>}
                    </div>
                    <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-top:6px;')}>{today.d.title}</div>
                    <div style={s('font-size:13px;color:#8a8273;margin-top:1px;')}>{today.d.sub}</div>
                    {today.d.items.length > 0 && (
                      <div style={s('margin-top:12px;display:flex;flex-direction:column;gap:8px;')}>
                        {today.d.items.map((it, i) => (
                          <div key={i} style={s('display:flex;align-items:center;gap:10px;')}>
                            <span style={s(`width:8px;height:8px;border-radius:50%;background:${it.color};flex:0 0 auto;`)} />
                            <span style={s('font-size:13px;font-weight:700;color:#9a917f;width:44px;flex:0 0 auto;')}>{it.time}</span>
                            <span style={s('font-size:14px;flex:1;')}>{it.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {today.meal && (
                      <div style={s('margin-top:12px;background:#f1e4d4;border-radius:12px;padding:10px 13px;font-size:13px;color:#6b5a45;')}>🍽️ Ce soir : <b>{today.meal.dish}</b></div>
                    )}
                    <button onClick={() => { setTab('planning'); setDay(today.dayIdx) }} style={s('margin-top:13px;width:100%;border:none;background:#cf7d3c;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:13px;padding:12px;cursor:pointer;')}>Voir le planning du jour →</button>
                  </div>
                )}

                <div style={s('margin:0 18px 14px;border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(74,93,58,0.08);')}>
                  <Panorama />
                </div>

                <div style={s('margin:0 18px 12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:20px;padding:16px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
                  <div style={s('display:flex;align-items:center;gap:12px;')}>
                    <div style={s('width:44px;height:44px;border-radius:14px;background:#dfeae6;display:flex;align-items:center;justify-content:center;font-size:22px;')}>🚗</div>
                    <div style={s('flex:1;')}>
                      <div style={s('font-family:Quicksand;font-weight:700;font-size:16px;')}>Le grand départ</div>
                      <div style={s('font-size:13px;color:#8a8273;margin-top:1px;')}>{fmtDayShort(trip.start)} · depuis {trip.origin}{trip.etape ? ` · via ${trip.etape}` : ''}</div>
                    </div>
                  </div>
                  <button onClick={() => setSub('trajet')} style={s('margin-top:13px;width:100%;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:13px;padding:12px;cursor:pointer;')}>Voir le trajet →</button>
                </div>

                <button onClick={() => setSub('logistique')} style={s('margin:0 18px 14px;width:calc(100% - 36px);text-align:left;background:#fffdf8;border:1px solid #efe6d4;border-radius:20px;padding:16px;cursor:pointer;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
                  <div style={s('display:flex;justify-content:space-between;align-items:center;')}>
                    <div style={s('font-family:Quicksand;font-weight:700;font-size:16px;')}>🧳 Valises &amp; préparatifs</div>
                    <div style={s('font-size:13px;color:#8a8273;font-weight:700;')}>{packDone}/{packTotal}</div>
                  </div>
                  <div style={s('margin-top:11px;height:9px;border-radius:9px;background:#efe6d4;overflow:hidden;')}><div style={s(`height:100%;border-radius:9px;background:#cf7d3c;width:${packPct}%;`)} /></div>
                </button>

                <div style={s('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#8a8273;text-transform:uppercase;')}>Tout le séjour</div>
                <div style={s('padding:0 18px 12px;display:grid;grid-template-columns:1fr 1fr;gap:12px;')}>
                  {MODULES.map((m) => (
                    <button key={m.name} onClick={() => openModule(m.action)} style={s('text-align:left;border:1px solid #efe6d4;background:#fffdf8;border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:10px;cursor:pointer;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
                      <div style={s(`width:42px;height:42px;border-radius:13px;background:${m.bg};display:flex;align-items:center;justify-content:center;font-size:21px;`)}>{m.emoji}</div>
                      <div>
                        <div style={s('font-family:Quicksand;font-weight:700;font-size:15px;')}>{m.name}</div>
                        <div style={s('font-size:12px;color:#8a8273;margin-top:1px;')}>{m.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={s('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#8a8273;text-transform:uppercase;')}>Sauvegarde</div>
                <div style={s('padding:0 18px 12px;display:flex;gap:12px;')}>
                  <button data-testid="btn-export" onClick={() => { setExportCopied(false); setShowExport(true) }} style={s('flex:1;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:13px;cursor:pointer;font-family:Quicksand;font-weight:700;font-size:14px;color:#4a5d3a;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>⬇️ Exporter (JSON)</button>
                  <button data-testid="btn-import" onClick={() => setShowImport(true)} style={s('flex:1;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:13px;cursor:pointer;font-family:Quicksand;font-weight:700;font-size:14px;color:#9c6b4a;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>⬆️ Importer</button>
                </div>
                <div style={s('height:16px;')} />
              </div>
            )}

            {/* PLANNING */}
            {tab === 'planning' && (
              <div data-testid="screen-planning">
                <div style={s('padding:54px 18px 4px;')}>
                  <div style={s('font-family:Quicksand;font-weight:700;font-size:26px;')}>Planning</div>
                  <div style={s('font-size:13px;color:#8a8273;')}>{days.length} jours · {fmtDayShort(trip.start)} → {fmtDayShort(trip.end)}</div>
                </div>
                <div style={s('display:flex;gap:8px;overflow-x:auto;padding:12px 18px 16px;')}>
                  {days.map((d, i) => (
                    <button key={i} onClick={() => setDay(i)} style={s(`flex:0 0 auto;width:54px;border:1px solid ${i === day ? '#4a5d3a' : '#ece2cf'};background:${i === day ? '#4a5d3a' : '#fffdf8'};color:${i === day ? '#fffaf0' : '#6b6354'};border-radius:16px;padding:10px 0;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;`)}>
                      <span style={s('font-size:12px;font-weight:600;')}>{d.dow}</span>
                      <span style={s('font-family:Quicksand;font-weight:700;font-size:18px;')}>{d.num}</span>
                    </button>
                  ))}
                  <button data-testid="btn-add-day" onClick={() => setShowDayAdd(true)} style={s('flex:0 0 auto;width:54px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;border-radius:16px;padding:10px 0;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:20px;font-weight:700;')}>＋</button>
                </div>
                <div style={s('padding:0 18px 8px;')}>
                  <div style={s('display:flex;align-items:center;justify-content:space-between;')}>
                    <div>
                      <div style={s('font-family:Quicksand;font-weight:700;font-size:20px;')}>{cur.title}</div>
                      <div style={s('font-size:13px;color:#8a8273;margin-bottom:16px;')}>{cur.sub}</div>
                    </div>
                    <button onClick={() => editDay(day)} style={s('border:none;background:transparent;cursor:pointer;font-size:16px;padding:4px;flex:0 0 auto;')}>✏️</button>
                  </div>
                  {cur.items.map((it, i) => (
                    <div key={i} style={s('display:flex;gap:12px;')}>
                      <div style={s('width:48px;flex:0 0 auto;font-size:13px;font-weight:700;color:#9a917f;padding-top:1px;')}>{it.time}</div>
                      <div style={s('display:flex;flex-direction:column;align-items:center;flex:0 0 auto;')}>
                        <div style={s(`width:13px;height:13px;border-radius:50%;background:${it.color};margin-top:3px;border:2px solid #f4ecdc;box-shadow:0 0 0 1px ${it.color};`)} />
                        <div style={s('flex:1;width:2px;background:#e3d8c2;margin:3px 0;')} />
                      </div>
                      <div style={s('flex:1;padding-bottom:18px;')}>
                        <div style={s('display:flex;align-items:center;gap:8px;')}>
                          <div style={s('flex:1;')}>
                            <div style={s('font-weight:700;font-size:15px;')}>{it.title}</div>
                            {it.note && <div style={s('font-size:13px;color:#8a8273;margin-top:2px;')}>{it.note}</div>}
                          </div>
                          <button onClick={() => editActivity(day, i)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;flex:0 0 auto;')}>✏️</button>
                          <button onClick={() => deleteActivity(day, i)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;flex:0 0 auto;color:#b8503f;')}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => startAddActivity(day)} style={s('margin-top:12px;width:100%;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:12px;padding:10px;cursor:pointer;')}>+ Ajouter activite</button>
                </div>
                <div style={s('height:16px;')} />
              </div>
            )}

            {/* VISITES */}
            {tab === 'visites' && (
              <div data-testid="screen-visites">
                <div style={s('padding:54px 18px 4px;')}>
                  <div style={s('font-family:Quicksand;font-weight:700;font-size:26px;')}>À faire</div>
                  <div style={s('font-size:13px;color:#8a8273;')}>Autour du Puy Mary · {savedCount} enregistrées ♥</div>
                </div>
                <div style={s('display:flex;gap:8px;overflow-x:auto;padding:12px 18px 14px;')}>
                  {FILTERS.map((f) => (
                    <button key={f} onClick={() => setFilter(f)} style={s(`flex:0 0 auto;border:1px solid ${filter === f ? '#4a5d3a' : '#ece2cf'};background:${filter === f ? '#4a5d3a' : '#fffdf8'};color:${filter === f ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:8px 15px;font-weight:700;font-size:13px;cursor:pointer;`)}>{f}</button>
                  ))}
                </div>
                <div style={s('display:flex;gap:8px;padding:0 18px 14px;')}>
                  {[['dist', '📍 Distance'], ['cat', '🏷️ Catégorie']].map(([k, label]) => (
                    <button key={k} onClick={() => setVisitSort(visitSort === k ? null : k)} style={s(`flex:0 0 auto;border:1px solid ${visitSort === k ? '#4a5d3a' : '#ece2cf'};background:${visitSort === k ? '#4a5d3a' : '#fffdf8'};color:${visitSort === k ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:6px 13px;font-weight:700;font-size:12px;cursor:pointer;`)}>{label}</button>
                  ))}
                </div>
                <div style={s('padding:0 18px 8px;display:flex;justify-content:flex-end;')}>
                  <button onClick={() => { setEditingVisitId(null); setNewVisitName(''); setNewVisitDist(''); setNewVisitDur(''); setNewVisitAge(''); setNewVisitCat('Nature'); setShowVisitEdit(true) }} style={s('border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:7px 14px;cursor:pointer;')}>+ Ajouter visite</button>
                </div>
                <div style={s('padding:0 18px;display:flex;flex-direction:column;gap:12px;')}>
                  {filteredVisits.map((v) => {
                    const sv = !!saved[v.id]
                    return (
                      <div key={v.id} style={s('display:flex;gap:12px;align-items:center;background:#fffdf8;border:1px solid #efe6d4;border-radius:18px;padding:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
                        <div style={s('width:52px;height:52px;flex:0 0 auto;border-radius:14px;background:#f3ece0;display:flex;align-items:center;justify-content:center;font-size:26px;')}>{v.emoji}</div>
                        <div style={s('flex:1;min-width:0;')}>
                          <div style={s('display:flex;align-items:center;gap:6px;')}>
                            <span style={s(`width:8px;height:8px;border-radius:50%;background:${VCAT[v.cat]};flex:0 0 auto;`)} />
                            <span style={s(`font-size:11px;font-weight:700;color:${VCAT[v.cat]};text-transform:uppercase;letter-spacing:0.5px;`)}>{v.cat}</span>
                          </div>
                          <div style={s('font-family:Quicksand;font-weight:700;font-size:15px;margin-top:2px;')}>{v.name}</div>
                          <div style={s('font-size:12px;color:#8a8273;margin-top:2px;')}>{v.dist}  ·  {v.dur}</div>
                          <div style={s('display:inline-block;margin-top:7px;font-size:11px;font-weight:700;color:#6b6354;background:#f1e9da;border-radius:8px;padding:3px 8px;')}>👶 {v.age}</div>
                        </div>
                        <button onClick={() => toggleSaved(v.id)} style={s('flex:0 0 auto;width:40px;height:40px;border:none;background:transparent;cursor:pointer;font-size:24px;line-height:1;')}>
                          {sv ? <span style={s('color:#b8503f;')}>♥</span> : <span style={s('color:#cabfa6;')}>♡</span>}
                        </button>
                        <button onClick={() => editVisit(v.id)} style={s('flex:0 0 auto;border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;')}>✏️</button>
                        <button onClick={() => deleteVisit(v.id)} style={s('flex:0 0 auto;border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;color:#b8503f;')}>🗑️</button>
                      </div>
                    )
                  })}
                </div>
                <div style={s('height:16px;')} />
              </div>
            )}

            {/* REPAS */}
            {tab === 'repas' && (
              <div data-testid="screen-repas">
                <div style={s('padding:54px 18px 14px;')}>
                  <div style={s('font-family:Quicksand;font-weight:700;font-size:26px;')}>Repas &amp; courses</div>
                </div>
                <div style={s('margin:0 18px 16px;display:flex;background:#ece2cf;border-radius:14px;padding:4px;')}>
                  <button onClick={() => setMealTab('repas')} style={s(`flex:1;border:none;border-radius:10px;padding:9px;font-weight:700;font-family:Quicksand;font-size:15px;cursor:pointer;background:${mealTab === 'repas' ? '#4a5d3a' : 'transparent'};color:${mealTab === 'repas' ? '#fffaf0' : '#6b6354'};`)}>Menus</button>
                  <button onClick={() => setMealTab('courses')} style={s(`flex:1;border:none;border-radius:10px;padding:9px;font-weight:700;font-family:Quicksand;font-size:15px;cursor:pointer;background:${mealTab === 'courses' ? '#4a5d3a' : 'transparent'};color:${mealTab === 'courses' ? '#fffaf0' : '#6b6354'};`)}>Courses</button>
                </div>

                {mealTab === 'repas' && (
                  <>
                    <div style={s('padding:0 18px;display:flex;flex-direction:column;gap:10px;')}>
                      {meals.map((ml) => (
                        <div key={ml.id} style={s('display:flex;align-items:center;gap:14px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:13px 14px;')}>
                          <div style={s('font-family:Quicksand;font-weight:700;font-size:13px;color:#cf7d3c;width:54px;flex:0 0 auto;')}>{ml.day}</div>
                          <div style={s('font-weight:600;font-size:14px;flex:1;')}>{ml.dish}</div>
                          <button onClick={() => editMeal(ml.id)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;')}>✏️</button>
                          <button onClick={() => deleteMeal(ml.id)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;color:#b8503f;')}>🗑️</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={openAddMeal} style={s('display:block;width:calc(100% - 36px);margin:10px 18px 0;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:14px;padding:10px;cursor:pointer;')}>+ Ajouter un repas</button>
                    <div style={s('margin:14px 18px 16px;background:#f1e4d4;border-radius:16px;padding:14px;font-size:13px;line-height:1.5;color:#6b5a45;')}>🧀 Spécialités à goûter : Cantal AOP, Salers, Saint-Nectaire, truffade &amp; aligot maison.</div>
                  </>
                )}

                {mealTab === 'courses' && (
                  <div style={s('padding:0 18px 16px;')}>
                    <div style={s('display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#6b6354;margin-bottom:6px;')}><span>Liste de courses</span><span>{coursesDone}/{coursesTotal}</span></div>
                    <div style={s('height:9px;border-radius:9px;background:#efe6d4;overflow:hidden;margin-bottom:14px;')}><div style={s(`height:100%;background:#5b7042;width:${coursesPct}%;`)} /></div>
                    <div style={s('display:flex;justify-content:flex-end;margin-bottom:14px;')}>
                      <button onClick={() => setCoursesSorted(!coursesSorted)} style={s(`border:1px solid ${coursesSorted ? '#4a5d3a' : '#ece2cf'};background:${coursesSorted ? '#4a5d3a' : '#fffdf8'};color:${coursesSorted ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:6px 13px;font-weight:700;font-size:12px;cursor:pointer;`)}>↑ Non cochés en premier</button>
                    </div>
                    {coursesGroups.map((g) => (
                      <div key={g.key} style={s('margin-bottom:16px;')}>
                        <div style={s('display:flex;align-items:baseline;gap:8px;margin-bottom:7px;')}>
                          <span style={s('font-family:Quicksand;font-weight:700;font-size:15px;flex:1;')}>{g.name}</span>
                          <span style={s('font-size:12px;color:#8a8273;')}>{g.doneStr}</span>
                          <button onClick={() => deleteCourseCategory(g.key)} style={s('border:none;background:transparent;cursor:pointer;font-size:13px;padding:2px 4px;color:#b8503f;')}>🗑️</button>
                        </div>
                        <div style={s('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;overflow:hidden;')}>
                          {(coursesSorted ? [...g.items].sort((a, b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0)) : g.items).map((it) => (
                            <div key={it.label} style={s('display:flex;align-items:center;width:100%;border-bottom:1px solid #f1e9da;')}>
                              <button onClick={() => toggleCheck(g.key, it.label)} style={s('flex:1;text-align:left;border:none;background:transparent;display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;')}>
                                {it.checked ? (
                                  <>
                                    <span style={s('width:24px;height:24px;flex:0 0 auto;border-radius:8px;background:#5b7042;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;')}>✓</span>
                                    <span style={s('font-size:14px;color:#b3a892;text-decoration:line-through;')}>{it.label}</span>
                                  </>
                                ) : (
                                  <>
                                    <span style={s('width:24px;height:24px;flex:0 0 auto;border-radius:8px;border:2px solid #d8cbb0;background:#fff;')} />
                                    <span style={s('font-size:14px;color:#2f2a22;')}>{it.label}</span>
                                  </>
                                )}
                              </button>
                              <button onClick={() => deleteCourseItem(g.key, it.label)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 8px;color:#b8503f;flex:0 0 auto;')}>🗑️</button>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => { setEditingCourseKey(g.key); setShowAddCourseItem(true) }} style={s('width:100%;margin-top:8px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:8px;cursor:pointer;')}>+ Ajouter article</button>
                      </div>
                    ))}
                    <button data-testid="btn-add-course-cat" onClick={() => setShowAddCourseCat(true)} style={s('width:100%;margin-top:4px;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:13px;cursor:pointer;')}>+ Nouvelle catégorie</button>
                    <div style={s('margin-top:20px;padding-top:16px;border-top:1px solid #efe6d4;')}>
                      <div style={s('font-family:Quicksand;font-weight:700;font-size:13px;color:#8a8273;text-transform:uppercase;margin-bottom:10px;')}>Gerer les articles</div>
                      <div style={s('display:flex;flex-direction:column;gap:8px;')}>
                        {shoppingItems.map((item) => (
                          <div key={item.id} style={s('display:flex;align-items:center;gap:12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:12px;padding:10px 12px;')}>
                            <input type="checkbox" checked={item.checked} onChange={() => toggleShoppingItem(item.id)} style={s('cursor:pointer;')} />
                            <span style={s('font-size:14px;flex:1;')}>{item.label}</span>
                            <button onClick={() => deleteShoppingItem(item.id)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;color:#b8503f;padding:4px;')}>🗑️</button>
                          </div>
                        ))}
                      </div>
                      <div style={s('display:flex;gap:8px;margin-top:10px;')}>
                        <input value={newShoppingItem} onChange={(e) => setNewShoppingItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addShoppingItem()} placeholder="Nouvel article…" style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:10px 12px;font-size:14px;')} />
                        <button onClick={addShoppingItem} style={s('border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:0 16px;cursor:pointer;')}>+ Ajouter</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BUDGET */}
            {tab === 'budget' && (
              <div data-testid="screen-budget">
                <div style={s('padding:54px 18px 14px;')}>
                  <div style={s('font-family:Quicksand;font-weight:700;font-size:26px;')}>Budget</div>
                </div>
                <div style={s('margin:0 18px 14px;background:#4a5d3a;border-radius:22px;padding:18px;color:#f3ecda;box-shadow:0 10px 24px rgba(74,93,58,0.22);')}>
                  <div style={s('display:flex;justify-content:space-between;align-items:flex-end;')}>
                    <div><div style={s('font-size:12px;color:#c9d2b6;font-weight:700;letter-spacing:0.5px;')}>RESTANT</div><div style={s('font-family:Quicksand;font-weight:700;font-size:30px;margin-top:2px;')}>{eur(remain)}</div></div>
                    <div style={s('text-align:right;')}>
                      <div style={s('font-size:12px;color:#dbe2c9;')}>sur {eur(budgetTotal)}</div>
                      <button onClick={() => { setNewBudgetTotal(String(budgetTotal)); setShowBudgetTotalEdit(true) }} style={s('margin-top:4px;border:none;background:rgba(255,255,255,0.15);color:#dbe2c9;border-radius:8px;padding:3px 8px;font-size:11px;cursor:pointer;')}>✏️ Modifier</button>
                    </div>
                  </div>
                  <div style={s('margin-top:14px;height:10px;border-radius:10px;background:rgba(255,255,255,0.18);overflow:hidden;')}><div style={s(`height:100%;background:#e8c07a;width:${spentPct}%;`)} /></div>
                  <div style={s('margin-top:8px;font-size:13px;color:#dbe2c9;')}>Dépensé {eur(spent)} · {spentPct} %</div>
                </div>
                {spentPct >= 80 && (
                  <div style={s('margin:0 18px 14px;background:#b8503f;border-radius:14px;padding:12px 16px;color:#fff;display:flex;align-items:center;gap:10px;')}>
                    <span style={s('font-size:20px;')}>⚠️</span>
                    <div><div style={s('font-weight:700;font-family:Quicksand;font-size:14px;')}>Budget à {spentPct} %</div><div style={s('font-size:12px;opacity:0.9;margin-top:2px;')}>Plus que {eur(remain)} restants</div></div>
                  </div>
                )}
                <button data-testid="btn-add-depense" onClick={() => setShowAdd(true)} style={s('margin:0 18px 18px;width:calc(100% - 36px);border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>+ Ajouter une dépense</button>
                <div style={s('padding:0 18px 8px;')}><SectionLabel>Par catégorie</SectionLabel></div>
                <div style={s('padding:0 18px 14px;display:flex;flex-direction:column;gap:13px;')}>
                  {budgetCats.map((c) => (
                    <div key={c.name}>
                      <div style={s('display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;')}><span style={s('font-weight:700;')}>{c.name}</span><span style={s('font-weight:700;color:#6b6354;')}>{eur(c.amt)}</span></div>
                      <div style={s('height:9px;border-radius:9px;background:#efe6d4;overflow:hidden;')}><div style={s(`height:100%;background:${c.color};width:${c.pct}%;`)} /></div>
                    </div>
                  ))}
                </div>
                <div style={s('padding:4px 18px 8px;display:flex;align-items:center;justify-content:space-between;')}>
                  <SectionLabel>Dépenses</SectionLabel>
                  <button onClick={() => setSortExpenses(s2 => s2 === 'amt' ? 'date' : 'amt')} style={s(`border:1px solid ${sortExpenses === 'amt' ? '#4a5d3a' : '#ece2cf'};background:${sortExpenses === 'amt' ? '#4a5d3a' : '#fffdf8'};color:${sortExpenses === 'amt' ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:5px 12px;font-weight:700;font-size:11px;cursor:pointer;`)}>↓ Par montant</button>
                </div>
                <div style={s('padding:0 18px;display:flex;flex-direction:column;gap:8px;')}>
                  {(sortExpenses === 'amt'
                    ? expenses.map((e, i) => ({...e, _i: i})).sort((a, b) => b.amt - a.amt)
                    : [...expenses.map((e, i) => ({...e, _i: i}))].reverse()
                  ).map((e) => (
                    <div key={e._i} style={s('display:flex;align-items:center;gap:12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px 14px;')}>
                      <span style={s(`width:10px;height:10px;border-radius:50%;background:${catColor(e.cat)};flex:0 0 auto;`)} />
                      <div style={s('flex:1;min-width:0;')}><div style={s('font-weight:700;font-size:14px;')}>{e.label}</div><div style={s('font-size:12px;color:#8a8273;')}>{e.cat}</div></div>
                      <div style={s('font-family:Quicksand;font-weight:700;font-size:15px;')}>{eur(e.amt)}</div>
                      <button onClick={() => startEditExpense(e._i)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;')}>✏️</button>
                      <button onClick={() => deleteExpense(e._i)} style={s('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;color:#b8503f;')}>🗑️</button>
                    </div>
                  ))}
                </div>
                <div style={s('height:16px;')} />
              </div>
            )}

          </div>

          {/* BARRE D'ONGLETS */}
          <div style={s('flex:0 0 auto;display:flex;background:rgba(255,253,248,0.97);border-top:1px solid #ece2cf;padding:8px 6px 24px;')}>
            {TABS.map(([key, emoji, label]) => (
              <button key={key} data-testid={`tab-${key}`} onClick={() => { setTab(key); setSub(null) }} style={s('flex:1;border:none;background:transparent;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:4px 0;')}>
                <span style={s('font-size:20px;')}>{emoji}</span>
                <span style={s(`font-size:11px;color:${tab === key ? '#4a5d3a' : '#b3a892'};font-weight:${tab === key ? '700' : '600'};`)}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============ FEUILLE : AJOUTER UNE DÉPENSE ============ */}
      {showAdd && (
        <div onClick={closeAdd} style={s('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{editingExpenseIdx !== null ? 'Editer dépense' : 'Nouvelle dépense'}</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Montant</div>
            <input data-testid="input-montant" value={newAmt} onChange={(e) => setNewAmt(e.target.value)} inputMode="decimal" placeholder="0,00 €" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:18px;font-family:Quicksand;font-weight:700;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Libellé</div>
            <input data-testid="input-label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Ex : Glaces à Dienne" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Catégorie</div>
            <div style={s('display:flex;flex-wrap:wrap;gap:8px;margin-top:7px;margin-bottom:20px;')}>
              {CATS.map((c) => (
                <button key={c.name} onClick={() => setNewCat(c.name)} style={s(`border:none;border-radius:999px;padding:8px 15px;font-weight:700;font-size:13px;cursor:pointer;background:${newCat === c.name ? c.color : '#f3ece0'};color:${newCat === c.name ? '#fffaf0' : '#6b6354'};`)}>{c.name}</button>
              ))}
            </div>
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={closeAdd} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-submit-depense" onClick={submitExpense} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>{editingExpenseIdx !== null ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : EDITER REPAS ============ */}
      {showMealEdit && (
        <div onClick={closeMealEdit} style={s('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{editingMealId === null ? 'Ajouter un repas' : `Repas du ${newMealDay}`}</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Jour</div>
            <input value={newMealDay} onChange={(e) => setNewMealDay(e.target.value)} placeholder="Ex : Sam 11" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Plat</div>
            <input value={newMealDish} onChange={(e) => setNewMealDish(e.target.value)} placeholder="Ex : Truffade maison" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={closeMealEdit} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveMeal} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : EDITER ACTIVITE PLANNING ============ */}
      {showActivityEdit && editingActivityIdx && (
        <div onClick={closeActivityEdit} style={s('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Editer activite</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Horaire</div>
            <input value={newActivityTime} onChange={(e) => setNewActivityTime(e.target.value)} placeholder="Ex : 10:00" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Titre</div>
            <input value={newActivityTitle} onChange={(e) => setNewActivityTitle(e.target.value)} placeholder="Ex : Visite musee" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={closeActivityEdit} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={submitActivity} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : AJOUTER/EDITER JOUR ============ */}
      {showDayEdit && editingDayIdx !== null && (
        <div onClick={closeDayEdit} style={s('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Editer jour</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Titre</div>
            <input value={newDayTitle} onChange={(e) => setNewDayTitle(e.target.value)} placeholder="Ex : Le grand depart" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Sous-titre</div>
            <input value={newDaySub} onChange={(e) => setNewDaySub(e.target.value)} placeholder="Ex : Lyon -> Mandailles" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={closeDayEdit} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveDay} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
              {days.length > 1 && <button onClick={() => { deleteDay(editingDayIdx); closeDayEdit() }} style={s('flex:0 0 auto;border:none;background:#b8503f;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Supprimer</button>}
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : AJOUTER ACTIVITE ============ */}
      {showActivityAdd && (
        <div onClick={closeActivityAdd} style={s('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Ajouter activite</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Horaire</div>
            <input value={newActivityTime} onChange={(e) => setNewActivityTime(e.target.value)} placeholder="Ex : 10:00" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Titre</div>
            <input value={newActivityTitle} onChange={(e) => setNewActivityTitle(e.target.value)} placeholder="Ex : Visite musee" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Couleur</div>
            <div style={s('display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;margin-bottom:20px;')}>
              {['#5b7042', '#cf7d3c', '#4f8a86', '#9c6b4a', '#8a8b3d', '#b8503f'].map((c) => (
                <button key={c} onClick={() => setNewActivityColor(c)} style={s(`width:32px;height:32px;border-radius:50%;background:${c};border:${newActivityColor === c ? '3px solid #2f2a22' : '2px solid #d8cbb0'};cursor:pointer;`)} />
              ))}
            </div>
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={closeActivityAdd} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={submitActivity} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : AJOUTER ARTICLE LOGI ============ */}
      {showAddLogiItem && (
        <div onClick={closeAddLogiItem} style={s('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Ajouter un article</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Description</div>
            <input value={newLogiItem} onChange={(e) => setNewLogiItem(e.target.value)} placeholder="Ex : Chaussettes" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={closeAddLogiItem} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={addLogiItem} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : AJOUTER ARTICLE COURSES ============ */}
      {showAddCourseItem && (
        <div onClick={closeAddCourseItem} style={s('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Ajouter un article</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Description</div>
            <input value={newCourseItem} onChange={(e) => setNewCourseItem(e.target.value)} placeholder="Ex : Fromage" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={closeAddCourseItem} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={addCourseItem} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : EDITER METEO ============ */}
      {showMeteoEdit && (
        <div onClick={closeMeteoEdit} style={s('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{editingMeteoIdx === null ? 'Ajouter un jour' : 'Meteo'}</div>
            <div style={s('display:flex;gap:10px;')}>
              <div style={s('flex:1;')}>
                <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Jour</div>
                <input value={newMeteoDay} onChange={(e) => setNewMeteoDay(e.target.value)} placeholder="Sam" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
              <div style={s('flex:1;')}>
                <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Numero</div>
                <input value={newMeteoNum} onChange={(e) => setNewMeteoNum(e.target.value)} placeholder="11" inputMode="numeric" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
            </div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Icone</div>
            <input value={newMeteoIcon} onChange={(e) => setNewMeteoIcon(e.target.value)} placeholder="☀️" maxLength="2" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:24px;text-align:center;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Temp max</div>
            <input value={newMeteoHi} onChange={(e) => setNewMeteoHi(e.target.value)} placeholder="24" inputMode="numeric" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Temp min</div>
            <input value={newMeteoLo} onChange={(e) => setNewMeteoLo(e.target.value)} placeholder="12" inputMode="numeric" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Pluie</div>
            <input value={newMeteoRain} onChange={(e) => setNewMeteoRain(e.target.value)} placeholder="10 %" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={closeMeteoEdit} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveMeteo} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : EDITER TRAJET ============ */}
      {showTrajetEdit && editingTrajetIdx !== null && (
        <div onClick={closeTrajetEdit} style={s('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Editer etape</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Horaire</div>
            <input value={newTrajetTime} onChange={(e) => setNewTrajetTime(e.target.value)} placeholder="Ex : 08:30" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Lieu</div>
            <input value={newTrajetPlace} onChange={(e) => setNewTrajetPlace(e.target.value)} placeholder="Ex : Lyon" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Note</div>
            <input value={newTrajetNote} onChange={(e) => setNewTrajetNote(e.target.value)} placeholder="Ex : Pause cafe" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Couleur</div>
            <div style={s('display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;margin-bottom:20px;')}>
              {['#5b7042', '#cf7d3c', '#4f8a86', '#9c6b4a', '#8a8b3d', '#b8503f'].map((c) => (
                <button key={c} onClick={() => setNewTrajetColor(c)} style={s(`width:32px;height:32px;border-radius:50%;background:${c};border:${newTrajetColor === c ? '3px solid #2f2a22' : '2px solid #d8cbb0'};cursor:pointer;`)} />
              ))}
            </div>
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={closeTrajetEdit} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveTrajetStep} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : EDITER VISITE ============ */}
      {showVisitEdit && editingVisitId !== null && (
        <div onClick={closeVisitEdit} style={s('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Editer visite</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Nom</div>
            <input value={newVisitName} onChange={(e) => setNewVisitName(e.target.value)} placeholder="Ex : Puy Mary" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Categorie</div>
            <select value={newVisitCat} onChange={(e) => setNewVisitCat(e.target.value)} style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')}>
              <option>Nature</option>
              <option>Famille</option>
              <option>Patrimoine</option>
              <option>Baignade</option>
              <option>Gourmand</option>
              <option>Marche</option>
            </select>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Distance</div>
            <input value={newVisitDist} onChange={(e) => setNewVisitDist(e.target.value)} placeholder="Ex : 25 min" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Duree</div>
            <input value={newVisitDur} onChange={(e) => setNewVisitDur(e.target.value)} placeholder="Ex : 2 h" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Age recommande</div>
            <input value={newVisitAge} onChange={(e) => setNewVisitAge(e.target.value)} placeholder="Ex : Des 3 ans" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={closeVisitEdit} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveVisit} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Budget total edit */}
      {showBudgetTotalEdit && (
        <div onClick={() => setShowBudgetTotalEdit(false)} style={s('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Budget total</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Montant (€)</div>
            <input type="number" value={newBudgetTotal} onChange={(e) => setNewBudgetTotal(e.target.value)} placeholder={String(budgetTotal)} style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} onKeyDown={(e) => e.key === 'Enter' && saveBudgetTotal()} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={() => setShowBudgetTotalEdit(false)} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveBudgetTotal} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Hébergement edit */}
      {showHebEdit && (
        <div onClick={() => setShowHebEdit(false)} style={s('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Modifier l'hébergement</div>
            {[
              ['Nom', newHebNom, setNewHebNom, 'La Grange du Puy Mary'],
              ['Adresse', newHebAdresse, setNewHebAdresse, 'Mandailles-Saint-Julien (15590)'],
              ['Arrivée', newHebArrivee, setNewHebArrivee, 'Sam 11 · dès 16 h'],
              ['Départ', newHebDepart, setNewHebDepart, 'Sam 18 · avant 10 h'],
              ['Capacité', newHebCapacite, setNewHebCapacite, '4–5 personnes · 2 chambres'],
              ['Wi-Fi réseau', newHebWifiNom, setNewHebWifiNom, 'LaGrange-Gite'],
              ['Wi-Fi code', newHebWifiPass, setNewHebWifiPass, ''],
              ['Contact', newHebContact, setNewHebContact, 'Mme Vidal · 06 12 34 56 78'],
            ].map(([label, val, setter, ph]) => (
              <div key={label}>
                <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>{label}</div>
                <input value={val} onChange={(e) => setter(e.target.value)} placeholder={ph} style={s('width:100%;margin-top:6px;margin-bottom:12px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
            ))}
            <div style={s('display:flex;gap:10px;margin-top:8px;')}>
              <button onClick={() => setShowHebEdit(false)} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveHebergement} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Trajet checklist add item */}
      {showAddTrajetCheck && (
        <div onClick={() => setShowAddTrajetCheck(false)} style={s('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Ajouter un item</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Description</div>
            <input value={newTrajetCheckItem} onChange={(e) => setNewTrajetCheckItem(e.target.value)} placeholder="Ex : Chargeur téléphone" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} onKeyDown={(e) => e.key === 'Enter' && addTrajetCheckItem()} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={() => setShowAddTrajetCheck(false)} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={addTrajetCheckItem} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Export des données */}
      {showExport && (
        <div onClick={() => setShowExport(false)} style={s('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Exporter les données</div>
            <div style={s('font-size:13px;color:#8a8273;margin-bottom:14px;')}>Toutes les données de l'app (planning, dépenses, listes, favoris…) au format JSON. À garder en lieu sûr ou à envoyer sur un autre téléphone.</div>
            <textarea data-testid="export-json" readOnly value={buildExport()} onFocus={(e) => e.target.select()} style={s('width:100%;height:180px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:11px;font-family:ui-monospace,monospace;resize:none;')} />
            <button data-testid="btn-share-export" onClick={shareExport} style={s('width:100%;margin-top:14px;border:none;background:#cf7d3c;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>📤 Envoyer vers Telegram / WhatsApp…</button>
            <div style={s('display:flex;gap:10px;margin-top:10px;')}>
              <button onClick={copyExport} style={s(`flex:1;border:none;background:${exportCopied ? '#5b7042' : '#4a5d3a'};color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;`)}>{exportCopied ? '✓ Copié !' : '📋 Copier'}</button>
              <button onClick={downloadExport} style={s('flex:1;border:1px solid #4a5d3a;background:#fffdf8;color:#4a5d3a;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>💾 Télécharger</button>
            </div>
            <button onClick={() => setShowExport(false)} style={s('width:100%;margin-top:10px;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Fermer</button>
          </div>
        </div>
      )}

      {/* MODAL: Import des données */}
      {showImport && (
        <div onClick={closeImport} style={s('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Importer des données</div>
            <div style={s('font-size:13px;color:#8a8273;margin-bottom:14px;')}>Coller un export Cantou ci-dessous, ou choisir le fichier JSON.</div>
            <textarea data-testid="import-textarea" value={importText} onChange={(e) => { setImportText(e.target.value); parseImport(e.target.value) }} placeholder='{"app":"cantou", …}' style={s('width:100%;height:140px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:11px;font-family:ui-monospace,monospace;resize:none;')} />
            <label style={s('display:block;margin-top:10px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px;cursor:pointer;text-align:center;')}>
              📂 Choisir un fichier…
              <input type="file" accept=".json,application/json" onChange={handleImportFile} style={s('display:none;')} />
            </label>
            {importError && <div style={s('margin-top:10px;background:#f7e2dc;border-radius:12px;padding:11px 13px;font-size:13px;color:#b8503f;font-weight:600;')}>⚠️ {importError}</div>}
            {importPreview && (
              <div data-testid="import-preview" style={s('margin-top:10px;background:#e7ecdf;border-radius:12px;padding:11px 13px;font-size:13px;color:#4a5d3a;')}>
                ✓ Export Cantou valide — {Array.isArray(importPreview.expenses) ? importPreview.expenses.length : 0} dépenses, {Array.isArray(importPreview.meals) ? importPreview.meals.length : 0} repas, {Array.isArray(importPreview.visits) ? importPreview.visits.length : 0} visites, {Array.isArray(importPreview.days) ? importPreview.days.length : 0} jours de planning.
              </div>
            )}
            <div style={s('display:flex;gap:10px;margin-top:14px;')}>
              <button onClick={closeImport} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-apply-import" onClick={applyImport} disabled={!importPreview} style={s(`flex:1;border:none;background:${importPreview ? '#b8503f' : '#d8cbb0'};color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:${importPreview ? 'pointer' : 'not-allowed'};`)}>Remplacer mes données</button>
            </div>
            <div style={s('margin-top:10px;font-size:12px;color:#8a8273;text-align:center;')}>⚠️ Remplace toutes les données actuelles de l'app.</div>
          </div>
        </div>
      )}

      {/* MODAL: Paramètres du voyage */}
      {showTripEdit && (
        <div onClick={() => setShowTripEdit(false)} style={s('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Paramètres du voyage</div>
            <div style={s('font-size:13px;color:#8a8273;margin-bottom:14px;')}>Ces réglages pilotent le compte à rebours, les cartes et les notifications.</div>
            <div style={s('display:flex;gap:10px;')}>
              <div style={s('flex:1;')}>
                <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Date de départ</div>
                <input data-testid="input-trip-start" type="date" value={newTripStart} onChange={(e) => setNewTripStart(e.target.value)} style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
              <div style={s('flex:1;')}>
                <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Date de retour</div>
                <input data-testid="input-trip-end" type="date" value={newTripEnd} onChange={(e) => setNewTripEnd(e.target.value)} style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
            </div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Ville de départ</div>
            <input data-testid="input-trip-origin" value={newTripOrigin} onChange={(e) => setNewTripOrigin(e.target.value)} placeholder="Ex : Beauvais" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Étape (nuit) — optionnel</div>
            <input value={newTripEtape} onChange={(e) => setNewTripEtape(e.target.value)} placeholder="Ex : Laschamps" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Destination</div>
            <input data-testid="input-trip-dest" value={newTripDest} onChange={(e) => setNewTripDest(e.target.value)} placeholder="Ex : Mandailles (Cantal)" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={() => setShowTripEdit(false)} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-save-trip" onClick={saveTrip} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nouvelle liste de logistique */}
      {showAddLogiList && (
        <div onClick={() => setShowAddLogiList(false)} style={s('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Nouvelle liste</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Emoji</div>
            <input value={newLogiListEmoji} onChange={(e) => setNewLogiListEmoji(e.target.value)} placeholder="📦" maxLength="2" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:24px;text-align:center;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Nom</div>
            <input data-testid="input-logi-list-name" value={newLogiListName} onChange={(e) => setNewLogiListName(e.target.value)} placeholder="Ex : Sac de plage" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} onKeyDown={(e) => e.key === 'Enter' && addLogiList()} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={() => setShowAddLogiList(false)} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-save-logi-list" onClick={addLogiList} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nouvelle catégorie de courses */}
      {showAddCourseCat && (
        <div onClick={() => setShowAddCourseCat(false)} style={s('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Nouvelle catégorie</div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Nom</div>
            <input data-testid="input-course-cat-name" value={newCourseCatName} onChange={(e) => setNewCourseCatName(e.target.value)} placeholder="Ex : Apéro" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} onKeyDown={(e) => e.key === 'Enter' && addCourseCategory()} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={() => setShowAddCourseCat(false)} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-save-course-cat" onClick={addCourseCategory} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Ajouter un jour au planning */}
      {showDayAdd && (
        <div onClick={() => setShowDayAdd(false)} style={s('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={s('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Ajouter un jour</div>
            <div style={s('display:flex;gap:10px;')}>
              <div style={s('flex:1;')}>
                <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Jour (abrégé)</div>
                <input data-testid="input-day-dow" value={newDayDow} onChange={(e) => setNewDayDow(e.target.value)} placeholder="Ex : Dim" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
              <div style={s('flex:1;')}>
                <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Numéro</div>
                <input data-testid="input-day-num" value={newDayNum} onChange={(e) => setNewDayNum(e.target.value)} placeholder="Ex : 16" inputMode="numeric" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
            </div>
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Titre</div>
            <input data-testid="input-day-title" value={newDayTitle2} onChange={(e) => setNewDayTitle2(e.target.value)} placeholder="Ex : Journée détente" style={s('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('font-size:12px;font-weight:700;color:#8a8273;')}>Sous-titre</div>
            <input value={newDaySub2} onChange={(e) => setNewDaySub2(e.target.value)} placeholder="Ex : Au gré de l'envie" style={s('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={s('display:flex;gap:10px;')}>
              <button onClick={() => setShowDayAdd(false)} style={s('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-save-day-add" onClick={addDay} style={s('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* BANDEAU UNDO SUPPRESSION */}
      {undoMsg && (
        <div data-testid="undo-snackbar" style={s('position:fixed;left:18px;right:18px;bottom:96px;z-index:300;background:#2f2a22;color:#fffaf0;border-radius:14px;padding:12px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 24px rgba(0,0,0,0.3);animation:fadeIn 0.2s ease;')}>
          <span style={s('flex:1;font-size:14px;font-weight:600;')}>{undoMsg}</span>
          <button data-testid="btn-undo" onClick={applyUndo} style={s('border:none;background:transparent;color:#e8c07a;font-weight:700;font-family:Quicksand;font-size:14px;cursor:pointer;padding:4px 8px;')}>Annuler</button>
        </div>
      )}

    </div>
  )
}
