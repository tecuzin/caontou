import { NewCourseCatModal } from './NewCourseCatModal.jsx'
import { s } from '../utils.js'

/** Feuille « Nouvelle catégorie » de courses (nom seul, validation à Entrée). */
export default {
  title: 'Modals/NewCourseCatModal',
  component: NewCourseCatModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    name: 'Apéro',
    setName: () => {},
    onSubmit: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const Vide = { name: 'Formulaire vierge', args: { name: '' } }
