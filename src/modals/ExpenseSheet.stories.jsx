import { ExpenseSheet } from './ExpenseSheet.jsx'
import { s } from '../utils.js'

const cats = [
  { name: 'Hébergement', color: '#9c6b4a' },
  { name: 'Transport', color: '#4f8a86' },
  { name: 'Nourriture', color: '#cf7d3c' },
  { name: 'Sorties', color: '#5b7042' },
]

/** Feuille dépense (ajout ou édition) : montant, libellé, catégorie, payeur
 *  (si des membres de la famille sont définis) et reçu photo optionnel. */
export default {
  title: 'Modals/ExpenseSheet',
  component: ExpenseSheet,
  tags: ['autodocs'],
  args: {
    sx: s,
    isEdit: false,
    cats,
    amount: '12,50',
    setAmount: () => {},
    label: 'Glaces à Vic-sur-Cère',
    setLabel: () => {},
    cat: 'Nourriture',
    setCat: () => {},
    familyMembers: [],
    paidBy: '',
    setPaidBy: () => {},
    receiptId: '',
    setReceiptId: () => {},
    onCaptureReceipt: () => {},
    onClose: () => {},
    onSubmit: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const Ajout = { name: 'Nouvelle dépense' }
export const AvecFamilleEtRecu = {
  name: 'Édition · payeur + reçu attaché',
  args: {
    isEdit: true,
    familyMembers: ['David', 'Marie', 'Lina'],
    paidBy: 'Marie',
    receiptId: 'receipt-001',
  },
}
