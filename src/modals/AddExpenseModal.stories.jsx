import { AddExpenseModal } from './AddExpenseModal.jsx'

const cats = [
  { name: 'Hébergement', color: '#9c6b4a' },
  { name: 'Transport', color: '#4f8a86' },
  { name: 'Nourriture', color: '#cf7d3c' },
  { name: 'Sorties', color: '#5b7042' },
]

/** Feuille « Ajouter une dépense » : libellé, catégorie, montant. */
export default {
  title: 'Modals/AddExpenseModal',
  component: AddExpenseModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    newLabel: 'Courses Aurillac',
    newCat: 'Nourriture',
    newAmt: '87.40',
    cats,
    darkMode: false,
    setNewLabel: () => {},
    setNewCat: () => {},
    setNewAmt: () => {},
    onSubmit: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const Vide = { name: 'Formulaire vierge', args: { newLabel: '', newAmt: '', newCat: 'Hébergement' } }
