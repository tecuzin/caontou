import { Itinerary } from './Itinerary.jsx'
import { s } from '../utils.js'
import { VISITS_INITIAL } from '../data.js'

/** Écran Itinéraire du jour : on coche des sorties, l'app les ordonne par
 *  proximité depuis le gîte et ouvre l'itinéraire dans Maps. */
export default {
  title: 'Écrans/Itinerary',
  component: Itinerary,
  tags: ['autodocs'],
  args: { sx: s, visits: VISITS_INITIAL, saved: { 1: true, 4: true, 5: true }, openMaps: () => {} },
  argTypes: { sx: { table: { disable: true } }, openMaps: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
