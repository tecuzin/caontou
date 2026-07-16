import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { groupPhotosByDay } from '../photos.js'
import { Budget } from '../screens/Budget.jsx'
import { s, eur } from '../utils.js'

const days = [{ dow: 'Mer', num: 5, title: 'Arrivée' }]

describe('photos — les reçus ne polluent pas la galerie', () => {
  it('exclut kind:receipt du regroupement', () => {
    const photos = [
      { id: 'a', day: 'Mer 5' },
      { id: 'r', day: 'Mer 5', kind: 'receipt' },
    ]
    const groups = groupPhotosByDay(photos, days)
    const ids = groups.flatMap((g) => g.photos.map((p) => p.id))
    expect(ids).toContain('a')
    expect(ids).not.toContain('r')
  })
})

describe('Budget — reçu photo attaché', () => {
  const baseProps = {
    sx: s, eur, catColor: () => '#4a5d3a', remain: 100, budgetTotal: 200, spentPct: 20, spent: 40,
    setNewBudgetTotal: () => {}, setShowBudgetTotalEdit: () => {}, setShowAdd: () => {}, budgetCats: [],
    sortExpenses: 'date', setSortExpenses: () => {}, startEditExpense: () => {}, deleteExpense: () => {},
    familyMembers: [],
  }

  it('affiche la vignette du reçu et l\'ouvre en plein écran', async () => {
    const user = userEvent.setup()
    render(
      <Budget
        {...baseProps}
        expenses={[{ label: 'Musée', cat: 'Sorties', amt: 24, receiptId: 'rc1' }]}
        srcMap={{ rc1: 'data:image/jpeg;base64,AAAA' }}
        loadSrc={vi.fn()}
      />,
    )
    const thumb = screen.getByTestId('receipt-thumb-rc1')
    expect(thumb).toBeInTheDocument()
    await user.click(thumb)
    expect(screen.getByTestId('receipt-viewer')).toBeInTheDocument()
  })

  it('charge la source du reçu si absente', () => {
    const loadSrc = vi.fn()
    render(
      <Budget {...baseProps} expenses={[{ label: 'X', cat: 'Y', amt: 5, receiptId: 'zz' }]} srcMap={{}} loadSrc={loadSrc} />,
    )
    expect(loadSrc).toHaveBeenCalledWith(expect.objectContaining({ id: 'zz' }))
  })

  it('pas de vignette sans reçu', () => {
    render(<Budget {...baseProps} expenses={[{ label: 'X', cat: 'Y', amt: 5 }]} srcMap={{}} loadSrc={vi.fn()} />)
    expect(screen.queryByTestId('receipt-viewer')).toBeNull()
    expect(document.querySelector('[data-testid^="receipt-thumb"]')).toBeNull()
  })
})
