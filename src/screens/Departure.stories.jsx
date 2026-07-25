import { Departure } from './Departure.jsx'
import { s } from '../utils.js'
import { DEPARTURE_INITIAL } from '../departure.js'

/** Écran Départ du gîte : checklist des choses à faire avant de rendre les clés. */
export default {
  title: 'Écrans/Departure',
  component: Departure,
  tags: ['autodocs'],
  args: { sx: s, departure: DEPARTURE_INITIAL, toggleDeparture: () => {}, addDepartureItem: () => {}, removeDepartureItem: () => {} },
  argTypes: { sx: { table: { disable: true } }, toggleDeparture: { table: { disable: true } }, addDepartureItem: { table: { disable: true } }, removeDepartureItem: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
