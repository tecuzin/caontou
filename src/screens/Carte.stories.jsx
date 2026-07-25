import { Carte } from './Carte.jsx'
import { s } from '../utils.js'
import { VISITS_INITIAL, GITE_COORDS } from '../data.js'

/** Écran Carte du séjour : plan SVG maison (gîte + visites), position voiture,
 *  accès à la carte détaillée hors-ligne. */
export default {
  title: 'Écrans/Carte',
  component: Carte,
  tags: ['autodocs'],
  args: {
    sx: s, visits: VISITS_INITIAL, gite: GITE_COORDS, carSpot: null,
    savedIds: [1, 5], ratings: {}, findCar: () => {}, openDetailed: () => {},
  },
  argTypes: { sx: { table: { disable: true } }, findCar: { table: { disable: true } }, openDetailed: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
