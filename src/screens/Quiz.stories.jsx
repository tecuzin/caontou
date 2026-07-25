import { Quiz } from './Quiz.jsx'
import { s } from '../utils.js'

/** Écran Quiz du Carladès : flashcards question → réponse pour enfants, score + record. */
export default {
  title: 'Écrans/Quiz',
  component: Quiz,
  tags: ['autodocs'],
  args: { sx: s },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
