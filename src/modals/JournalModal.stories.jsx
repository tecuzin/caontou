import { JournalModal } from './JournalModal.jsx'
import { s } from '../utils.js'

/** Journal de bord d'une journée : humeur (emoji), récit du jour (saisi ou dicté
 *  via la Web Speech API), moment préféré et phrase du jour. */
export default {
  title: 'Modals/JournalModal',
  component: JournalModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    dayLabel: 'Sam 8 août — Cascade du Faillitoux',
    entry: {
      mood: '😊',
      text: 'On est montés au Plomb du Cantal en télécabine, vue à 360°. Pique-nique au sommet, les enfants ont adoré.',
      best: 'la cascade du Pas de Cère',
      quote: '« encore la cascade ! »',
    },
    updateEntry: () => {},
    onShare: () => {},
    canShare: true,
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const JourneeVide = {
  name: 'Journée vide · partage indisponible',
  args: { entry: {}, canShare: false },
}
