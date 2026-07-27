import { Heights } from './Heights.jsx'
import { s } from '../utils.js'

/** Écran « Toise de vacances » : mesures horodatées des enfants, groupées par
 *  prénom avec la croissance depuis la première mesure. */
export default {
  title: 'Écrans/Heights',
  component: Heights,
  tags: ['autodocs'],
  args: { sx: s, onAdd: () => {}, onRemove: () => {} },
  argTypes: { sx: { table: { disable: true } }, onAdd: { table: { disable: true } }, onRemove: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const Vide = { name: 'Aucune mesure', args: { heights: [] } }
export const AvecMesures = {
  name: 'Deux enfants suivis',
  args: {
    heights: [
      { id: 1, name: 'Léa', cm: 104, date: '2026-08-05' },
      { id: 2, name: 'Léa', cm: 106, date: '2026-08-14' },
      { id: 3, name: 'Tom', cm: 92, date: '2026-08-05' },
    ],
  },
}
