import { CarteDetaillee } from './CarteDetaillee.jsx'
import { s } from '../utils.js'
import { VISITS_INITIAL, GITE_COORDS } from '../data.js'

const gite = { ...GITE_COORDS, name: 'Notre gîte' }
const carSpot = { lat: 44.83, lng: 2.57, at: Date.now() - 45 * 60 * 1000 }

/** Carte détaillée OpenTopoMap : tuiles topographiques (réseau, repli sur le
 *  cache IndexedDB), marqueurs gîte / visites / voiture, zoom.
 *  Hors-ligne, l'écran retombe sur la carte simplifiée `<Carte>` + bandeau.
 *  Note : les tuiles proviennent d'OpenTopoMap — sans réseau, seuls les
 *  marqueurs et le cadre s'affichent. */
export default {
  title: 'Écrans/CarteDetaillee',
  component: CarteDetaillee,
  tags: ['autodocs'],
  args: {
    sx: s,
    visits: VISITS_INITIAL,
    gite,
    carSpot,
    savedIds: [1, 5, 8],
    // ratings : map { [visitId]: { stars, note } } — une note > 0 = visite faite.
    ratings: { 6: { stars: 5, note: 'Superbe' }, 8: { stars: 4, note: '' } },
    // Props relayées à <Carte> par le repli hors-ligne.
    findCar: () => {},
    openDetailed: () => {},
  },
  argTypes: {
    sx: { table: { disable: true } },
    findCar: { table: { disable: true } },
    openDetailed: { table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}

export const SansVoiture = { name: 'Sans position voiture', args: { carSpot: null } }
