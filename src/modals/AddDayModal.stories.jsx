import { AddDayModal } from './AddDayModal.jsx'
import { s } from '../utils.js'

/** Feuille « Ajouter un jour » au planning : jour abrégé, numéro, titre, sous-titre. */
export default {
  title: 'Modals/AddDayModal',
  component: AddDayModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    dow: 'Dim',
    num: '9',
    title: 'Journée détente',
    sub: 'Au gré de l’envie',
    setDow: () => {},
    setNum: () => {},
    setTitle: () => {},
    setSub: () => {},
    onSubmit: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const Vide = { name: 'Formulaire vierge', args: { dow: '', num: '', title: '', sub: '' } }
