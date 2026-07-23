import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Budget } from '../screens/Budget.jsx'
import { s, eur } from '../utils.js'

const baseProps = {
  sx: s, eur, catColor: () => '#4a5d3a', remain: 100, budgetTotal: 200,
  spentPct: 20, spent: 400, setNewBudgetTotal: () => {}, setShowBudgetTotalEdit: () => {},
  setShowAdd: () => {}, sortExpenses: 'date', setSortExpenses: () => {},
  startEditExpense: () => {}, deleteExpense: () => {}, expenses: [],
}

const budgetCats = [
  { name: 'Hébergement', color: '#9c6b4a', amt: 300, pct: 75 },
  { name: 'Transport', color: '#4f8a86', amt: 100, pct: 25 },
]

describe('Budget — donut « où part l’argent »', () => {
  it('affiche le donut avec un aria-label énumérant les catégories', () => {
    render(<Budget {...baseProps} budgetCats={budgetCats} />)
    const donut = screen.getByTestId('budget-donut')
    expect(donut).toBeInTheDocument()
    const svg = donut.querySelector('svg')
    expect(svg.getAttribute('aria-label')).toContain('Hébergement')
    expect(svg.getAttribute('aria-label')).toContain('75 %')
    expect(svg.getAttribute('aria-label')).toContain('Transport')
    // total dépensé au centre
    expect(donut).toHaveTextContent('DÉPENSÉ')
    // un arc coloré par catégorie (2) + le cercle de fond
    expect(svg.querySelectorAll('circle')).toHaveLength(3)
  })

  it('masque le donut sans dépense', () => {
    render(<Budget {...baseProps} budgetCats={[]} />)
    expect(screen.queryByTestId('budget-donut')).toBeNull()
  })
})
