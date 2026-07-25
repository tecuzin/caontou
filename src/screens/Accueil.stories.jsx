import { Accueil } from './Accueil.jsx'
import { s, fmtDayShort, fmtMonthYear } from '../utils.js'
import {
  TRIP_INITIAL, DAYS_INITIAL, MEALS_INITIAL, METEO_INITIAL, VISITS_INITIAL,
  KIDS_GAMES, EMERGENCY_NUMBERS, LOGI_INITIAL, COURSES_INITIAL,
} from '../data.js'

const today = { d: DAYS_INITIAL[2], w: METEO_INITIAL[2], meal: MEALS_INITIAL[2], dayIdx: 2 }

const suggestions = [
  { id: 1, text: 'Aller voir la cascade de la Conche un matin', done: false },
  { id: 2, text: 'Acheter du Cantal jeune au marché de Vic', done: false },
]

// Store complet (fonction) — la recherche globale de l'Accueil appelle storeData().
const storeData = () => ({
  trip: TRIP_INITIAL, days: DAYS_INITIAL, meals: MEALS_INITIAL, visits: VISITS_INITIAL,
  logi: LOGI_INITIAL, courses: COURSES_INITIAL, saved: { 1: true, 5: true }, budgetTotal: 1800,
})

const noop = () => {}

/** Écran Accueil — hero « prochaine aventure », carte du jour, recherche globale,
 *  grille de modules, jeux, suggestions, urgences et sauvegarde. */
export default {
  title: 'Écrans/Accueil',
  component: Accueil,
  tags: ['autodocs'],
  args: {
    sx: s, darkMode: false, setDarkMode: noop, openTripEdit: noop,
    fmtDayShort, fmtMonthYear, trip: TRIP_INITIAL, countdown: 11, today,
    setTab: noop, setDay: noop, setSub: noop,
    packDone: 14, packTotal: 22, packPct: 64, openModule: noop,
    newSuggestionText: '', setNewSuggestionText: noop, submitSuggestion: noop,
    suggestions, deleteSuggestion: noop, sendSuggestions: noop,
    lastBackupAt: '2026-07-20T18:30:00.000Z',
    formatLastBackup: (v) => (v ? '20 juil. à 18:30' : 'jamais'),
    setExportCopied: noop, setShowExport: noop, setShowImport: noop, runSelfTestAndShow: noop,
    isDepartureDay: false, quickPhoto: noop, openMyPosition: noop, openChangelog: noop,
    isCheckoutSoon: false, departureDone: 0, departureTotal: 8,
    dailyChallenge: { emoji: '🐄', label: 'Compte 10 vaches de Salers' }, challengeDone: false, markChallengeDone: noop,
    carSpot: null, parkCar: noop, findCar: noop, forgetCar: noop,
    isOn: () => true, kidsGames: KIDS_GAMES, emergencyNumbers: EMERGENCY_NUMBERS,
    weatherSuggest: null, onOpenVisites: noop, storeData,
  },
  argTypes: {
    sx: { table: { disable: true } },
    fmtDayShort: { table: { disable: true } },
    fmtMonthYear: { table: { disable: true } },
    isOn: { table: { disable: true } },
    formatLastBackup: { table: { disable: true } },
    storeData: { table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}

export const JourDuDepart = {
  name: 'Jour J',
  args: { isDepartureDay: true, countdown: 0 },
}

export const MeteoPluvieuse = {
  name: 'Suggestion météo (pluie)',
  args: {
    weatherSuggest: {
      rainy: true,
      message: 'Pluie annoncée cet après-midi — et si on visitait quelque chose au sec ?',
      indoor: VISITS_INITIAL.filter((v) => v.indoor),
    },
  },
}
