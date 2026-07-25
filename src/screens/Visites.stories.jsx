import { Visites } from './Visites.jsx'
import { s } from '../utils.js'
import { VISITS_INITIAL } from '../data.js'

/** Écran Visites (« À faire ») : liste filtrable/triable des sorties, favoris ♥,
 *  notes/étoiles, bouton « Y aller » et 📸. */
export default {
  title: 'Écrans/Visites',
  component: Visites,
  tags: ['autodocs'],
  args: {
    sx: s, filteredVisits: VISITS_INITIAL, saved: { 1: true, 5: true }, savedCount: 2,
    filter: 'Tous', visitSort: null, ratings: { 1: { stars: 5, note: 'Magnifique' } },
    setFilter: () => {}, setVisitSort: () => {}, setEditingVisitId: () => {}, setNewVisitName: () => {},
    setNewVisitDist: () => {}, setNewVisitDur: () => {}, setNewVisitAge: () => {}, setNewVisitCat: () => {},
    setShowVisitEdit: () => {}, toggleSaved: () => {}, editVisit: () => {}, deleteVisit: () => {},
    rateVisit: () => {}, setVisitNote: () => {}, capturePhoto: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const FiltreNature = { name: 'Filtre « Nature »', args: { filter: 'Nature', filteredVisits: VISITS_INITIAL.filter((v) => v.cat === 'Nature') } }
