import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { StatusBar, Style } from '@capacitor/status-bar'
import { MEALS_INITIAL, SHOPPING_ITEMS_INITIAL, LOGI_INITIAL, COURSES_INITIAL, VISITS_INITIAL, METEO_INITIAL, TRAJETS_INITIAL, TRIP_INITIAL, DAYS_INITIAL, BINGO_CANTAL, RESTOS_INITIAL, GITE_COORDS, KIDS_GAMES, EMERGENCY_NUMBERS } from './data.js'
import { s, eur, buildList, tripDate, fmtDayShort, fmtMonthYear } from './utils.js'
import { filterAndSortVisits } from './visits.js'
import { computeToday } from './today.js'
import { weatherSuggestion } from './weather.js'
// Sous-écrans chargés à la demande (code-splitting) — allègent le bundle initial,
// ils ne sont montés qu'à l'ouverture depuis l'accueil (sub === …).
const Meteo = lazy(() => import('./screens/Meteo.jsx').then(m => ({ default: m.Meteo })))
const Hebergement = lazy(() => import('./screens/Hebergement.jsx').then(m => ({ default: m.Hebergement })))
const Logistique = lazy(() => import('./screens/Logistique.jsx').then(m => ({ default: m.Logistique })))
const Trajet = lazy(() => import('./screens/Trajet.jsx').then(m => ({ default: m.Trajet })))
import { Budget } from './screens/Budget.jsx'
import { Repas } from './screens/Repas.jsx'
import { Planning } from './screens/Planning.jsx'
import { Visites } from './screens/Visites.jsx'
import { Accueil } from './screens/Accueil.jsx'
import { scheduleAllNotifications } from './notifications.js'
import { applyDarkTheme, STARRY_BACKGROUND_IMAGE } from './theme.js'
import { parseImport, formatLastBackup } from './backup.js'
import { encodeSharePayload, shareConfig as shareConfigText } from './share-config.js'
import { DEPARTURE_INITIAL, isCheckoutWindow } from './departure.js'
import { challengeOfDay, dayKey } from './challenges.js'
import { runSelfTests } from './selftest.js'
import { useVisits } from './hooks/useVisits.js'
import { useSwipe } from './hooks/useSwipe.js'
import { useSuggestions } from './hooks/useSuggestions.js'
import { useMeteo } from './hooks/useMeteo.js'
import { useTrajets } from './hooks/useTrajets.js'
import { shareSuggestions } from './suggestions.js'
import { useExpenses } from './hooks/useExpenses.js'
import { useMeals } from './hooks/useMeals.js'
import { useRestos } from './hooks/useRestos.js'
import { useDeparture } from './hooks/useDeparture.js'
import { useRatings } from './hooks/useRatings.js'
import { useFeatures } from './hooks/useFeatures.js'
import { NewLogiListModal } from './modals/NewLogiListModal.jsx'
import { NewCourseCatModal } from './modals/NewCourseCatModal.jsx'
import { AddDayModal } from './modals/AddDayModal.jsx'
import { SelftestModal } from './modals/SelftestModal.jsx'
import { MealSheet } from './modals/MealSheet.jsx'
import { ActivityEditSheet } from './modals/ActivityEditSheet.jsx'
import { DayEditSheet } from './modals/DayEditSheet.jsx'
import { ExpenseSheet } from './modals/ExpenseSheet.jsx'
import { ActivityAddSheet } from './modals/ActivityAddSheet.jsx'
import { useLogi } from './hooks/useLogi.js'
import { useCourses } from './hooks/useCourses.js'
import { usePlanning } from './hooks/usePlanning.js'
import { useTripConfig } from './hooks/useTripConfig.js'
import { Confetti } from './Confetti.jsx'
const ExportModal = lazy(() => import('./modals/ExportModal.jsx').then(mod => ({ default: mod.ExportModal })))
const ImportModal = lazy(() => import('./modals/ImportModal.jsx').then(mod => ({ default: mod.ImportModal })))
const EditVisitModal = lazy(() => import('./modals/EditVisitModal.jsx').then(mod => ({ default: mod.EditVisitModal })))
const AddLogiItemModal = lazy(() => import('./modals/AddLogiItemModal.jsx').then(mod => ({ default: mod.AddLogiItemModal })))
const AddCourseItemModal = lazy(() => import('./modals/AddCourseItemModal.jsx').then(mod => ({ default: mod.AddCourseItemModal })))
const AddTrajetCheckModal = lazy(() => import('./modals/AddTrajetCheckModal.jsx').then(mod => ({ default: mod.AddTrajetCheckModal })))
const EditMeteoFullModal = lazy(() => import('./modals/EditMeteoFullModal.jsx').then(mod => ({ default: mod.EditMeteoFullModal })))
const EditTripModal = lazy(() => import('./modals/EditTripModal.jsx').then(mod => ({ default: mod.EditTripModal })))
const EditTrajetStepModal = lazy(() => import('./modals/EditTrajetStepModal.jsx').then(mod => ({ default: mod.EditTrajetStepModal })))
const EditBudgetModal = lazy(() => import('./modals/EditBudgetModal.jsx').then(mod => ({ default: mod.EditBudgetModal })))
const EditHebergementModal = lazy(() => import('./modals/EditHebergementModal.jsx').then(mod => ({ default: mod.EditHebergementModal })))
const JournalModal = lazy(() => import('./modals/JournalModal.jsx').then(mod => ({ default: mod.JournalModal })))
const VoteModal = lazy(() => import('./modals/VoteModal.jsx').then(mod => ({ default: mod.VoteModal })))
const Souvenirs = lazy(() => import('./screens/Souvenirs.jsx').then(m => ({ default: m.Souvenirs })))
const Bingo = lazy(() => import('./screens/Bingo.jsx').then(m => ({ default: m.Bingo })))
import { countCompletedLines } from './bingo.js'
const Bilan = lazy(() => import('./screens/Bilan.jsx').then(m => ({ default: m.Bilan })))
import { shareRecap, computeRecap } from './recap.js'
const WhatsNewModal = lazy(() => import('./modals/WhatsNewModal.jsx').then(mod => ({ default: mod.WhatsNewModal })))
const ChangelogModal = lazy(() => import('./modals/ChangelogModal.jsx').then(mod => ({ default: mod.ChangelogModal })))
const Onboarding = lazy(() => import('./screens/Onboarding.jsx').then(m => ({ default: m.Onboarding })))
import { shouldOnboard } from './onboarding.js'
import { BUILD_NUMBER } from './build-info.js'
import { entriesSince } from './changelog.js'
import { currentPositionMapsHref, openExternal, getCurrentCoords, mapsCoordsHref } from './links.js'
import { CarSpot } from './components/CarSpot.jsx'
const Restos = lazy(() => import('./screens/Restos.jsx').then(m => ({ default: m.Restos })))
const Departure = lazy(() => import('./screens/Departure.jsx').then(m => ({ default: m.Departure })))
const Itinerary = lazy(() => import('./screens/Itinerary.jsx').then(m => ({ default: m.Itinerary })))
const Carte = lazy(() => import('./screens/Carte.jsx').then(m => ({ default: m.Carte })))
const CarteDetaillee = lazy(() => import('./screens/CarteDetaillee.jsx').then(m => ({ default: m.CarteDetaillee })))
const Reglages = lazy(() => import('./screens/Reglages.jsx').then(m => ({ default: m.Reglages })))
const PartageConfig = lazy(() => import('./screens/PartageConfig.jsx').then(m => ({ default: m.PartageConfig })))
const Sejours = lazy(() => import('./screens/Sejours.jsx').then(m => ({ default: m.Sejours })))
const RestoModal = lazy(() => import('./modals/RestoModal.jsx').then(mod => ({ default: mod.RestoModal })))
import { usePhotos } from './hooks/usePhotos.js'
import { buildJournalText, shareJournal } from './journal.js'
import { buildIcs, shareIcs } from './ics.js'
import { applyMigrations, LATEST_SCHEMA } from './migrations.js'

