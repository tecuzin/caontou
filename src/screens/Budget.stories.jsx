import { Budget } from './Budget.jsx'
import { s, eur } from '../utils.js'

const budgetCats = [
  { name: 'Hébergement', color: '#9c6b4a', amt: 360, pct: 56 },
  { name: 'Transport', color: '#4f8a86', amt: 120, pct: 19 },
  { name: 'Nourriture', color: '#cf7d3c', amt: 160, pct: 25 },
]
const expenses = [
  { label: 'Acompte gîte', cat: 'Hébergement', amt: 360 },
  { label: 'Plein d’essence', cat: 'Transport', amt: 95 },
  { label: 'Courses Aurillac', cat: 'Nourriture', amt: 87.4 },
]

/** Écran Budget : restant, donut « où part l'argent », barres par catégorie,
 *  liste des dépenses (+ partage des comptes si plusieurs membres). */
export default {
  title: 'Écrans/Budget',
  component: Budget,
  tags: ['autodocs'],
  args: {
    sx: s, eur, catColor: () => '#4a5d3a', remain: 1160, budgetTotal: 1800, spentPct: 36, spent: 640,
    budgetCats, expenses, sortExpenses: 'amt', familyMembers: [],
    setNewBudgetTotal: () => {}, setShowBudgetTotalEdit: () => {}, setShowAdd: () => {},
    setSortExpenses: () => {}, startEditExpense: () => {}, deleteExpense: () => {},
  },
  argTypes: { sx: { table: { disable: true } }, eur: { table: { disable: true } }, catColor: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const BudgetPresqueEpuise = { name: 'Budget à 88 %', args: { spentPct: 88, spent: 1584, remain: 216 } }
