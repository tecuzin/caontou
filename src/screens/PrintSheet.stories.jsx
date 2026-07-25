import { PrintSheet } from './PrintSheet.jsx'
import { s } from '../utils.js'
import { DAYS_INITIAL, MEALS_INITIAL, VISITS_INITIAL, TRIP_INITIAL } from '../data.js'

/** Écran « Pense-bête imprimable » du jour : programme + repas + visites cochées,
 *  bouton d'impression, CSS @media print. */
export default {
  title: 'Écrans/PrintSheet',
  component: PrintSheet,
  tags: ['autodocs'],
  args: {
    sx: s, cur: DAYS_INITIAL[2], meals: MEALS_INITIAL, visits: VISITS_INITIAL,
    saved: { 1: true, 5: true }, trip: TRIP_INITIAL,
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
