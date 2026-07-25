import { Sejours } from './Sejours.jsx'
import { s, fmtDayShort, fmtMonthYear } from '../utils.js'
import { TRIP_INITIAL } from '../data.js'

/** Écran « Mes séjours » : voyage courant, export/import de config, remise à zéro. */
export default {
  title: 'Écrans/Sejours',
  component: Sejours,
  tags: ['autodocs'],
  args: {
    sx: s, trip: TRIP_INITIAL, fmtDayShort, fmtMonthYear,
    currentStoreData: () => ({ trip: TRIP_INITIAL }), resetToDefaults: () => {},
  },
  argTypes: { sx: { table: { disable: true } }, fmtDayShort: { table: { disable: true } }, fmtMonthYear: { table: { disable: true } }, currentStoreData: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
