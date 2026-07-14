import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Budget } from '../screens/Budget.jsx'
import { s, eur } from '../utils.js'

const baseProps = {
  sx: s, eur, catColor: () => '#4a5d3a', remain: 100, budgetTotal: 200,
  spentPct: 20, spent: 40, setNewBudgetTotal: () => {}, setShowBudgetTotalEdit: () => {},
  setShowAdd: () => {}, budgetCats: [], sortExpenses: 'date', setSortExpenses: () => {},
  startEditExpense: () => {}, deleteExpense: () => {},
}

describe('Budget — panneau Comptes (partage des dépenses)', () => {
  it('masqué sans membres ou sans dépense attribuée', () => {
    render(<Budget {...baseProps} expenses={[{ label: 'Glaces', cat: 'Nourriture', amt: 12 }]} familyMembers={[]} />)
    expect(screen.queryByTestId('comptes')).toBeNull()
  })

  it('affiche soldes et remboursement minimal', () => {
    render(
      <Budget
        {...baseProps}
        familyMembers={['Papa', 'Maman']}
        expenses={[{ label: 'Courses', cat: 'Nourriture', amt: 40, paidBy: 'Papa' }]}
      />,
    )
    expect(screen.getByTestId('comptes')).toBeInTheDocument()
    // Papa a payé 40 pour 2 → +20 ; Maman -20 → Maman doit 20 € à Papa.
    const transfers = screen.getAllByTestId('comptes-transfer')
    expect(transfers).toHaveLength(1)
    expect(transfers[0]).toHaveTextContent('Maman')
    expect(transfers[0]).toHaveTextContent('Papa')
    expect(transfers[0]).toHaveTextContent('20')
  })

  it('affiche « tout est équilibré » quand les comptes sont à zéro', () => {
    render(
      <Budget
        {...baseProps}
        familyMembers={['Papa', 'Maman']}
        expenses={[
          { label: 'A', cat: 'x', amt: 20, paidBy: 'Papa' },
          { label: 'B', cat: 'x', amt: 20, paidBy: 'Maman' },
        ]}
      />,
    )
    expect(screen.getByTestId('comptes-balanced')).toBeInTheDocument()
  })

  it('affiche le payeur sur la ligne de dépense', () => {
    render(
      <Budget
        {...baseProps}
        familyMembers={['Papa', 'Maman']}
        expenses={[{ label: 'Essence', cat: 'Transport', amt: 50, paidBy: 'Maman' }]}
      />,
    )
    expect(screen.getByText(/payé par Maman/)).toBeInTheDocument()
  })
})