const haptic = (style = ImpactStyle.Light) => { Haptics.impact({ style }).catch(() => {}) }

// Boot : charge + migre le store une seule fois au démarrage
const ensureStoreIsUpToDate = () => {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('cantou.v1')
    if (!raw) return // premier lancement, rien à migrer
    const store = JSON.parse(raw)
    const migrated = applyMigrations(store, store.schemaVersion ?? 1)
    localStorage.setItem('cantou.v1', JSON.stringify(migrated))
  } catch (e) {
    console.warn('[Store] Migration failed:', e)
  }
}
ensureStoreIsUpToDate()

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
  nom: 'Notre gîte en Carladès',
  adresse: 'Vezels-Roussy (15130)',
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
  features: {},
  kidsGames: structuredClone(KIDS_GAMES),
  bingoItems: structuredClone(BINGO_CANTAL),
  emergencyNumbers: structuredClone(EMERGENCY_NUMBERS),
  onboarded: false,
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
      journal: p.journal ?? {},
      carGames: p.carGames ?? { cowLeft: 0, cowRight: 0 },
      photos: p.photos ?? [],
      familyMembers: p.familyMembers ?? [],
      bingo: p.bingo ?? {},
      lastSeenBuild: p.lastSeenBuild ?? 0,
      restos: p.restos ?? structuredClone(RESTOS_INITIAL),
      departure: p.departure ?? structuredClone(DEPARTURE_INITIAL),
      ratings: p.ratings ?? {},
      carSpot: p.carSpot ?? null,
      challengesDone: p.challengesDone ?? {},
      features: p.features ?? {},
      kidsGames: p.kidsGames ?? structuredClone(KIDS_GAMES),
      bingoItems: p.bingoItems ?? structuredClone(BINGO_CANTAL),
      emergencyNumbers: p.emergencyNumbers ?? structuredClone(EMERGENCY_NUMBERS),
      // Store existant (raw présent) = utilisateur déjà installé → pas d'assistant.
      // Le 1er lancement (pas de raw) part de DEFAULTS (onboarded:false) → assistant.
      onboarded: p.onboarded ?? true,
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
    // Barre de statut Android synchronisée avec le thème (crème/bleu nuit).
    // Style.Light = fond clair (icônes sombres), Style.Dark = l'inverse.
    // No-op silencieux hors app native (web/tests : promesse rejetée, catch).
    StatusBar.setStyle({ style: darkMode ? Style.Dark : Style.Light }).catch(() => {})
    StatusBar.setBackgroundColor({ color: darkMode ? '#10162b' : '#f4ecdc' }).catch(() => {})
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
  const [confettiTrigger, setConfettiTrigger] = useState(false)
  const [editingMealId, setEditingMealId] = useState(null)
  const [editingActivityIdx, setEditingActivityIdx] = useState(null)
  const [showActivityEdit, setShowActivityEdit] = useState(false)
  const [newAmt, setNewAmt] = useState('')
  const [newCat, setNewCat] = useState('Nourriture')
  const [newLabel, setNewLabel] = useState('')
  const [newPaidBy, setNewPaidBy] = useState('')
  const [newReceiptId, setNewReceiptId] = useState('')
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
  // eslint-disable-next-line no-unused-vars -- `exportCopied` n'est pas lu ici : seul
  // le setter est transmis à l'Accueil (feedback « ✓ Copié »). Paire conservée entière.
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
  const { suggestions, addSuggestion, removeSuggestion } = useSuggestions(initial.suggestions)
  const [lastBackupAt, setLastBackupAt] = useState(initial.lastBackupAt || null)
  const [journal, setJournal] = useState(initial.journal || {})
  const [carGames, setCarGames] = useState(initial.carGames || { cowLeft: 0, cowRight: 0 })
  const [familyMembers, setFamilyMembers] = useState(initial.familyMembers || [])
  const [showVote, setShowVote] = useState(false)
  const [lastSeenBuild, setLastSeenBuild] = useState(initial.lastSeenBuild || 0)
  const [onboarded, setOnboarded] = useState(initial.onboarded ?? false)
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const whatsNewEntries = useMemo(() => entriesSince(lastSeenBuild), [lastSeenBuild])
  useEffect(() => {
    // 1ʳᵉ install (lastSeenBuild=0) : on cale silencieusement sur le build courant,
    // pas de déballage du changelog. Sinon, nouveau build vu → « Quoi de neuf ».
    if (lastSeenBuild === 0) { setLastSeenBuild(BUILD_NUMBER); return }
    if (BUILD_NUMBER > lastSeenBuild && entriesSince(lastSeenBuild).length) setShowWhatsNew(true)
  }, []) // au montage uniquement
  const closeWhatsNew = () => { setShowWhatsNew(false); setLastSeenBuild(BUILD_NUMBER) }
  const [showChangelog, setShowChangelog] = useState(false)
  // « Ma position » : géoloc native (plugin) → ouvre Google Maps (extra non-offline)
  const openMyPosition = async () => {
    haptic(ImpactStyle.Light)
    try {
      const href = await currentPositionMapsHref()
      if (href) openExternal(href)
    } catch {
      // GPS refusé/indisponible : on informe brièvement (sinon le bouton semble « mort »)
      try { window.alert('Position indisponible — vérifie que la localisation est activée et autorisée pour Cantou.') } catch { }
    }
  }
  // Mémo voiture : mémorise le point GPS où on s'est garé, y retourne via Maps.
  const [carSpot, setCarSpot] = useState(initial.carSpot || null)
  const parkCar = async () => {
    haptic(ImpactStyle.Medium)
    try {
      const { lat, lng } = await getCurrentCoords()
      setCarSpot({ lat, lng, at: Date.now() })
    } catch {
      try { window.alert('Position indisponible — vérifie que la localisation est activée et autorisée pour Cantou.') } catch { }
    }
  }
  const findCar = () => { if (carSpot) { haptic(ImpactStyle.Light); openExternal(mapsCoordsHref(carSpot.lat, carSpot.lng)) } }
  const forgetCar = () => { haptic(ImpactStyle.Light); setCarSpot(null) }
  // Carnet de restaurants (CRUD + réservations)
  const { restos, setRestos, addResto, updateResto, removeResto } = useRestos(initial.restos)
  const { departure, setDeparture, toggleDeparture: toggleDepartureItem, addDepartureItem, removeDepartureItem } = useDeparture(initial.departure)
  const toggleDeparture = (id) => { haptic(ImpactStyle.Light); toggleDepartureItem(id) }
  const isCheckoutSoon = useMemo(() => isCheckoutWindow(trip.end), [trip.end])
  const { features, setFeatures, toggleFeature, isOn } = useFeatures(initial.features)
  // Données de référence désormais dans le store (donc dans l'export JSON,
  // personnalisables). Valeurs par défaut seedées depuis les constantes.
  const [kidsGames] = useState(initial.kidsGames || structuredClone(KIDS_GAMES))
  const [bingoItems] = useState(initial.bingoItems || structuredClone(BINGO_CANTAL))
  const [emergencyNumbers] = useState(initial.emergencyNumbers || structuredClone(EMERGENCY_NUMBERS))
  const { ratings, setRatings, rateVisit: rateVisitEntry, setVisitNote } = useRatings(initial.ratings)
  const rateVisit = (id, stars) => { haptic(ImpactStyle.Light); rateVisitEntry(id, stars) }
  const openMaps = (url) => { try { window.open(url, '_blank') } catch { /* WebView sans window.open */ } }
  const [challengesDone, setChallengesDone] = useState(initial.challengesDone || {})
  const todayKey = dayKey()
  const dailyChallenge = useMemo(() => challengeOfDay(todayKey), [todayKey])
  const challengeDone = !!challengesDone[todayKey]
  const markChallengeDone = () => {
    if (challengesDone[todayKey]) return
    haptic(ImpactStyle.Medium)
    setChallengesDone((d) => ({ ...d, [todayKey]: true }))
    setConfettiTrigger(true); setTimeout(() => setConfettiTrigger(false), 2500)
  }
  const [showResto, setShowResto] = useState(false)
  const [editingRestoId, setEditingRestoId] = useState(null)
  const [restoForm, setRestoForm] = useState({ name: '', place: '', tel: '', resa: '', reserved: false })
  const setRestoField = (k, v) => setRestoForm((f) => ({ ...f, [k]: v }))
  const openAddResto = () => { setEditingRestoId(null); setRestoForm({ name: '', place: '', tel: '', resa: '', reserved: false }); setShowResto(true) }
  const openEditResto = (id) => { const r = restos.find((x) => x.id === id); if (!r) return; setEditingRestoId(id); setRestoForm({ name: r.name, place: r.place || '', tel: r.tel || '', resa: r.resa || '', reserved: !!r.reserved }); setShowResto(true) }
  const saveResto = () => {
    if (!restoForm.name.trim()) return
    haptic(ImpactStyle.Medium)
    const data = { ...restoForm, name: restoForm.name.trim() }
    if (editingRestoId === null) addResto(data)
    else updateResto(editingRestoId, data)
    setShowResto(false)
  }
  const deleteResto = (id) => { haptic(ImpactStyle.Medium); removeResto(id); setShowResto(false) }
  const [bingo, setBingo] = useState(initial.bingo || {})
  const toggleBingo = (idx) => {
    haptic(ImpactStyle.Light)
    setBingo((b) => {
      const next = { ...b, [idx]: !b[idx] }
      // Célébration si cocher cette case complète une nouvelle ligne
      if (!b[idx] && countCompletedLines(next) > countCompletedLines(b)) {
        haptic(ImpactStyle.Medium)
        setConfettiTrigger(true)
        setTimeout(() => setConfettiTrigger(false), 2500)
      }
      return next
    })
  }
  const { photos, srcMap, capturePhoto, deletePhoto, loadSrc, shareDay } = usePhotos(initial.photos || [], trip, days)

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
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ schemaVersion: LATEST_SCHEMA, saved, checks, expenses, meals, shoppingItems, days, visits, meteo, trajets, trip, logi, courses, budgetTotal, hebergement, trajetCheckItems, suggestions, lastBackupAt, journal, carGames, photos, familyMembers, bingo, lastSeenBuild, restos, departure, ratings, challengesDone, carSpot, features, kidsGames, bingoItems, emergencyNumbers, onboarded })) } catch { }
  }, [saved, checks, expenses, meals, shoppingItems, days, visits, meteo, trajets, trip, logi, courses, budgetTotal, hebergement, trajetCheckItems, suggestions, lastBackupAt, journal, carGames, photos, familyMembers, bingo, lastSeenBuild, restos, departure, ratings, challengesDone, carSpot, features, kidsGames, bingoItems, emergencyNumbers, onboarded])

  // (Re)planifie tous les rappels au démarrage et à chaque modification
  // du planning ou des menus — natif Android (survit à la fermeture) ou
  // fallback web en dev.
  useEffect(() => {
    scheduleAllNotifications(days, meals, meteo, trip, lastBackupAt).catch(() => { })
  }, [days, meals, meteo, trip, lastBackupAt])

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
  const today = useMemo(() => computeToday(trip, days, meteo, meals), [trip.start, trip.end, days, meteo, meals])

  // Jour J : la date du jour est le jour de départ paramétré
  const isDepartureDay = useMemo(() => {
    const now = new Date()
    const start = tripDate(trip.start, 0)
    return now.getFullYear() === start.getFullYear() && now.getMonth() === start.getMonth() && now.getDate() === start.getDate()
  }, [trip.start])

  // Confetti de célébration à l'ouverture le matin du départ (une seule fois)
  const departureCelebrated = useRef(false)
  useEffect(() => {
    if (isDepartureDay && !departureCelebrated.current) {
      departureCelebrated.current = true
      setConfettiTrigger(true)
      setTimeout(() => setConfettiTrigger(false), 2500)
    }
  }, [isDepartureDay])

  // Journal de bord — une entrée par jour, sauvée au fil de la saisie
  const [showJournal, setShowJournal] = useState(false)
  const [journalDayIdx, setJournalDayIdx] = useState(0)
  const openJournal = (dayIdx) => { setJournalDayIdx(dayIdx); setShowJournal(true) }
  // Depuis Souvenirs : renvoie au jour du calendrier et ouvre son journal.
  const openDayJournal = (dayIdx) => { setSub(null); setTab('planning'); setDay(dayIdx); openJournal(dayIdx) }
  const journalDayKey = days[journalDayIdx] ? `${days[journalDayIdx].dow} ${days[journalDayIdx].num}` : ''
  const updateJournalEntry = (field, value) => setJournal((j) => ({ ...j, [journalDayKey]: { ...(j[journalDayKey] || {}), [field]: value } }))
  const doShareJournal = () => { haptic(ImpactStyle.Medium); shareJournal(days, journal) }

  // Partage d'une activité du planning en .ics (Google Calendar & co)
  const shareActivity = (dayIdx, itemIdx) => {
    const d = days[dayIdx]
    const it = d?.items?.[itemIdx]
    if (!d || !it) return
    haptic(ImpactStyle.Light)
    const [ty, tm] = trip.start.split('-').map(Number)
    const date = new Date(ty, tm - 1, d.num)
    const dateIso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const ics = buildIcs({ title: it.title, dateIso, time: it.time, location: trip.destination, description: it.note || `Séjour Cantou — ${d.title}` })
    shareIcs(ics, `cantou-${String(it.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'evenement'}.ics`)
  }

  // Compteur de vaches (jeu du trajet)
  const bumpCow = (side) => {
    haptic(ImpactStyle.Light)
    setCarGames((g) => (side === 'left' ? { ...g, cowLeft: (g.cowLeft || 0) + 1 } : { ...g, cowRight: (g.cowRight || 0) + 1 }))
  }
  const resetCows = () => { haptic(ImpactStyle.Medium); setCarGames((g) => ({ ...g, cowLeft: 0, cowRight: 0 })) }

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

  // Bilan de séjour — synthèse des données existantes pour l'écran Bilan.
  const recapData = computeRecap({ days, spent, budgetTotal, spentPct, budgetCats, savedCount, packPct, coursesPct, meals, photos, ratings, visits })

  // visites filtrées + triées
  const filteredVisits = filterAndSortVisits(visits, filter, visitSort)

  const cur = days[day]
  const tr = buildList(checks, 'tr_dep', trajetCheckItems)
  const subTitle = { trajet: 'Le trajet', logistique: 'Valises & préparatifs', hebergement: 'Hébergement', meteo: 'Météo', souvenirs: 'Souvenirs', bingo: 'Bingo du Cantal', bilan: 'Bilan du séjour', restos: 'Nos restos', departure: 'Départ du gîte', itineraire: 'Itinéraire du jour', carte: 'Carte du séjour', 'carte-detaillee': 'Carte détaillée', reglages: 'Réglages', sejours: 'Mes séjours', 'partage-config': 'Partager la config' }[sub] || ''

  // confetti si une checklist atteint 100%
  useEffect(() => {
    const has100pct = packPct === 100 || coursesPct === 100 || tr.pct === 100
    if (has100pct && !confettiTrigger) {
      setConfettiTrigger(true)
      setTimeout(() => setConfettiTrigger(false), 2500)
    }
  }, [packPct, coursesPct, tr.pct, confettiTrigger])

  const openModule = (action) =>
    action.indexOf('sub:') === 0 ? setSub(action.slice(4)) : (setTab(action.slice(4)), setSub(null))

  const submitExpense = () => {
    const a = parseFloat(String(newAmt).replace(',', '.'))
    if (!a || a <= 0) return
    haptic(ImpactStyle.Medium)
    const data = { label: newLabel || newCat, cat: newCat, amt: a }
    // Partage des dépenses : attribue un payeur si la famille est renseignée.
    if (familyMembers.length) data.paidBy = newPaidBy || familyMembers[0]
    data.receiptId = newReceiptId || undefined // reçu photo attaché
    if (editingExpenseIdx !== null) {
      updateExpense(editingExpenseIdx, data)
      setEditingExpenseIdx(null)
    } else {
      addExpense(data)
    }
    setShowAdd(false); setNewAmt(''); setNewLabel(''); setNewPaidBy(''); setNewReceiptId('')
  }
  const captureReceipt = async (source = 'camera') => {
    const meta = await capturePhoto(source, { kind: 'receipt' })
    if (meta) setNewReceiptId(meta.id)
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
    setNewPaidBy(e.paidBy || '')
    setNewReceiptId(e.receiptId || '')
    setEditingExpenseIdx(idx)
    setShowAdd(true)
  }
  const closeAdd = () => { setShowAdd(false); setNewAmt(''); setNewLabel(''); setNewPaidBy(''); setNewReceiptId(''); setEditingExpenseIdx(null) }

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

  // Assistant de premier lancement (onboarding) — collecte dates/trajet/budget
  // puis mémorise `onboarded` pour ne plus jamais s'afficher.
  const finishOnboarding = ({ start, end, origin, etape, destination, budget }) => {
    haptic(ImpactStyle.Medium)
    if (start && end && start <= end && origin?.trim() && destination?.trim()) {
      updateTrip({ start, end, origin: origin.trim(), etape: (etape || '').trim(), destination: destination.trim() })
    }
    const b = parseFloat(String(budget).replace(',', '.'))
    if (b > 0) setBudgetTotal(b)
    setOnboarded(true)
  }
  const skipOnboarding = () => setOnboarded(true)

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
  const currentStoreData = () => ({ schemaVersion: LATEST_SCHEMA, saved, checks, expenses, meals, shoppingItems, days, visits, meteo, trajets, trip, logi, courses, budgetTotal, hebergement, trajetCheckItems, suggestions, lastBackupAt, journal, carGames, photos, familyMembers, bingo, lastSeenBuild, restos, departure, ratings, challengesDone, carSpot, features, kidsGames, bingoItems, emergencyNumbers, onboarded })
  const markBackedUp = () => setLastBackupAt(new Date().toISOString())
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
  const applyImport = () => {
    if (!importPreview) return
    haptic(ImpactStyle.Medium)
    try { localStorage.setItem(STORE_KEY, JSON.stringify(importPreview)) } catch { }
    // Recharge l'app pour ré-hydrater tous les états depuis le store importé
    try { window.location.reload() } catch { }
  }
  const closeImport = () => { setShowImport(false); setImportText(''); setImportError(''); setImportPreview(null) }

  // Multi-séjours : remet le store à ses valeurs par défaut (« séjour vierge »).
  // On efface la clé cantou.v1 puis on recharge — loadStore() reconstruit les
  // DEFAULTS. Les profils (cantou.profiles) ne sont PAS touchés.
  const resetToDefaults = () => {
    haptic(ImpactStyle.Medium)
    try { localStorage.removeItem(STORE_KEY) } catch { }
    try { window.location.reload() } catch { }
  }

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
  // Onglets réellement affichés (l'accueil ne se coupe jamais).
  const visibleTabs = TABS.filter(([key]) => key === 'accueil' || isOn(`tab_${key}`))
  // Garde-fou : si l'onglet courant vient d'être désactivé, revenir à l'accueil.
  useEffect(() => {
    if (tab !== 'accueil' && !isOn(`tab_${tab}`)) { setTab('accueil'); setSub(null) }
  }, [tab, features]) // eslint-disable-line react-hooks/exhaustive-deps

  // Navigation par glissement : gauche/droite sur la barre d'onglets pour
  // changer d'écran, glissement gauche→droite sur le contenu d'un
  // sous-écran pour revenir en arrière (équivalent du bouton ‹).
  const currentTabIdx = visibleTabs.findIndex(([key]) => key === tab)
  const goToAdjacentTab = (dir) => {
    const nextIdx = currentTabIdx + dir
    if (nextIdx < 0 || nextIdx >= visibleTabs.length) return
    haptic(ImpactStyle.Light)
    setTab(visibleTabs[nextIdx][0])
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
      <Confetti trigger={confettiTrigger} />

      {/* ============ ONBOARDING (1er lancement) ============ */}
      {shouldOnboard({ onboarded }) && (
        <Suspense fallback={null}>
          <Onboarding sx={sx} trip={trip} isOn={isOn} toggleFeature={toggleFeature} onFinish={finishOnboarding} onSkip={skipOnboarding} />
        </Suspense>
      )}

      {/* ============ SOUS-ÉCRANS ============ */}
      {sub && (
        <div data-testid="sub-screen-wrapper" onTouchStart={subScreenSwipe.onTouchStart} onTouchEnd={subScreenSwipe.onTouchEnd} style={sx('height:100%;display:flex;flex-direction:column;')}>
          <div style={sx('display:flex;align-items:center;gap:8px;padding:54px 14px 12px;background:#fffdf8;border-bottom:1px solid #ece2cf;flex:0 0 auto;')}>
            <button data-testid="sub-back" onClick={() => setSub(null)} style={sx('width:36px;height:36px;border:none;background:#f1e9da;border-radius:50%;font-size:22px;line-height:1;cursor:pointer;color:#4a5d3a;display:flex;align-items:center;justify-content:center;padding-bottom:4px;')}>‹</button>
            <span style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>{subTitle}</span>
          </div>
          {/* key={sub} remonte le conteneur à chaque navigation → rejoue screenIn */}
          <div key={sub} className="screen-in" style={sx('flex:1;overflow-y:auto;')}>
            <Suspense fallback={null}>

            {/* TRAJET */}
            {sub === 'trajet' && (
              <Trajet
                sx={sx} trajetDir={trajetDir} setTrajetDir={setTrajetDir} trip={trip} fmtDayShort={fmtDayShort} trajets={trajets}
                editTrajetStep={editTrajetStep} deleteTrajetStep={deleteTrajetStep}
                setEditingTrajetIdx={setEditingTrajetIdx} setNewTrajetTime={setNewTrajetTime} setNewTrajetPlace={setNewTrajetPlace}
                setNewTrajetNote={setNewTrajetNote} setNewTrajetColor={setNewTrajetColor} setShowTrajetEdit={setShowTrajetEdit}
                tr={tr} setShowAddTrajetCheck={setShowAddTrajetCheck} toggleCheck={toggleCheck} deleteTrajetCheckItem={deleteTrajetCheckItem}
                carGames={carGames} bumpCow={bumpCow} resetCows={resetCows}
              />
            )}

            {/* SOUVENIRS */}
            {sub === 'souvenirs' && (
              <Souvenirs sx={sx} photos={photos} days={days} srcMap={srcMap} capturePhoto={capturePhoto} deletePhoto={deletePhoto} loadSrc={loadSrc} shareDay={shareDay} journal={journal} openDayJournal={openDayJournal} trip={trip} />
            )}

            {/* BINGO */}
            {sub === 'bingo' && (
              <Bingo sx={sx} items={bingoItems} checked={bingo} toggleBingo={toggleBingo} />
            )}

            {/* BILAN */}
            {sub === 'bilan' && (
              <Bilan sx={sx} recap={recapData} onShare={() => { haptic(ImpactStyle.Medium); shareRecap(recapData) }} />
            )}

            {/* RESTOS */}
            {sub === 'restos' && (
              <Restos sx={sx} restos={restos} openAddResto={openAddResto} openEditResto={openEditResto} deleteResto={deleteResto} />
            )}

            {/* DÉPART DU GÎTE */}
            {sub === 'departure' && (
              <Departure sx={sx} departure={departure} toggleDeparture={toggleDeparture} addDepartureItem={addDepartureItem} removeDepartureItem={removeDepartureItem} />
            )}

            {/* ITINÉRAIRE DU JOUR */}
            {sub === 'itineraire' && (
              <Itinerary sx={sx} visits={visits} saved={saved} openMaps={openMaps} />
            )}

            {/* CARTE DU SÉJOUR (hors-ligne) */}
            {sub === 'carte' && (
              <Carte sx={sx} visits={visits} gite={{ ...GITE_COORDS, name: hebergement?.nom }} carSpot={carSpot} savedIds={Object.keys(saved).filter((k) => saved[k]).map(Number)} findCar={findCar} openDetailed={() => setSub('carte-detaillee')} />
            )}

            {/* CARTE DÉTAILLÉE (OpenTopoMap, en ligne, repli hors-ligne) */}
            {sub === 'carte-detaillee' && (
              <CarteDetaillee sx={sx} visits={visits} gite={{ ...GITE_COORDS, name: hebergement?.nom }} carSpot={carSpot} savedIds={Object.keys(saved).filter((k) => saved[k]).map(Number)} findCar={findCar} />
            )}

            {/* RÉGLAGES (fonctions désactivables) */}
            {sub === 'reglages' && (
              <Reglages sx={sx} isOn={isOn} toggleFeature={toggleFeature} relaunchOnboarding={() => { setOnboarded(false); setSub(null) }} />
            )}

            {/* MES SÉJOURS (multi-séjours / modèles réutilisables) */}
            {sub === 'sejours' && (
              <Sejours sx={sx} trip={trip} fmtDayShort={fmtDayShort} fmtMonthYear={fmtMonthYear} currentStoreData={currentStoreData} resetToDefaults={resetToDefaults} />
            )}

            {/* PARTAGE DE CONFIG (QR + copier/coller, hors-ligne) */}
            {sub === 'partage-config' && (
              <PartageConfig sx={sx} payloadText={encodeSharePayload(currentStoreData())} onShare={shareConfigText} setters={{ setTrip, setSaved, setBudgetTotal, setFeatures }} />
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

            </Suspense>
          </div>
        </div>
      )}

      {/* ============ ÉCRANS PRINCIPAUX (onglets) ============ */}
      {!sub && (
        <div style={sx('height:100%;display:flex;flex-direction:column;')}>
          {/* key={tab} remonte le conteneur à chaque changement d'onglet → rejoue screenIn */}
          <div key={tab} className="screen-in" style={sx('flex:1;overflow-y:auto;')}>

            {/* ACCUEIL */}
            {tab === 'accueil' && (
              <Accueil
                sx={sx} darkMode={darkMode} setDarkMode={setDarkMode} openTripEdit={openTripEdit} fmtDayShort={fmtDayShort} fmtMonthYear={fmtMonthYear}
                trip={trip} countdown={countdown} today={today} setTab={setTab} setDay={setDay} setSub={setSub}
                packDone={packDone} packTotal={packTotal} packPct={packPct} openModule={openModule}
                newSuggestionText={newSuggestionText} setNewSuggestionText={setNewSuggestionText} submitSuggestion={submitSuggestion}
                suggestions={suggestions} deleteSuggestion={deleteSuggestion} sendSuggestions={sendSuggestions}
                lastBackupAt={lastBackupAt} formatLastBackup={formatLastBackup} setExportCopied={setExportCopied}
                setShowExport={setShowExport} setShowImport={setShowImport} runSelfTestAndShow={runSelfTestAndShow}
                isDepartureDay={isDepartureDay} quickPhoto={() => { setSub('souvenirs'); capturePhoto('camera') }} openMyPosition={openMyPosition} openChangelog={() => setShowChangelog(true)}
                isCheckoutSoon={isCheckoutSoon} departureDone={departure.filter((i) => i.done).length} departureTotal={departure.length}
                dailyChallenge={isOn('extra_challenge') ? dailyChallenge : null} challengeDone={challengeDone} markChallengeDone={markChallengeDone}
                carSpot={carSpot} parkCar={isOn('extra_carspot') ? parkCar : null} findCar={findCar} forgetCar={forgetCar}
                isOn={isOn} kidsGames={kidsGames} emergencyNumbers={emergencyNumbers}
                weatherSuggest={today && isOn('extra_weather_suggestions') ? weatherSuggestion(today.w, visits) : null} onOpenVisites={() => { setTab('visites'); setSub(null) }}
              />
            )}

            {/* PLANNING */}
            {tab === 'planning' && (
              <Planning
                sx={sx} days={days} trip={trip} fmtDayShort={fmtDayShort} day={day} setDay={setDay} setShowDayAdd={setShowDayAdd}
                cur={cur} editDay={editDay} editActivity={editActivity} deleteActivity={deleteActivity} startAddActivity={startAddActivity}
                openJournal={openJournal} shareActivity={shareActivity}
              />
            )}

            {/* VISITES */}
            {tab === 'visites' && (
              <Visites
                sx={sx} savedCount={savedCount} filter={filter} setFilter={setFilter} visitSort={visitSort} setVisitSort={setVisitSort}
                filteredVisits={filteredVisits} saved={saved}
                setEditingVisitId={setEditingVisitId} setNewVisitName={setNewVisitName} setNewVisitDist={setNewVisitDist}
                setNewVisitDur={setNewVisitDur} setNewVisitAge={setNewVisitAge} setNewVisitCat={setNewVisitCat} setShowVisitEdit={setShowVisitEdit}
                toggleSaved={toggleSaved} editVisit={editVisit} deleteVisit={deleteVisit}
                openVote={isOn('extra_vote') ? () => setShowVote(true) : null}
                ratings={ratings} rateVisit={rateVisit} setVisitNote={setVisitNote}
              />
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
                familyMembers={familyMembers} srcMap={srcMap} loadSrc={loadSrc}
              />
            )}

          </div>

          {/* BARRE D'ONGLETS */}
          <div data-testid="tab-bar" onTouchStart={tabBarSwipe.onTouchStart} onTouchEnd={tabBarSwipe.onTouchEnd} style={sx('flex:0 0 auto;display:flex;background:rgba(255,253,248,0.97);border-top:1px solid #ece2cf;padding:8px 6px 24px;')}>
            {visibleTabs.map(([key, emoji, label]) => (
              <button key={key} data-testid={`tab-${key}`} onClick={() => { setTab(key); setSub(null) }} style={sx('flex:1;border:none;background:transparent;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:4px 0;')}>
                <span style={sx('font-size:19px;')}>{emoji}</span>
                <span style={sx(`font-size:12px;color:${tab === key ? '#4a5d3a' : '#6b6354'};font-weight:${tab === key ? '700' : '600'};`)}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============ FEUILLE : AJOUTER UNE DÉPENSE ============ */}
      {showAdd && (
        <ExpenseSheet sx={sx} onClose={closeAdd} isEdit={editingExpenseIdx !== null} cats={CATS}
          amount={newAmt} setAmount={setNewAmt} label={newLabel} setLabel={setNewLabel} cat={newCat} setCat={setNewCat}
          familyMembers={familyMembers} paidBy={newPaidBy} setPaidBy={setNewPaidBy}
          receiptId={newReceiptId} setReceiptId={setNewReceiptId} onCaptureReceipt={captureReceipt} onSubmit={submitExpense} />
      )}

      {/* ============ FEUILLE : EDITER REPAS ============ */}
      {showMealEdit && (
        <MealSheet sx={sx} onClose={closeMealEdit} isEdit={editingMealId !== null} day={newMealDay} setDay={setNewMealDay} dish={newMealDish} setDish={setNewMealDish} onSubmit={saveMeal} />
      )}

      {/* ============ FEUILLE : EDITER ACTIVITE PLANNING ============ */}
      {showActivityEdit && editingActivityIdx && (
        <ActivityEditSheet sx={sx} onClose={closeActivityEdit} time={newActivityTime} setTime={setNewActivityTime} title={newActivityTitle} setTitle={setNewActivityTitle} onSubmit={submitActivity} />
      )}

      {/* ============ FEUILLE : AJOUTER/EDITER JOUR ============ */}
      {showDayEdit && editingDayIdx !== null && (
        <DayEditSheet sx={sx} onClose={closeDayEdit} title={newDayTitle} setTitle={setNewDayTitle} sub={newDaySub} setSub={setNewDaySub} onSubmit={saveDay} onDelete={() => { deleteDay(editingDayIdx); closeDayEdit() }} canDelete={days.length > 1} />
      )}

      {/* ============ FEUILLE : AJOUTER ACTIVITE ============ */}
      {showActivityAdd && (
        <ActivityAddSheet sx={sx} onClose={closeActivityAdd} time={newActivityTime} setTime={setNewActivityTime} title={newActivityTitle} setTitle={setNewActivityTitle} color={newActivityColor} setColor={setNewActivityColor} onSubmit={submitActivity} />
      )}

      {showAddLogiItem && <Suspense fallback={null}><AddLogiItemModal isOpen={showAddLogiItem} onClose={closeAddLogiItem} selectedLogiKey={editingLogiKey} newLogiItem={newLogiItem} setNewLogiItem={setNewLogiItem} logiLists={logi} darkMode={darkMode} onSubmit={addLogiItem} /></Suspense>}

      {showAddCourseItem && <Suspense fallback={null}><AddCourseItemModal isOpen={showAddCourseItem} onClose={closeAddCourseItem} selectedCourseKey={editingCourseKey} newCourseItem={newCourseItem} setNewCourseItem={setNewCourseItem} courseGroups={courses} darkMode={darkMode} onSubmit={addCourseItem} /></Suspense>}

      {showMeteoEdit && <Suspense fallback={null}><EditMeteoFullModal isOpen={showMeteoEdit} onClose={closeMeteoEdit} editingMeteoIdx={editingMeteoIdx} newMeteoDay={newMeteoDay} setNewMeteoDay={setNewMeteoDay} newMeteoNum={newMeteoNum} setNewMeteoNum={setNewMeteoNum} newMeteoIcon={newMeteoIcon} setNewMeteoIcon={setNewMeteoIcon} newMeteoHi={newMeteoHi} setNewMeteoHi={setNewMeteoHi} newMeteoLo={newMeteoLo} setNewMeteoLo={setNewMeteoLo} newMeteoRain={newMeteoRain} setNewMeteoRain={setNewMeteoRain} darkMode={darkMode} onSubmit={saveMeteo} /></Suspense>}

      {showTrajetEdit && <Suspense fallback={null}><EditTrajetStepModal isOpen={showTrajetEdit} onClose={closeTrajetEdit} editingTrajetIdx={editingTrajetIdx} newTrajetTime={newTrajetTime} setNewTrajetTime={setNewTrajetTime} newTrajetPlace={newTrajetPlace} setNewTrajetPlace={setNewTrajetPlace} newTrajetNote={newTrajetNote} setNewTrajetNote={setNewTrajetNote} newTrajetColor={newTrajetColor} setNewTrajetColor={setNewTrajetColor} darkMode={darkMode} onSubmit={saveTrajetStep} /></Suspense>}

      {showVisitEdit && <Suspense fallback={null}><EditVisitModal isOpen={showVisitEdit} onClose={closeVisitEdit} editIdx={editingVisitId} editVisitName={newVisitName} setEditVisitName={setNewVisitName} editVisitDist={newVisitDist} setEditVisitDist={setNewVisitDist} editVisitCat={newVisitCat} setEditVisitCat={setNewVisitCat} editVisitNote={newVisitAge} setEditVisitNote={setNewVisitAge} darkMode={darkMode} onSubmit={saveVisit} onDelete={() => {}} /></Suspense>}

      {showBudgetTotalEdit && <Suspense fallback={null}><EditBudgetModal isOpen={showBudgetTotalEdit} onClose={() => setShowBudgetTotalEdit(false)} newBudgetTotal={newBudgetTotal} setNewBudgetTotal={setNewBudgetTotal} budgetTotal={budgetTotal} darkMode={darkMode} onSubmit={saveBudgetTotal} /></Suspense>}

      {/* MODAL: Hébergement edit */}
      {showHebEdit && <Suspense fallback={null}><EditHebergementModal isOpen={showHebEdit} onClose={() => setShowHebEdit(false)} hebFields={{ nom: newHebNom, adresse: newHebAdresse, arrivee: newHebArrivee, depart: newHebDepart, capacite: newHebCapacite, wifiNom: newHebWifiNom, wifiPass: newHebWifiPass, contact: newHebContact }} setHebFields={(update) => { Object.entries(update).forEach(([k, v]) => { if (k === 'nom') setNewHebNom(v); else if (k === 'adresse') setNewHebAdresse(v); else if (k === 'arrivee') setNewHebArrivee(v); else if (k === 'depart') setNewHebDepart(v); else if (k === 'capacite') setNewHebCapacite(v); else if (k === 'wifiNom') setNewHebWifiNom(v); else if (k === 'wifiPass') setNewHebWifiPass(v); else if (k === 'contact') setNewHebContact(v); }); }} darkMode={darkMode} onSubmit={saveHebergement} /></Suspense>}

      {showAddTrajetCheck && <Suspense fallback={null}><AddTrajetCheckModal isOpen={showAddTrajetCheck} onClose={() => setShowAddTrajetCheck(false)} newTrajetCheckItem={newTrajetCheckItem} setNewTrajetCheckItem={setNewTrajetCheckItem} darkMode={darkMode} onSubmit={addTrajetCheckItem} /></Suspense>}

      {/* MODAL: Journal de bord */}
      {showJournal && <Suspense fallback={null}><JournalModal
        isOpen={showJournal} onClose={() => setShowJournal(false)} sx={sx}
        dayLabel={days[journalDayIdx] ? `${days[journalDayIdx].dow} ${days[journalDayIdx].num} — ${days[journalDayIdx].title}` : ''}
        entry={journal[journalDayKey]} updateEntry={updateJournalEntry}
        onShare={doShareJournal} canShare={!!buildJournalText(days, journal)}
      /></Suspense>}

      {/* MODAL: Vote familial « on fait quoi demain ? » */}
      {showVote && <Suspense fallback={null}><VoteModal
        isOpen={showVote} onClose={() => setShowVote(false)} sx={sx}
        visits={visits} savedVisitIds={Object.keys(saved).filter((k) => saved[k]).map(Number)}
        familyMembers={familyMembers} setFamilyMembers={setFamilyMembers}
        days={days} addActivity={addActivity}
        onWinner={() => { haptic(ImpactStyle.Medium); setConfettiTrigger(true); setTimeout(() => setConfettiTrigger(false), 2500) }}
      /></Suspense>}

      {/* MODAL: Ajout/édition resto */}
      {showResto && <Suspense fallback={null}><RestoModal isOpen={showResto} onClose={() => setShowResto(false)} sx={sx} editing={editingRestoId !== null} fields={restoForm} setField={setRestoField} onSubmit={saveResto} onDelete={() => deleteResto(editingRestoId)} /></Suspense>}

      {/* MODAL: Quoi de neuf (premier lancement d'un build) */}
      {showWhatsNew && <Suspense fallback={null}><WhatsNewModal isOpen={showWhatsNew} onClose={closeWhatsNew} sx={sx} entries={whatsNewEntries} /></Suspense>}

      {/* MODAL: Historique des versions (bouton) */}
      {showChangelog && <Suspense fallback={null}><ChangelogModal isOpen={showChangelog} onClose={() => setShowChangelog(false)} sx={sx} currentBuild={BUILD_NUMBER} /></Suspense>}

      {/* MODAL: Export des données */}
      {showExport && <Suspense fallback={null}><ExportModal isOpen={showExport} onClose={() => setShowExport(false)} currentStoreData={currentStoreData} STORE_KEY={STORE_KEY} darkMode={darkMode} onExportCopied={markBackedUp} /></Suspense>}

      {showImport && <Suspense fallback={null}><ImportModal isOpen={showImport} onClose={closeImport} importText={importText} setImportText={setImportText} importError={importError} importPreview={importPreview} applyImport={applyImport} doParseImport={doParseImport} darkMode={darkMode} /></Suspense>}

      {/* MODAL: Auto-diagnostic */}
      {showSelftest && (
        <SelftestModal sx={sx} onClose={() => setShowSelftest(false)} results={selftestResults} />
      )}

      {/* MODAL: Paramètres du voyage */}
      {showTripEdit && <Suspense fallback={null}><EditTripModal isOpen={showTripEdit} onClose={() => setShowTripEdit(false)} newTripStart={newTripStart} setNewTripStart={setNewTripStart} newTripEnd={newTripEnd} setNewTripEnd={setNewTripEnd} newTripOrigin={newTripOrigin} setNewTripOrigin={setNewTripOrigin} newTripEtape={newTripEtape} setNewTripEtape={setNewTripEtape} newTripDest={newTripDest} setNewTripDest={setNewTripDest} darkMode={darkMode} onSubmit={saveTrip} /></Suspense>}

      {/* MODAL: Nouvelle liste de logistique */}
      {showAddLogiList && (
        <NewLogiListModal sx={sx} onClose={() => setShowAddLogiList(false)} emoji={newLogiListEmoji} setEmoji={setNewLogiListEmoji} name={newLogiListName} setName={setNewLogiListName} onSubmit={addLogiList} />
      )}

      {/* MODAL: Nouvelle catégorie de courses */}
      {showAddCourseCat && (
        <NewCourseCatModal sx={sx} onClose={() => setShowAddCourseCat(false)} name={newCourseCatName} setName={setNewCourseCatName} onSubmit={addCourseCategory} />
      )}

      {/* MODAL: Ajouter un jour au planning */}
      {showDayAdd && (
        <AddDayModal sx={sx} onClose={() => setShowDayAdd(false)} dow={newDayDow} setDow={setNewDayDow} num={newDayNum} setNum={setNewDayNum} title={newDayTitle2} setTitle={setNewDayTitle2} sub={newDaySub2} setSub={setNewDaySub2} onSubmit={addDay} />
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
