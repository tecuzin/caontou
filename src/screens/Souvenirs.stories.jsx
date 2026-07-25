import { Souvenirs } from './Souvenirs.jsx'
import { s } from '../utils.js'
import { DAYS_INITIAL, TRIP_INITIAL } from '../data.js'

/** Écran Souvenirs : galerie photo regroupée par jour, journal, partage d'album. */
export default {
  title: 'Écrans/Souvenirs',
  component: Souvenirs,
  tags: ['autodocs'],
  args: {
    sx: s, photos: [], days: DAYS_INITIAL, srcMap: {}, journal: {}, trip: TRIP_INITIAL,
    capturePhoto: () => {}, deletePhoto: () => {}, loadSrc: () => {}, shareDay: () => {}, openDayJournal: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const Vide = { name: 'Aucune photo' }
