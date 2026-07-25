import { Logistique } from './Logistique.jsx'
import { s, buildList } from '../utils.js'
import { LOGI_INITIAL } from '../data.js'

/** Écran Préparatifs : valises & checklists (cochables), tri, ajout/suppression. */
export default {
  title: 'Écrans/Logistique',
  component: Logistique,
  tags: ['autodocs'],
  args: {
    sx: s, logi: LOGI_INITIAL, logiSorted: false, checks: { ve: { 'Pulls chauds (montagne !)': true } }, buildList,
    setLogiSorted: () => {}, toggleCheck: () => {}, deleteLogiList: () => {}, deleteLogiItem: () => {},
    setEditingLogiKey: () => {}, setShowAddLogiItem: () => {}, setShowAddLogiList: () => {},
  },
  argTypes: { sx: { table: { disable: true } }, buildList: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
