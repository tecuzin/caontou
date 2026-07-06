import { useState, useEffect, useMemo, useRef } from 'react'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { MEALS_INITIAL, SHOPPING_ITEMS_INITIAL, PLANNING_ACTIVITIES_INITIAL, LOGI_INITIAL, COURSES_INITIAL, VISITS_INITIAL, METEO_INITIAL, TRAJETS_INITIAL, TRIP_INITIAL, DAYS_INITIAL } from './data.js'
import { s, eur, buildList, parseDist, tripDate, fmtDayShort, fmtMonthYear } from './utils.js'
import { Panorama } from './Scenery.jsx'
import { Meteo } from './screens/Meteo.jsx'
import { Hebergement } from './screens/Hebergement.jsx'
import { Logistique } from './screens/Logistique.jsx'
import { Trajet } from './screens/Trajet.jsx'
import { Budget } from './screens/Budget.jsx'
import { Repas } from './screens/Repas.jsx'
import { Planning } from './screens/Planning.jsx'
import { scheduleAllNotifications } from './notifications.js'
import { applyDarkTheme, STARRY_BACKGROUND_IMAGE } from './theme.js'
import { buildExport, exportFilename, parseImport, downloadExport, shareExport, formatLastBackup } from './backup.js'
import { runSelfTests } from './selftest.js'
import { useVisits } from './hooks/useVisits.js'
import { useSwipe } from './hooks/useSwipe.js'
import { useSuggestions } from './hooks/useSuggestions.js'
import { useMeteo } from './hooks/useMeteo.js'
import { useTrajets } from './hooks/useTrajets.js'
import { shareSuggestions } from './suggestions.js'
import { useExpenses } from './hooks/useExpenses.js'
import { useMeals } from './hooks/useMeals.js'
import { useLogi } from './hooks/useLogi.js'
import { useCourses } from './hooks/useCourses.js'
import { usePlanning } from './hooks/usePlanning.js'
import { useTripConfig } from './hooks/useTripConfig.js'

const haptic = (style = ImpactStyle.Light) => { Haptics.impact({ style }).catch(() => {}) }

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


const HEB_INITIAL = {
  nom: 'La Grange du Puy Mary',
  adresse: 'Mandailles-Saint-Julien (15590)',
  arrivee: 'Mer 5 · dès 16 h',
  depart: 'Sam 15 · avant 10 h',
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
      suggestions: p.suggestions ?? [],
      lastBackupAt: p.lastBackupAt ?? null,
    }
  } catch {
    return structuredClone(DEFAULTS)
  }
}

/* ------------------------------------------------------------------ *
 * Utilitaires
 * ------------------------------------------------------------------ */
const catColor = (n) => (CATS.find((x) => x.name === n) || {}).color || '#6b6354'

