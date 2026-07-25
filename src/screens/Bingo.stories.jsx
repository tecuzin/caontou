import { Bingo } from './Bingo.jsx'
import { s } from '../utils.js'
import { BINGO_CANTAL } from '../data.js'

/** Écran Bingo du Cantal : grille 4×4 à cocher pour les enfants (lignes complètes = 🎉). */
export default {
  title: 'Écrans/Bingo',
  component: Bingo,
  tags: ['autodocs'],
  args: { sx: s, items: BINGO_CANTAL, checked: { 0: true, 1: true, 5: true }, toggleBingo: () => {} },
  argTypes: { sx: { table: { disable: true } }, toggleBingo: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const Vierge = { name: 'Grille vierge', args: { checked: {} } }
