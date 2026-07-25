import { EditExpenseModal } from './EditExpenseModal.jsx'
import { s } from '../utils.js'

const cats = [
  { name: 'Hébergement', color: '#9c6b4a' },
  { name: 'Transport', color: '#4f8a86' },
  { name: 'Nourriture', color: '#cf7d3c' },
  { name: 'Sorties', color: '#5b7042' },
]
const expenses = [
  { label: 'Acompte gîte', cat: 'Hébergement', amt: 360 },
  { label: 'Courses Aurillac', cat: 'Nourriture', amt: 87.4 },
]

/** Feuille d'édition d'une dépense existante : libellé, catégorie, montant,
 *  avec suppression. Ne rend rien si `isOpen` est faux ou `editIdx` est `null`. */
export default {
  title: 'Modals/EditExpenseModal',
  component: EditExpenseModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    editIdx: 1,
    expenses,
    cats,
    editLabel: 'Courses Aurillac',
    setEditLabel: () => {},
    editCat: 'Nourriture',
    setEditCat: () => {},
    editAmt: '87.40',
    setEditAmt: () => {},
    darkMode: false,
    onClose: () => {},
    onSubmit: () => {},
    onDelete: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const MontantVide = { name: 'Montant vide', args: { editLabel: '', editAmt: '' } }
