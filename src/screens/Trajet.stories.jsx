import { Trajet } from './Trajet.jsx'
import { s, fmtDayShort } from '../utils.js'
import { TRAJETS_INITIAL, TRIP_INITIAL } from '../data.js'

const tr = {
  done: 2, total: 4, pct: 50, items: [
    { label: 'Pleins faits', checked: true }, { label: 'Sièges auto installés', checked: true },
    { label: 'Eau & en-cas à portée', checked: false }, { label: 'Doudous accessibles', checked: false },
  ],
}

/** Écran Trajet : étapes aller/retour, checklist de départ, jeux de voiture. */
export default {
  title: 'Écrans/Trajet',
  component: Trajet,
  tags: ['autodocs'],
  args: {
    sx: s, trajetDir: 'aller', trip: TRIP_INITIAL, fmtDayShort, trajets: TRAJETS_INITIAL, tr,
    carGames: { cowLeft: 3, cowRight: 5, plates: {} },
    setTrajetDir: () => {}, editTrajetStep: () => {}, deleteTrajetStep: () => {}, setEditingTrajetIdx: () => {},
    setNewTrajetTime: () => {}, setNewTrajetPlace: () => {}, setNewTrajetNote: () => {}, setNewTrajetColor: () => {},
    setShowTrajetEdit: () => {}, setShowAddTrajetCheck: () => {}, toggleCheck: () => {}, deleteTrajetCheckItem: () => {},
    bumpCow: () => {}, resetCows: () => {}, togglePlate: () => {}, resetPlates: () => {},
  },
  argTypes: { sx: { table: { disable: true } }, fmtDayShort: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const Aller = { args: { trajetDir: 'aller' } }
export const Retour = { args: { trajetDir: 'retour' } }
