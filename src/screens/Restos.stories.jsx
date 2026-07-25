import { Restos } from './Restos.jsx'
import { s } from '../utils.js'
import { RESTOS_INITIAL } from '../data.js'

/** Écran Restos : carnet d'adresses & réservations (📞 appeler, 📍 Maps, 🚗 y aller). */
export default {
  title: 'Écrans/Restos',
  component: Restos,
  tags: ['autodocs'],
  args: { sx: s, restos: RESTOS_INITIAL, openAddResto: () => {}, openEditResto: () => {}, deleteResto: () => {} },
  argTypes: { sx: { table: { disable: true } }, openAddResto: { table: { disable: true } }, openEditResto: { table: { disable: true } }, deleteResto: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const Vide = { name: 'Aucune adresse', args: { restos: [] } }