/* ================================================================== */
export default function App() {
  // Mode sombre — préférence locale à l'appareil (pas synchronisée via
  // l'export/import, chacun peut avoir sa propre préférence). Défaut :
  // préférence système si jamais réglé explicitement.
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('cantou.darkMode')
      if (saved !== null) return saved === 'true'
    } catch { }
    try { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches } catch { return false }
  })
  useEffect(() => {
    try { localStorage.setItem('cantou.darkMode', String(darkMode)) } catch { }
  }, [darkMode])
  const sx = (css) => s(darkMode ? applyDarkTheme(css) : css)

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
  const [newSuggestionText, setNewSuggestionText] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [exportCopied, setExportCopied] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [importPreview, setImportPreview] = useState(null)
  const [showSelftest, setShowSelftest] = useState(false)
  const [selftestResults, setSelftestResults] = useState([])

  // état persisté (sur le téléphone)
  const initial = useMemo(loadStore, [])
  const { visits, setVisits, saved, setSaved, savedCount, toggleSaved: hookToggleSaved, addVisit: hookAddVisit, updateVisit, removeVisit } = useVisits(initial.visits, initial.saved)
  const { expenses, setExpenses, addExpense, updateExpense, removeExpense } = useExpenses(initial.expenses)
  const { meals, setMeals, addMeal: hookAddMeal, updateMeal, removeMeal } = useMeals(initial.meals)
  const [checks, setChecks] = useState(initial.checks)
  const [shoppingItems, setShoppingItems] = useState(initial.shoppingItems || structuredClone(SHOPPING_ITEMS_INITIAL))
  const { days, setDays, addDay: hookAddDay, updateDay, removeDay, addActivity, updateActivity, removeActivity } = usePlanning(initial.days)
  const { meteo, setMeteo, addMeteoDay, updateMeteoDay, removeMeteoDay } = useMeteo(initial.meteo)
  const { trajets, setTrajets, addTrajetStep, updateTrajetStep, removeTrajetStep } = useTrajets(initial.trajets)
  const { trip, setTrip, updateTrip } = useTripConfig(initial.trip)
  const { logi, setLogi, addLogiList: hookAddLogiList, removeLogiList, addLogiItem: hookAddLogiItem, removeLogiItem } = useLogi(initial.logi)
  const { courses, setCourses, addCourseCategory: hookAddCourseCategory, removeCourseCategory, addCourseItem: hookAddCourseItem, removeCourseItem } = useCourses(initial.courses)
  const [budgetTotal, setBudgetTotal] = useState(initial.budgetTotal || BUDGET_INITIAL)
  const [hebergement, setHebergement] = useState(initial.hebergement || structuredClone(HEB_INITIAL))
  const [trajetCheckItems, setTrajetCheckItems] = useState(initial.trajetCheckItems || [...TRAJET_CHECK_ITEMS_INITIAL])
  const { suggestions, setSuggestions, addSuggestion, removeSuggestion } = useSuggestions(initial.suggestions)
  const [lastBackupAt, setLastBackupAt] = useState(initial.lastBackupAt || null)

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
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ saved, checks, expenses, meals, shoppingItems, days, visits, meteo, trajets, trip, logi, courses, budgetTotal, hebergement, trajetCheckItems, suggestions, lastBackupAt })) } catch { }
  }, [saved, checks, expenses, meals, shoppingItems, days, visits, meteo, trajets, trip, logi, courses, budgetTotal, hebergement, trajetCheckItems, suggestions, lastBackupAt])

  // (Re)planifie tous les rappels au démarrage et à chaque modification
  // du planning ou des menus — natif Android (survit à la fermeture) ou
  // fallback web en dev.
  useEffect(() => {
    scheduleAllNotifications(days, meals, trip, lastBackupAt).catch(() => { })
  }, [days, meals, trip, lastBackupAt])

  const toggleCheck = (key, label) => {
    haptic(ImpactStyle.Light)
    setChecks((c) => ({ ...c, [key]: { ...(c[key] || {}), [label]: !(c[key] && c[key][label]) } }))
  }
  const toggleSaved = (id) => { haptic(ImpactStyle.Medium); hookToggleSaved(id) }

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

  const cur = days[day]
  const tr = buildList(checks, 'tr_dep', trajetCheckItems)
  const subTitle = { trajet: 'Le trajet', logistique: 'Valises & préparatifs', hebergement: 'Hébergement', meteo: 'Météo' }[sub] || ''

  const openModule = (action) =>
    action.indexOf('sub:') === 0 ? setSub(action.slice(4)) : (setTab(action.slice(4)), setSub(null))

  const submitExpense = () => {
    const a = parseFloat(String(newAmt).replace(',', '.'))
    if (!a || a <= 0) return
    haptic(ImpactStyle.Medium)
    const data = { label: newLabel || newCat, cat: newCat, amt: a }
    if (editingExpenseIdx !== null) {
      updateExpense(editingExpenseIdx, data)
      setEditingExpenseIdx(null)
    } else {
      addExpense(data)
    }
    setShowAdd(false); setNewAmt(''); setNewLabel('')
  }
  const deleteExpense = (idx) => {
    haptic(ImpactStyle.Medium)
    offerUndo('Dépense supprimée')
    removeExpense(idx)
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
      hookAddMeal({ day: newMealDay.trim(), dish: newMealDish.trim() })
    } else {
      updateMeal(editingMealId, { day: newMealDay, dish: newMealDish })
    }
    closeMealEdit()
  }
  const closeMealEdit = () => { setShowMealEdit(false); setEditingMealId(null); setNewMealDish(''); setNewMealDay('') }
  const deleteMeal = (id) => {
    if (meals.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Repas supprimé')
    removeMeal(id)
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
    updateDay(editingDayIdx, { title: newDayTitle, sub: newDaySub })
    closeDayEdit()
  }
  const closeDayEdit = () => { setShowDayEdit(false); setEditingDayIdx(null); setNewDayTitle(''); setNewDaySub('') }
  const deleteDay = (dayIdx) => {
    if (days.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Jour supprimé')
    if (!removeDay(dayIdx)) return
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
      updateActivity(dayIdx, itemIdx, { time: newActivityTime, title: newActivityTitle, color: newActivityColor })
      setShowActivityEdit(false)
      setEditingActivityIdx(null)
    } else {
      addActivity(editingActivityDayIdx, { time: newActivityTime, title: newActivityTitle, note: '', color: newActivityColor })
      closeActivityAdd()
    }
  }
  const closeActivityAdd = () => { setShowActivityAdd(false); setEditingActivityDayIdx(null); setNewActivityTime(''); setNewActivityTitle(''); setNewActivityColor('#5b7042') }
  const deleteActivity = (dayIdx, itemIdx) => {
    haptic(ImpactStyle.Medium)
    offerUndo('Activité supprimée')
    removeActivity(dayIdx, itemIdx)
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
    const data = { name: newVisitName, cat: newVisitCat, dist: newVisitDist, dur: newVisitDur, age: newVisitAge }
    if (!editingVisitId) hookAddVisit(data)
    else updateVisit(editingVisitId, data)
    closeVisitEdit()
  }
  const closeVisitEdit = () => { setShowVisitEdit(false); setEditingVisitId(null); setNewVisitName(''); setNewVisitDist(''); setNewVisitDur(''); setNewVisitAge(''); setNewVisitCat('Nature') }
  const deleteVisit = (visitId) => {
    if (visits.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Visite supprimée')
    removeVisit(visitId)
  }

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
    if (editingTrajetIdx === null) addTrajetStep(trajetDir, step)
    else updateTrajetStep(trajetDir, editingTrajetIdx, step)
    closeTrajetEdit()
  }
  const closeTrajetEdit = () => { setShowTrajetEdit(false); setEditingTrajetIdx(null); setNewTrajetTime(''); setNewTrajetPlace(''); setNewTrajetNote(''); setNewTrajetColor('#5b7042') }
  const deleteTrajetStep = (idx) => {
    if (trajets[trajetDir].length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Étape supprimée')
    removeTrajetStep(trajetDir, idx)
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
    updateTrip({ start: newTripStart, end: newTripEnd, origin: newTripOrigin.trim(), etape: newTripEtape.trim(), destination: newTripDest.trim() })
    setShowTripEdit(false)
  }

  // Listes logistique personnalisables (en plus des items)
  const addLogiList = () => {
    if (!newLogiListName.trim()) return
    haptic(ImpactStyle.Medium)
    hookAddLogiList(newLogiListName.trim(), newLogiListEmoji.trim())
    setNewLogiListName(''); setNewLogiListEmoji(''); setShowAddLogiList(false)
  }
  const deleteLogiList = (key) => {
    if (logi.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Liste supprimée')
    if (!removeLogiList(key)) return
    setChecks((c) => { const nc = { ...c }; delete nc[key]; return nc })
  }

  // Catégories de courses personnalisables
  const addCourseCategory = () => {
    if (!newCourseCatName.trim()) return
    haptic(ImpactStyle.Medium)
    hookAddCourseCategory(newCourseCatName.trim())
    setNewCourseCatName(''); setShowAddCourseCat(false)
  }
  const deleteCourseCategory = (key) => {
    if (courses.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Catégorie supprimée')
    if (!removeCourseCategory(key)) return
    setChecks((c) => { const nc = { ...c }; delete nc[key]; return nc })
  }

  // Planning : ajout d'un jour
  const addDay = () => {
    if (!newDayDow.trim() || !newDayNum.trim() || !newDayTitle2.trim()) return
    haptic(ImpactStyle.Medium)
    const num = parseInt(newDayNum, 10)
    if (!num) return
    hookAddDay({ dow: newDayDow.trim(), num, title: newDayTitle2.trim(), sub: newDaySub2.trim() })
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
    const data = { d: newMeteoDay.trim(), n, hi, lo, rain: newMeteoRain, icon: newMeteoIcon }
    if (editingMeteoIdx === null) addMeteoDay(data)
    else updateMeteoDay(editingMeteoIdx, data)
    closeMeteoEdit()
  }
  const closeMeteoEdit = () => { setShowMeteoEdit(false); setEditingMeteoIdx(null); setNewMeteoDay(''); setNewMeteoNum(''); setNewMeteoHi(''); setNewMeteoLo(''); setNewMeteoRain(''); setNewMeteoIcon('☀️') }
  const deleteMeteo = (idx) => {
    if (meteo.length <= 1) return
    haptic(ImpactStyle.Medium)
    offerUndo('Jour météo supprimé')
    removeMeteoDay(idx)
  }

  const addLogiItem = () => {
    if (!newLogiItem.trim() || !editingLogiKey) return
    haptic(ImpactStyle.Medium)
    hookAddLogiItem(editingLogiKey, newLogiItem)
    closeAddLogiItem()
  }
  const closeAddLogiItem = () => { setShowAddLogiItem(false); setEditingLogiKey(null); setNewLogiItem('') }
  const deleteLogiItem = (key, item) => {
    haptic(ImpactStyle.Medium)
    offerUndo('Article supprimé')
    removeLogiItem(key, item)
    setChecks((c) => { const nr = { ...(c[key] || {}) }; delete nr[item]; return { ...c, [key]: nr } })
  }

  const addCourseItem = () => {
    if (!newCourseItem.trim() || !editingCourseKey) return
    haptic(ImpactStyle.Medium)
    hookAddCourseItem(editingCourseKey, newCourseItem)
    closeAddCourseItem()
  }
  const closeAddCourseItem = () => { setShowAddCourseItem(false); setEditingCourseKey(null); setNewCourseItem('') }
  const deleteCourseItem = (key, item) => {
    haptic(ImpactStyle.Medium)
    offerUndo('Article supprimé')
    removeCourseItem(key, item)
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

  // Export / import complet des données (JSON) — logique pure dans backup.js
  const currentStoreData = () => ({ saved, checks, expenses, meals, shoppingItems, days, visits, meteo, trajets, trip, logi, courses, budgetTotal, hebergement, trajetCheckItems, suggestions, lastBackupAt })
  const markBackedUp = () => setLastBackupAt(new Date().toISOString())
  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(buildExport(currentStoreData(), STORE_KEY))
      setExportCopied(true)
      markBackedUp()
      setTimeout(() => setExportCopied(false), 2500)
    } catch { }
  }
  const doDownloadExport = () => { downloadExport(buildExport(currentStoreData(), STORE_KEY), exportFilename()); markBackedUp() }
  const doShareExport = () => { shareExport(buildExport(currentStoreData(), STORE_KEY), exportFilename()); markBackedUp() }
  const runSelfTestAndShow = () => {
    haptic(ImpactStyle.Light)
    setSelftestResults(runSelfTests())
    setShowSelftest(true)
  }
  const doParseImport = (text) => {
    const { data, error } = parseImport(text)
    setImportError(error)
    setImportPreview(data)
  }
  const handleImportFile = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => { setImportText(String(reader.result)); doParseImport(String(reader.result)) }
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

  // Suggestions : notes libres pour de futures fonctionnalités, envoyées en
  // texte brut vers Telegram/WhatsApp (pas besoin de parser du JSON).
  const submitSuggestion = () => {
    if (!newSuggestionText.trim()) return
    haptic(ImpactStyle.Medium)
    addSuggestion(newSuggestionText)
    setNewSuggestionText('')
  }
  const deleteSuggestion = (id) => {
    haptic(ImpactStyle.Medium)
    removeSuggestion(id)
  }
  const sendSuggestions = () => shareSuggestions(suggestions)

  const TABS = [['accueil', '🏠', 'Accueil'], ['planning', '📅', 'Planning'], ['visites', '🥾', 'À faire'], ['repas', '🍽️', 'Repas'], ['budget', '💶', 'Budget']]

  // Navigation par glissement : gauche/droite sur la barre d'onglets pour
  // changer d'écran, glissement gauche→droite sur le contenu d'un
  // sous-écran pour revenir en arrière (équivalent du bouton ‹).
  const currentTabIdx = TABS.findIndex(([key]) => key === tab)
  const goToAdjacentTab = (dir) => {
    const nextIdx = currentTabIdx + dir
    if (nextIdx < 0 || nextIdx >= TABS.length) return
    haptic(ImpactStyle.Light)
    setTab(TABS[nextIdx][0])
    setSub(null)
  }
  const tabBarSwipe = useSwipe(() => goToAdjacentTab(1), () => goToAdjacentTab(-1))
  const subScreenSwipe = useSwipe(null, () => { if (sub) { haptic(ImpactStyle.Light); setSub(null) } })

  /* ---------------------------------------------------------------- */
  return (
    <main data-testid="app-root" style={{
      ...sx("height:100%;display:flex;flex-direction:column;overflow:hidden;background:#f4ecdc;color:#2f2a22;font-family:'Nunito Sans',system-ui,sans-serif;position:relative;"),
      ...(darkMode ? { backgroundImage: STARRY_BACKGROUND_IMAGE, backgroundRepeat: 'no-repeat' } : {}),
    }}>

      {/* ============ SOUS-ÉCRANS ============ */}
      {sub && (
        <div data-testid="sub-screen-wrapper" onTouchStart={subScreenSwipe.onTouchStart} onTouchEnd={subScreenSwipe.onTouchEnd} style={sx('height:100%;display:flex;flex-direction:column;')}>
          <div style={sx('display:flex;align-items:center;gap:8px;padding:54px 14px 12px;background:#fffdf8;border-bottom:1px solid #ece2cf;flex:0 0 auto;')}>
            <button onClick={() => setSub(null)} style={sx('width:36px;height:36px;border:none;background:#f1e9da;border-radius:50%;font-size:22px;line-height:1;cursor:pointer;color:#4a5d3a;display:flex;align-items:center;justify-content:center;padding-bottom:3px;')}>‹</button>
            <span style={sx('font-family:Quicksand;font-weight:700;font-size:18px;')}>{subTitle}</span>
          </div>
          <div style={sx('flex:1;overflow-y:auto;')}>

            {/* TRAJET */}
            {sub === 'trajet' && (
              <Trajet
                sx={sx} trajetDir={trajetDir} setTrajetDir={setTrajetDir} trip={trip} fmtDayShort={fmtDayShort} trajets={trajets}
                editTrajetStep={editTrajetStep} deleteTrajetStep={deleteTrajetStep}
                setEditingTrajetIdx={setEditingTrajetIdx} setNewTrajetTime={setNewTrajetTime} setNewTrajetPlace={setNewTrajetPlace}
                setNewTrajetNote={setNewTrajetNote} setNewTrajetColor={setNewTrajetColor} setShowTrajetEdit={setShowTrajetEdit}
                tr={tr} setShowAddTrajetCheck={setShowAddTrajetCheck} toggleCheck={toggleCheck} deleteTrajetCheckItem={deleteTrajetCheckItem}
              />
            )}

            {/* LOGISTIQUE */}
            {sub === 'logistique' && (
              <Logistique
                sx={sx} logi={logi} logiSorted={logiSorted} setLogiSorted={setLogiSorted}
                checks={checks} buildList={buildList} toggleCheck={toggleCheck}
                deleteLogiList={deleteLogiList} deleteLogiItem={deleteLogiItem}
                setEditingLogiKey={setEditingLogiKey} setShowAddLogiItem={setShowAddLogiItem}
                setShowAddLogiList={setShowAddLogiList}
              />
            )}

            {/* HEBERGEMENT */}
            {sub === 'hebergement' && (
              <Hebergement sx={sx} hebergement={hebergement} openHebEdit={openHebEdit} />
            )}

            {/* METEO */}
            {sub === 'meteo' && (
              <Meteo sx={sx} meteo={meteo} trip={trip} fmtDayShort={fmtDayShort} editMeteo={editMeteo} deleteMeteo={deleteMeteo} openAddMeteo={openAddMeteo} />
            )}

          </div>
        </div>
      )}

      {/* ============ ÉCRANS PRINCIPAUX (onglets) ============ */}
      {!sub && (
        <div style={sx('height:100%;display:flex;flex-direction:column;')}>
          <div style={sx('flex:1;overflow-y:auto;')}>

            {/* ACCUEIL */}
            {tab === 'accueil' && (
              <div data-testid="screen-accueil">
                <div style={sx('margin:54px 18px 14px 18px;border-radius:26px;padding:20px;color:#fffaf0;box-shadow:0 10px 26px rgba(74,93,58,0.24);position:relative;overflow:hidden;min-height:190px;')}>
                  <div data-testid="hero-panorama-bg" style={sx('position:absolute;inset:0;z-index:0;')}>
                    <Panorama height="100%" />
                    <div style={sx('position:absolute;inset:0;background:linear-gradient(180deg,rgba(30,40,25,0.15) 0%,rgba(25,35,20,0.55) 60%,rgba(20,28,16,0.75) 100%);')} />
                  </div>
                  <button data-testid="btn-dark-mode-toggle" onClick={() => setDarkMode((d) => !d)} style={sx('position:absolute;top:14px;right:56px;z-index:2;border:none;background:rgba(255,255,255,0.2);color:#fffaf0;border-radius:10px;padding:6px 9px;font-size:15px;cursor:pointer;')}>{darkMode ? '☀️' : '🌙'}</button>
                  <button data-testid="btn-trip-settings" onClick={openTripEdit} style={sx('position:absolute;top:14px;right:14px;z-index:2;border:none;background:rgba(255,255,255,0.2);color:#fffaf0;border-radius:10px;padding:6px 9px;font-size:15px;cursor:pointer;')}>⚙️</button>
                  <div style={sx('position:relative;z-index:1;')}>
                    <div style={sx('font-size:12px;letter-spacing:1.5px;font-weight:700;color:#e8e2cf;')}>PROCHAINE AVENTURE</div>
                    <div style={sx('font-family:Quicksand;font-weight:700;font-size:30px;line-height:1.08;margin-top:8px;text-shadow:0 2px 8px rgba(0,0,0,0.25);')}>Puy Mary,<br />Cantal</div>
                    <div style={sx('margin-top:9px;font-size:14px;color:#e8e2cf;')}>{fmtDayShort(trip.start)} → {fmtDayShort(trip.end)} {fmtMonthYear(trip.end)}</div>
                    <div style={sx('display:flex;gap:8px;margin-top:16px;')}>
                      <div style={sx('background:rgba(255,255,255,0.18);border-radius:12px;padding:8px 13px;font-weight:700;font-family:Quicksand;')}>J-{countdown}</div>
                      <div style={sx('background:rgba(255,255,255,0.18);border-radius:12px;padding:8px 13px;font-weight:700;')}>☀️ 24° sur place</div>
                    </div>
                  </div>
                </div>

                {today && (
                  <div data-testid="today-card" style={sx('margin:0 18px 14px;background:#fffdf8;border:2px solid #cf7d3c;border-radius:20px;padding:16px;box-shadow:0 4px 14px rgba(207,125,60,0.18);')}>
                    <div style={sx('display:flex;align-items:center;justify-content:space-between;')}>
                      <div style={sx('font-size:12px;letter-spacing:1px;font-weight:700;color:#cf7d3c;')}>🗓️ AUJOURD'HUI · {today.d.dow} {today.d.num}</div>
                      {today.w && <div style={sx('font-family:Quicksand;font-weight:700;font-size:14px;')}>{today.w.icon} {today.w.hi}° <span style={sx('color:#b3a892;')}>{today.w.lo}°</span></div>}
                    </div>
                    <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-top:6px;')}>{today.d.title}</div>
                    <div style={sx('font-size:13px;color:#6b6354;margin-top:1px;')}>{today.d.sub}</div>
                    {today.d.items.length > 0 && (
                      <div style={sx('margin-top:12px;display:flex;flex-direction:column;gap:8px;')}>
                        {today.d.items.map((it, i) => (
                          <div key={i} style={sx('display:flex;align-items:center;gap:10px;')}>
                            <span style={sx(`width:8px;height:8px;border-radius:50%;background:${it.color};flex:0 0 auto;`)} />
                            <span style={sx('font-size:13px;font-weight:700;color:#9a917f;width:44px;flex:0 0 auto;')}>{it.time}</span>
                            <span style={sx('font-size:14px;flex:1;')}>{it.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {today.meal && (
                      <div style={sx('margin-top:12px;background:#f1e4d4;border-radius:12px;padding:10px 13px;font-size:13px;color:#6b5a45;')}>🍽️ Ce soir : <b>{today.meal.dish}</b></div>
                    )}
                    <button onClick={() => { setTab('planning'); setDay(today.dayIdx) }} style={sx('margin-top:13px;width:100%;border:none;background:#cf7d3c;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:13px;padding:12px;cursor:pointer;')}>Voir le planning du jour →</button>
                  </div>
                )}

                <div style={sx('margin:0 18px 12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:20px;padding:16px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
                  <div style={sx('display:flex;align-items:center;gap:12px;')}>
                    <div style={sx('width:44px;height:44px;border-radius:14px;background:#dfeae6;display:flex;align-items:center;justify-content:center;font-size:22px;')}>🚗</div>
                    <div style={sx('flex:1;')}>
                      <div style={sx('font-family:Quicksand;font-weight:700;font-size:16px;')}>Le grand départ</div>
                      <div style={sx('font-size:13px;color:#6b6354;margin-top:1px;')}>{fmtDayShort(trip.start)} · depuis {trip.origin}{trip.etape ? ` · via ${trip.etape}` : ''}</div>
                    </div>
                  </div>
                  <button onClick={() => setSub('trajet')} style={sx('margin-top:13px;width:100%;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:13px;padding:12px;cursor:pointer;')}>Voir le trajet →</button>
                </div>

                <button onClick={() => setSub('logistique')} style={sx('margin:0 18px 14px;width:calc(100% - 36px);text-align:left;background:#fffdf8;border:1px solid #efe6d4;border-radius:20px;padding:16px;cursor:pointer;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
                  <div style={sx('display:flex;justify-content:space-between;align-items:center;')}>
                    <div style={sx('font-family:Quicksand;font-weight:700;font-size:16px;')}>🧳 Valises &amp; préparatifs</div>
                    <div style={sx('font-size:13px;color:#6b6354;font-weight:700;')}>{packDone}/{packTotal}</div>
                  </div>
                  <div style={sx('margin-top:11px;height:9px;border-radius:9px;background:#efe6d4;overflow:hidden;')}><div style={sx(`height:100%;border-radius:9px;background:#cf7d3c;width:${packPct}%;`)} /></div>
                </button>

                <div style={sx('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>Tout le séjour</div>
                <div style={sx('padding:0 18px 12px;display:grid;grid-template-columns:1fr 1fr;gap:12px;')}>
                  {MODULES.map((m) => (
                    <button key={m.name} onClick={() => openModule(m.action)} style={sx('text-align:left;border:1px solid #efe6d4;background:#fffdf8;border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:10px;cursor:pointer;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
                      <div style={sx(`width:42px;height:42px;border-radius:13px;background:${m.bg};display:flex;align-items:center;justify-content:center;font-size:21px;`)}>{m.emoji}</div>
                      <div>
                        <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{m.name}</div>
                        <div style={sx('font-size:12px;color:#6b6354;margin-top:1px;')}>{m.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={sx('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>💡 Suggestions</div>
                <div style={sx('padding:0 18px 12px;')}>
                  <div style={sx('font-size:12px;color:#6b6354;margin-bottom:8px;')}>Une idée de fonctionnalité, une consigne pour les prochaines données ? Notez-la ici puis envoyez-la.</div>
                  <div style={sx('display:flex;gap:8px;')}>
                    <input data-testid="input-suggestion" value={newSuggestionText} onChange={(e) => setNewSuggestionText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitSuggestion()} placeholder="Ex : ajouter un mode sombre…" style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:10px 12px;font-size:14px;')} />
                    <button data-testid="btn-add-suggestion" onClick={submitSuggestion} style={sx('border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:0 16px;cursor:pointer;')}>+ Ajouter</button>
                  </div>
                  {suggestions.length > 0 && (
                    <div style={sx('display:flex;flex-direction:column;gap:8px;margin-top:10px;')}>
                      {suggestions.map((sug) => (
                        <div key={sug.id} style={sx('display:flex;align-items:center;gap:10px;background:#fffdf8;border:1px solid #efe6d4;border-radius:12px;padding:10px 12px;')}>
                          <span style={sx('font-size:13px;flex:1;')}>{sug.text}</span>
                          <button onClick={() => deleteSuggestion(sug.id)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;color:#b8503f;padding:2px 4px;')}>🗑️</button>
                        </div>
                      ))}
                      <button data-testid="btn-send-suggestions" onClick={sendSuggestions} style={sx('width:100%;margin-top:2px;border:1px solid #cf7d3c;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px;cursor:pointer;')}>📤 Envoyer sur Telegram / WhatsApp…</button>
                    </div>
                  )}
                </div>

                <div style={sx('padding:6px 18px 4px;display:flex;align-items:baseline;justify-content:space-between;')}>
                  <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>Sauvegarde</div>
                  <div data-testid="last-backup-label" style={sx('font-size:12px;color:#6b6354;')}>Dernière : {formatLastBackup(lastBackupAt)}</div>
                </div>
                <div style={sx('padding:6px 18px 12px;display:flex;gap:12px;')}>
                  <button data-testid="btn-export" onClick={() => { setExportCopied(false); setShowExport(true) }} style={sx('flex:1;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:13px;cursor:pointer;font-family:Quicksand;font-weight:700;font-size:14px;color:#4a5d3a;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>⬇️ Exporter (JSON)</button>
                  <button data-testid="btn-import" onClick={() => setShowImport(true)} style={sx('flex:1;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:13px;cursor:pointer;font-family:Quicksand;font-weight:700;font-size:14px;color:#9c6b4a;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>⬆️ Importer</button>
                </div>
                <div style={sx('padding:0 18px 12px;')}>
                  <button data-testid="btn-selftest" onClick={runSelfTestAndShow} style={sx('width:100%;border:1px dashed #d8cbb0;background:transparent;border-radius:14px;padding:10px;cursor:pointer;font-family:Quicksand;font-weight:600;font-size:12px;color:#9a917f;')}>🔧 Auto-diagnostic</button>
                </div>
                <div style={sx('height:16px;')} />
              </div>
            )}

            {/* PLANNING */}
            {tab === 'planning' && (
              <Planning
                sx={sx} days={days} trip={trip} fmtDayShort={fmtDayShort} day={day} setDay={setDay} setShowDayAdd={setShowDayAdd}
                cur={cur} editDay={editDay} editActivity={editActivity} deleteActivity={deleteActivity} startAddActivity={startAddActivity}
              />
            )}

            {/* VISITES */}
            {tab === 'visites' && (
              <div data-testid="screen-visites">
                <div style={sx('padding:54px 18px 4px;')}>
                  <div style={sx('font-family:Quicksand;font-weight:700;font-size:26px;')}>À faire</div>
                  <div style={sx('font-size:13px;color:#6b6354;')}>Autour du Puy Mary · {savedCount} enregistrées ♥</div>
                </div>
                <div style={sx('display:flex;gap:8px;overflow-x:auto;padding:12px 18px 14px;')}>
                  {FILTERS.map((f) => (
                    <button key={f} onClick={() => setFilter(f)} style={sx(`flex:0 0 auto;border:1px solid ${filter === f ? '#4a5d3a' : '#ece2cf'};background:${filter === f ? '#4a5d3a' : '#fffdf8'};color:${filter === f ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:8px 15px;font-weight:700;font-size:13px;cursor:pointer;`)}>{f}</button>
                  ))}
                </div>
                <div style={sx('display:flex;gap:8px;padding:0 18px 14px;')}>
                  {[['dist', '📍 Distance'], ['cat', '🏷️ Catégorie']].map(([k, label]) => (
                    <button key={k} onClick={() => setVisitSort(visitSort === k ? null : k)} style={sx(`flex:0 0 auto;border:1px solid ${visitSort === k ? '#4a5d3a' : '#ece2cf'};background:${visitSort === k ? '#4a5d3a' : '#fffdf8'};color:${visitSort === k ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:6px 13px;font-weight:700;font-size:12px;cursor:pointer;`)}>{label}</button>
                  ))}
                </div>
                <div style={sx('padding:0 18px 8px;display:flex;justify-content:flex-end;')}>
                  <button onClick={() => { setEditingVisitId(null); setNewVisitName(''); setNewVisitDist(''); setNewVisitDur(''); setNewVisitAge(''); setNewVisitCat('Nature'); setShowVisitEdit(true) }} style={sx('border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:7px 14px;cursor:pointer;')}>+ Ajouter visite</button>
                </div>
                <div style={sx('padding:0 18px;display:flex;flex-direction:column;gap:12px;')}>
                  {filteredVisits.map((v) => {
                    const sv = !!saved[v.id]
                    return (
                      <div key={v.id} style={sx('display:flex;gap:12px;align-items:center;background:#fffdf8;border:1px solid #efe6d4;border-radius:18px;padding:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
                        <div style={sx('width:52px;height:52px;flex:0 0 auto;border-radius:14px;background:#f3ece0;display:flex;align-items:center;justify-content:center;font-size:26px;')}>{v.emoji}</div>
                        <div style={sx('flex:1;min-width:0;')}>
                          <div style={sx('display:flex;align-items:center;gap:6px;')}>
                            <span style={sx(`width:8px;height:8px;border-radius:50%;background:${VCAT[v.cat]};flex:0 0 auto;`)} />
                            <span style={sx(`font-size:11px;font-weight:700;color:${VCAT[v.cat]};text-transform:uppercase;letter-spacing:0.5px;`)}>{v.cat}</span>
                          </div>
                          <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;margin-top:2px;')}>{v.name}</div>
                          <div style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>{v.dist}  ·  {v.dur}</div>
                          <div style={sx('display:inline-block;margin-top:7px;font-size:11px;font-weight:700;color:#6b6354;background:#f1e9da;border-radius:8px;padding:3px 8px;')}>👶 {v.age}</div>
                        </div>
                        <button onClick={() => toggleSaved(v.id)} style={sx('flex:0 0 auto;width:40px;height:40px;border:none;background:transparent;cursor:pointer;font-size:24px;line-height:1;')}>
                          {sv ? <span style={sx('color:#b8503f;')}>♥</span> : <span style={sx('color:#cabfa6;')}>♡</span>}
                        </button>
                        <button onClick={() => editVisit(v.id)} style={sx('flex:0 0 auto;border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;')}>✏️</button>
                        <button onClick={() => deleteVisit(v.id)} style={sx('flex:0 0 auto;border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;color:#b8503f;')}>🗑️</button>
                      </div>
                    )
                  })}
                </div>
                <div style={sx('height:16px;')} />
              </div>
            )}

            {/* REPAS */}
            {tab === 'repas' && (
              <Repas
                sx={sx} mealTab={mealTab} setMealTab={setMealTab} meals={meals} editMeal={editMeal} deleteMeal={deleteMeal} openAddMeal={openAddMeal}
                coursesDone={coursesDone} coursesTotal={coursesTotal} coursesPct={coursesPct} coursesSorted={coursesSorted} setCoursesSorted={setCoursesSorted} coursesGroups={coursesGroups}
                toggleCheck={toggleCheck} deleteCourseCategory={deleteCourseCategory} deleteCourseItem={deleteCourseItem}
                setEditingCourseKey={setEditingCourseKey} setShowAddCourseItem={setShowAddCourseItem} setShowAddCourseCat={setShowAddCourseCat}
                shoppingItems={shoppingItems} toggleShoppingItem={toggleShoppingItem} deleteShoppingItem={deleteShoppingItem}
                newShoppingItem={newShoppingItem} setNewShoppingItem={setNewShoppingItem} addShoppingItem={addShoppingItem}
              />
            )}

            {/* BUDGET */}
            {tab === 'budget' && (
              <Budget
                sx={sx} eur={eur} catColor={catColor} remain={remain} budgetTotal={budgetTotal} spentPct={spentPct} spent={spent}
                setNewBudgetTotal={setNewBudgetTotal} setShowBudgetTotalEdit={setShowBudgetTotalEdit} setShowAdd={setShowAdd} budgetCats={budgetCats}
                sortExpenses={sortExpenses} setSortExpenses={setSortExpenses} expenses={expenses} startEditExpense={startEditExpense} deleteExpense={deleteExpense}
              />
            )}

          </div>

          {/* BARRE D'ONGLETS */}
          <div data-testid="tab-bar" onTouchStart={tabBarSwipe.onTouchStart} onTouchEnd={tabBarSwipe.onTouchEnd} style={sx('flex:0 0 auto;display:flex;background:rgba(255,253,248,0.97);border-top:1px solid #ece2cf;padding:8px 6px 24px;')}>
            {TABS.map(([key, emoji, label]) => (
              <button key={key} data-testid={`tab-${key}`} onClick={() => { setTab(key); setSub(null) }} style={sx('flex:1;border:none;background:transparent;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:4px 0;')}>
                <span style={sx('font-size:20px;')}>{emoji}</span>
                <span style={sx(`font-size:11px;color:${tab === key ? '#4a5d3a' : '#b3a892'};font-weight:${tab === key ? '700' : '600'};`)}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============ FEUILLE : AJOUTER UNE DÉPENSE ============ */}
      {showAdd && (
        <div onClick={closeAdd} style={sx('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{editingExpenseIdx !== null ? 'Editer dépense' : 'Nouvelle dépense'}</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Montant</div>
            <input data-testid="input-montant" value={newAmt} onChange={(e) => setNewAmt(e.target.value)} inputMode="decimal" placeholder="0,00 €" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:18px;font-family:Quicksand;font-weight:700;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Libellé</div>
            <input data-testid="input-label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Ex : Glaces à Dienne" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Catégorie</div>
            <div style={sx('display:flex;flex-wrap:wrap;gap:8px;margin-top:7px;margin-bottom:20px;')}>
              {CATS.map((c) => (
                <button key={c.name} onClick={() => setNewCat(c.name)} style={sx(`border:none;border-radius:999px;padding:8px 15px;font-weight:700;font-size:13px;cursor:pointer;background:${newCat === c.name ? c.color : '#f3ece0'};color:${newCat === c.name ? '#fffaf0' : '#6b6354'};`)}>{c.name}</button>
              ))}
            </div>
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={closeAdd} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-submit-depense" onClick={submitExpense} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>{editingExpenseIdx !== null ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : EDITER REPAS ============ */}
      {showMealEdit && (
        <div onClick={closeMealEdit} style={sx('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{editingMealId === null ? 'Ajouter un repas' : `Repas du ${newMealDay}`}</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Jour</div>
            <input value={newMealDay} onChange={(e) => setNewMealDay(e.target.value)} placeholder="Ex : Sam 11" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Plat</div>
            <input value={newMealDish} onChange={(e) => setNewMealDish(e.target.value)} placeholder="Ex : Truffade maison" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={closeMealEdit} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveMeal} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : EDITER ACTIVITE PLANNING ============ */}
      {showActivityEdit && editingActivityIdx && (
        <div onClick={closeActivityEdit} style={sx('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Editer activite</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Horaire</div>
            <input value={newActivityTime} onChange={(e) => setNewActivityTime(e.target.value)} placeholder="Ex : 10:00" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Titre</div>
            <input value={newActivityTitle} onChange={(e) => setNewActivityTitle(e.target.value)} placeholder="Ex : Visite musee" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={closeActivityEdit} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={submitActivity} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : AJOUTER/EDITER JOUR ============ */}
      {showDayEdit && editingDayIdx !== null && (
        <div onClick={closeDayEdit} style={sx('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Editer jour</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Titre</div>
            <input value={newDayTitle} onChange={(e) => setNewDayTitle(e.target.value)} placeholder="Ex : Le grand depart" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Sous-titre</div>
            <input value={newDaySub} onChange={(e) => setNewDaySub(e.target.value)} placeholder="Ex : Lyon -> Mandailles" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={closeDayEdit} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveDay} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
              {days.length > 1 && <button onClick={() => { deleteDay(editingDayIdx); closeDayEdit() }} style={sx('flex:0 0 auto;border:none;background:#b8503f;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Supprimer</button>}
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : AJOUTER ACTIVITE ============ */}
      {showActivityAdd && (
        <div onClick={closeActivityAdd} style={sx('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Ajouter activite</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Horaire</div>
            <input value={newActivityTime} onChange={(e) => setNewActivityTime(e.target.value)} placeholder="Ex : 10:00" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Titre</div>
            <input value={newActivityTitle} onChange={(e) => setNewActivityTitle(e.target.value)} placeholder="Ex : Visite musee" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Couleur</div>
            <div style={sx('display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;margin-bottom:20px;')}>
              {['#5b7042', '#cf7d3c', '#4f8a86', '#9c6b4a', '#8a8b3d', '#b8503f'].map((c) => (
                <button key={c} onClick={() => setNewActivityColor(c)} style={sx(`width:32px;height:32px;border-radius:50%;background:${c};border:${newActivityColor === c ? '3px solid #2f2a22' : '2px solid #d8cbb0'};cursor:pointer;`)} />
              ))}
            </div>
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={closeActivityAdd} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={submitActivity} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : AJOUTER ARTICLE LOGI ============ */}
      {showAddLogiItem && (
        <div onClick={closeAddLogiItem} style={sx('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Ajouter un article</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Description</div>
            <input value={newLogiItem} onChange={(e) => setNewLogiItem(e.target.value)} placeholder="Ex : Chaussettes" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={closeAddLogiItem} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={addLogiItem} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : AJOUTER ARTICLE COURSES ============ */}
      {showAddCourseItem && (
        <div onClick={closeAddCourseItem} style={sx('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Ajouter un article</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Description</div>
            <input value={newCourseItem} onChange={(e) => setNewCourseItem(e.target.value)} placeholder="Ex : Fromage" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={closeAddCourseItem} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={addCourseItem} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : EDITER METEO ============ */}
      {showMeteoEdit && (
        <div onClick={closeMeteoEdit} style={sx('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{editingMeteoIdx === null ? 'Ajouter un jour' : 'Meteo'}</div>
            <div style={sx('display:flex;gap:10px;')}>
              <div style={sx('flex:1;')}>
                <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Jour</div>
                <input value={newMeteoDay} onChange={(e) => setNewMeteoDay(e.target.value)} placeholder="Sam" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
              <div style={sx('flex:1;')}>
                <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Numero</div>
                <input value={newMeteoNum} onChange={(e) => setNewMeteoNum(e.target.value)} placeholder="11" inputMode="numeric" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
            </div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Icone</div>
            <input value={newMeteoIcon} onChange={(e) => setNewMeteoIcon(e.target.value)} placeholder="☀️" maxLength="2" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:24px;text-align:center;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Temp max</div>
            <input value={newMeteoHi} onChange={(e) => setNewMeteoHi(e.target.value)} placeholder="24" inputMode="numeric" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Temp min</div>
            <input value={newMeteoLo} onChange={(e) => setNewMeteoLo(e.target.value)} placeholder="12" inputMode="numeric" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Pluie</div>
            <input value={newMeteoRain} onChange={(e) => setNewMeteoRain(e.target.value)} placeholder="10 %" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={closeMeteoEdit} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveMeteo} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : EDITER TRAJET ============ */}
      {showTrajetEdit && editingTrajetIdx !== null && (
        <div onClick={closeTrajetEdit} style={sx('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Editer etape</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Horaire</div>
            <input value={newTrajetTime} onChange={(e) => setNewTrajetTime(e.target.value)} placeholder="Ex : 08:30" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Lieu</div>
            <input value={newTrajetPlace} onChange={(e) => setNewTrajetPlace(e.target.value)} placeholder="Ex : Lyon" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Note</div>
            <input value={newTrajetNote} onChange={(e) => setNewTrajetNote(e.target.value)} placeholder="Ex : Pause cafe" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Couleur</div>
            <div style={sx('display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;margin-bottom:20px;')}>
              {['#5b7042', '#cf7d3c', '#4f8a86', '#9c6b4a', '#8a8b3d', '#b8503f'].map((c) => (
                <button key={c} onClick={() => setNewTrajetColor(c)} style={sx(`width:32px;height:32px;border-radius:50%;background:${c};border:${newTrajetColor === c ? '3px solid #2f2a22' : '2px solid #d8cbb0'};cursor:pointer;`)} />
              ))}
            </div>
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={closeTrajetEdit} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveTrajetStep} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEUILLE : EDITER VISITE ============ */}
      {showVisitEdit && (
        <div onClick={closeVisitEdit} style={sx('position:absolute;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{editingVisitId === null ? 'Ajouter une visite' : 'Editer visite'}</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Nom</div>
            <input value={newVisitName} onChange={(e) => setNewVisitName(e.target.value)} placeholder="Ex : Puy Mary" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Categorie</div>
            <select value={newVisitCat} onChange={(e) => setNewVisitCat(e.target.value)} style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')}>
              <option>Nature</option>
              <option>Famille</option>
              <option>Patrimoine</option>
              <option>Baignade</option>
              <option>Gourmand</option>
              <option>Marche</option>
            </select>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Distance</div>
            <input value={newVisitDist} onChange={(e) => setNewVisitDist(e.target.value)} placeholder="Ex : 25 min" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Duree</div>
            <input value={newVisitDur} onChange={(e) => setNewVisitDur(e.target.value)} placeholder="Ex : 2 h" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Age recommande</div>
            <input value={newVisitAge} onChange={(e) => setNewVisitAge(e.target.value)} placeholder="Ex : Des 3 ans" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={closeVisitEdit} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveVisit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Budget total edit */}
      {showBudgetTotalEdit && (
        <div onClick={() => setShowBudgetTotalEdit(false)} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Budget total</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Montant (€)</div>
            <input type="number" value={newBudgetTotal} onChange={(e) => setNewBudgetTotal(e.target.value)} placeholder={String(budgetTotal)} style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} onKeyDown={(e) => e.key === 'Enter' && saveBudgetTotal()} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={() => setShowBudgetTotalEdit(false)} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveBudgetTotal} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Hébergement edit */}
      {showHebEdit && (
        <div onClick={() => setShowHebEdit(false)} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Modifier l'hébergement</div>
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
                <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>{label}</div>
                <input value={val} onChange={(e) => setter(e.target.value)} placeholder={ph} style={sx('width:100%;margin-top:6px;margin-bottom:12px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
            ))}
            <div style={sx('display:flex;gap:10px;margin-top:8px;')}>
              <button onClick={() => setShowHebEdit(false)} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={saveHebergement} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Trajet checklist add item */}
      {showAddTrajetCheck && (
        <div onClick={() => setShowAddTrajetCheck(false)} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Ajouter un item</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Description</div>
            <input value={newTrajetCheckItem} onChange={(e) => setNewTrajetCheckItem(e.target.value)} placeholder="Ex : Chargeur téléphone" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} onKeyDown={(e) => e.key === 'Enter' && addTrajetCheckItem()} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={() => setShowAddTrajetCheck(false)} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button onClick={addTrajetCheckItem} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Export des données */}
      {showExport && (
        <div onClick={() => setShowExport(false)} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Exporter les données</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;')}>Toutes les données de l'app (planning, dépenses, listes, favoris…) au format JSON. À garder en lieu sûr ou à envoyer sur un autre téléphone.</div>
            <textarea data-testid="export-json" readOnly value={buildExport(currentStoreData(), STORE_KEY)} onFocus={(e) => e.target.select()} style={sx('width:100%;height:180px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:11px;font-family:ui-monospace,monospace;resize:none;')} />
            <button data-testid="btn-share-export" onClick={doShareExport} style={sx('width:100%;margin-top:14px;border:none;background:#cf7d3c;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>📤 Envoyer vers Telegram / WhatsApp…</button>
            <div style={sx('display:flex;gap:10px;margin-top:10px;')}>
              <button onClick={copyExport} style={sx(`flex:1;border:none;background:${exportCopied ? '#5b7042' : '#4a5d3a'};color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;`)}>{exportCopied ? '✓ Copié !' : '📋 Copier'}</button>
              <button onClick={doDownloadExport} style={sx('flex:1;border:1px solid #4a5d3a;background:#fffdf8;color:#4a5d3a;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>💾 Télécharger</button>
            </div>
            <button onClick={() => setShowExport(false)} style={sx('width:100%;margin-top:10px;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Fermer</button>
          </div>
        </div>
      )}

      {/* MODAL: Import des données */}
      {showImport && (
        <div onClick={closeImport} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Importer des données</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;')}>Coller un export Cantou ci-dessous, ou choisir le fichier JSON.</div>
            <textarea data-testid="import-textarea" value={importText} onChange={(e) => { setImportText(e.target.value); doParseImport(e.target.value) }} placeholder='{"app":"cantou", …}' style={sx('width:100%;height:140px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:11px;font-family:ui-monospace,monospace;resize:none;')} />
            <label style={sx('display:block;margin-top:10px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px;cursor:pointer;text-align:center;')}>
              📂 Choisir un fichier…
              <input type="file" accept=".json,application/json" onChange={handleImportFile} style={sx('display:none;')} />
            </label>
            {importError && <div style={sx('margin-top:10px;background:#f7e2dc;border-radius:12px;padding:11px 13px;font-size:13px;color:#b8503f;font-weight:600;')}>⚠️ {importError}</div>}
            {importPreview && (
              <div data-testid="import-preview" style={sx('margin-top:10px;background:#e7ecdf;border-radius:12px;padding:11px 13px;font-size:13px;color:#4a5d3a;')}>
                ✓ Export Cantou valide — {Array.isArray(importPreview.expenses) ? importPreview.expenses.length : 0} dépenses, {Array.isArray(importPreview.meals) ? importPreview.meals.length : 0} repas, {Array.isArray(importPreview.visits) ? importPreview.visits.length : 0} visites, {Array.isArray(importPreview.days) ? importPreview.days.length : 0} jours de planning.
              </div>
            )}
            <div style={sx('display:flex;gap:10px;margin-top:14px;')}>
              <button onClick={closeImport} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-apply-import" onClick={applyImport} disabled={!importPreview} style={sx(`flex:1;border:none;background:${importPreview ? '#b8503f' : '#d8cbb0'};color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:${importPreview ? 'pointer' : 'not-allowed'};`)}>Remplacer mes données</button>
            </div>
            <div style={sx('margin-top:10px;font-size:12px;color:#6b6354;text-align:center;')}>⚠️ Remplace toutes les données actuelles de l'app.</div>
          </div>
        </div>
      )}

      {/* MODAL: Auto-diagnostic */}
      {showSelftest && (
        <div onClick={() => setShowSelftest(false)} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Auto-diagnostic</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;')}>Vérifications rapides exécutées directement sur ce téléphone (pas la suite de tests complète du build — voir le skill « release »).</div>
            <div data-testid="selftest-summary" style={sx(`font-family:Quicksand;font-weight:700;font-size:15px;margin-bottom:10px;color:${selftestResults.every((r) => r.pass) ? '#4a5d3a' : '#b8503f'};`)}>
              {selftestResults.filter((r) => r.pass).length} / {selftestResults.length} vérifications OK
            </div>
            <div data-testid="selftest-results">
              {selftestResults.map((r, i) => (
                <div key={i} style={sx(`display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #ece2cf;font-size:13px;color:${r.pass ? '#4a5d3a' : '#b8503f'};`)}>
                  <span>{r.pass ? '✅' : '❌'}</span>
                  <div>
                    <div style={sx('font-weight:600;')}>{r.name}</div>
                    {!r.pass && <div style={sx('font-size:12px;color:#6b6354;')}>{r.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowSelftest(false)} style={sx('width:100%;margin-top:14px;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Fermer</button>
          </div>
        </div>
      )}

      {/* MODAL: Paramètres du voyage */}
      {showTripEdit && (
        <div onClick={() => setShowTripEdit(false)} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Paramètres du voyage</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;')}>Ces réglages pilotent le compte à rebours, les cartes et les notifications.</div>
            <div style={sx('display:flex;gap:10px;')}>
              <div style={sx('flex:1;')}>
                <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Date de départ</div>
                <input data-testid="input-trip-start" type="date" value={newTripStart} onChange={(e) => setNewTripStart(e.target.value)} style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
              <div style={sx('flex:1;')}>
                <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Date de retour</div>
                <input data-testid="input-trip-end" type="date" value={newTripEnd} onChange={(e) => setNewTripEnd(e.target.value)} style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
            </div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Ville de départ</div>
            <input data-testid="input-trip-origin" value={newTripOrigin} onChange={(e) => setNewTripOrigin(e.target.value)} placeholder="Ex : Beauvais" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Étape (nuit) — optionnel</div>
            <input value={newTripEtape} onChange={(e) => setNewTripEtape(e.target.value)} placeholder="Ex : Laschamps" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Destination</div>
            <input data-testid="input-trip-dest" value={newTripDest} onChange={(e) => setNewTripDest(e.target.value)} placeholder="Ex : Mandailles (Cantal)" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={() => setShowTripEdit(false)} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-save-trip" onClick={saveTrip} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nouvelle liste de logistique */}
      {showAddLogiList && (
        <div onClick={() => setShowAddLogiList(false)} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Nouvelle liste</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Emoji</div>
            <input value={newLogiListEmoji} onChange={(e) => setNewLogiListEmoji(e.target.value)} placeholder="📦" maxLength="2" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:24px;text-align:center;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Nom</div>
            <input data-testid="input-logi-list-name" value={newLogiListName} onChange={(e) => setNewLogiListName(e.target.value)} placeholder="Ex : Sac de plage" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} onKeyDown={(e) => e.key === 'Enter' && addLogiList()} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={() => setShowAddLogiList(false)} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-save-logi-list" onClick={addLogiList} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nouvelle catégorie de courses */}
      {showAddCourseCat && (
        <div onClick={() => setShowAddCourseCat(false)} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Nouvelle catégorie</div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Nom</div>
            <input data-testid="input-course-cat-name" value={newCourseCatName} onChange={(e) => setNewCourseCatName(e.target.value)} placeholder="Ex : Apéro" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} onKeyDown={(e) => e.key === 'Enter' && addCourseCategory()} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={() => setShowAddCourseCat(false)} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-save-course-cat" onClick={addCourseCategory} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Ajouter un jour au planning */}
      {showDayAdd && (
        <div onClick={() => setShowDayAdd(false)} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
          <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Ajouter un jour</div>
            <div style={sx('display:flex;gap:10px;')}>
              <div style={sx('flex:1;')}>
                <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Jour (abrégé)</div>
                <input data-testid="input-day-dow" value={newDayDow} onChange={(e) => setNewDayDow(e.target.value)} placeholder="Ex : Dim" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
              <div style={sx('flex:1;')}>
                <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Numéro</div>
                <input data-testid="input-day-num" value={newDayNum} onChange={(e) => setNewDayNum(e.target.value)} placeholder="Ex : 16" inputMode="numeric" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
              </div>
            </div>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Titre</div>
            <input data-testid="input-day-title" value={newDayTitle2} onChange={(e) => setNewDayTitle2(e.target.value)} placeholder="Ex : Journée détente" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Sous-titre</div>
            <input value={newDaySub2} onChange={(e) => setNewDaySub2(e.target.value)} placeholder="Ex : Au gré de l'envie" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
            <div style={sx('display:flex;gap:10px;')}>
              <button onClick={() => setShowDayAdd(false)} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
              <button data-testid="btn-save-day-add" onClick={addDay} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* BANDEAU UNDO SUPPRESSION */}
      {undoMsg && (
        <div data-testid="undo-snackbar" style={sx('position:fixed;left:18px;right:18px;bottom:96px;z-index:300;background:#2f2a22;color:#fffaf0;border-radius:14px;padding:12px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 24px rgba(0,0,0,0.3);animation:fadeIn 0.2s ease;')}>
          <span style={sx('flex:1;font-size:14px;font-weight:600;')}>{undoMsg}</span>
          <button data-testid="btn-undo" onClick={applyUndo} style={sx('border:none;background:transparent;color:#e8c07a;font-weight:700;font-family:Quicksand;font-size:14px;cursor:pointer;padding:4px 8px;')}>Annuler</button>
        </div>
      )}

    </main>
  )
}
