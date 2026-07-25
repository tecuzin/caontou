import { NewLogiListModal } from './NewLogiListModal.jsx'
import { s } from '../utils.js'

/** Feuille « Nouvelle liste » de préparatifs : emoji + nom. */
export default {
  title: 'Modals/NewLogiListModal',
  component: NewLogiListModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    emoji: '🏖️',
    name: 'Sac de plage',
    setEmoji: () => {},
    setName: () => {},
    onSubmit: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const Vide = { name: 'Formulaire vierge', args: { emoji: '', name: '' } }
