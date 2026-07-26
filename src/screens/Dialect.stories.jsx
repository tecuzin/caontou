import { Dialect } from './Dialect.jsx'
import { s } from '../utils.js'

/** Écran Mini-lexique auvergnat : flashcards mot → sens pour enfants, sourcées. */
export default {
  title: 'Écrans/Lexique auvergnat',
  component: Dialect,
  tags: ['autodocs'],
  args: { sx: s },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
