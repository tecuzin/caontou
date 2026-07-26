import { Memory } from './Memory.jsx'
import { s } from '../utils.js'

/** Écran Mémory du Carladès : paires à retrouver, motifs repris du Bingo
 *  (aucune image externe). Partie autonome en état local. */
export default {
  title: 'Écrans/Memory',
  component: Memory,
  tags: ['autodocs'],
  args: { sx: s },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = { name: 'Partie standard (6 paires)' }
export const PartieCourte = { name: 'Partie courte (4 paires)', args: { pairs: 4 } }
