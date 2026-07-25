import { Meteo } from './Meteo.jsx'
import { s, fmtDayShort } from '../utils.js'
import { METEO_INITIAL, TRIP_INITIAL } from '../data.js'

/** Écran Météo : prévisions par jour du séjour (éditable). */
export default {
  title: 'Écrans/Meteo',
  component: Meteo,
  tags: ['autodocs'],
  args: { sx: s, meteo: METEO_INITIAL, trip: TRIP_INITIAL, fmtDayShort, editMeteo: () => {}, deleteMeteo: () => {}, openAddMeteo: () => {} },
  argTypes: { sx: { table: { disable: true } }, fmtDayShort: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
