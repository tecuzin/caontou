import { Planning } from './Planning.jsx'
import { s, fmtDayShort } from '../utils.js'
import { DAYS_INITIAL, TRIP_INITIAL, MEALS_INITIAL } from '../data.js'

/** Écran Planning : sélecteur de jours + timeline du jour (activités + repas
 *  daté), boutons journal / éditer / imprimer. */
export default {
  title: 'Écrans/Planning',
  component: Planning,
  tags: ['autodocs'],
  args: {
    sx: s, days: DAYS_INITIAL, trip: TRIP_INITIAL, fmtDayShort, day: 2, cur: DAYS_INITIAL[2],
    meals: MEALS_INITIAL,
    setDay: () => {}, setShowDayAdd: () => {}, editDay: () => {}, editActivity: () => {},
    deleteActivity: () => {}, startAddActivity: () => {}, openJournal: () => {}, shareActivity: () => {},
    setTab: () => {}, setSub: () => {},
  },
  argTypes: { sx: { table: { disable: true } }, fmtDayShort: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
