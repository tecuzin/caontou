import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Heights } from '../screens/Heights.jsx'
import { s } from '../utils.js'

const HEIGHTS = [
  { id: 1, name: 'Tom', cm: 102, date: '2026-08-01' },
  { id: 2, name: 'Tom', cm: 104.5, date: '2026-08-06' },
  { id: 3, name: 'Alice', cm: 130, date: '2026-08-02' },
]

function setup(overrides = {}) {
  const props = { sx: s, heights: HEIGHTS, onAdd: vi.fn(), onRemove: vi.fn(), ...overrides }
  render(<Heights {...props} />)
  return props
}

describe('Écran Toise de vacances', () => {
  it('affiche un état vide quand il n\'y a aucune mesure', () => {
    setup({ heights: [] })
    expect(screen.getByTestId('screen-heights')).toBeInTheDocument()
    expect(screen.getByTestId('heights-empty')).toBeInTheDocument()
  })

  it('groupe les mesures par enfant, triées par prénom puis par date', () => {
    setup()
    expect(screen.queryByTestId('heights-empty')).not.toBeInTheDocument()
    expect(screen.getByTestId('height-child-Alice')).toBeInTheDocument()
    expect(screen.getByTestId('height-child-Tom')).toBeInTheDocument()
    const rows = screen.getAllByTestId(/^height-row-/)
    expect(rows).toHaveLength(3)
    // Alice (1 mesure) avant Tom (2 mesures), Tom trié du plus ancien au plus récent
    expect(rows.map((r) => r.textContent)).toEqual([
      expect.stringContaining('2026-08-02'),
      expect.stringContaining('2026-08-01'),
      expect.stringContaining('2026-08-06'),
    ])
  })

  it('affiche la croissance depuis la première mesure', () => {
    setup()
    expect(screen.getByTestId('height-growth-Tom')).toHaveTextContent('+2.5 cm')
    expect(screen.getByTestId('height-growth-Alice')).toHaveTextContent('Première mesure')
  })

  it('appelle onAdd avec le prénom, les cm (nombre) et la date', async () => {
    const user = userEvent.setup()
    const p = setup({ heights: [] })
    await user.type(screen.getByTestId('height-name'), '  Zoé  ')
    await user.type(screen.getByTestId('height-cm'), '118.5')
    const date = screen.getByTestId('height-date')
    expect(date).toHaveAttribute('type', 'date')
    await user.clear(date)
    await user.type(date, '2026-08-04')
    await user.click(screen.getByTestId('height-add'))
    expect(p.onAdd).toHaveBeenCalledWith({ name: 'Zoé', cm: 118.5, date: '2026-08-04' })
  })

  it('n\'appelle pas onAdd si le prénom ou la taille manque', async () => {
    const user = userEvent.setup()
    const p = setup({ heights: [] })
    await user.click(screen.getByTestId('height-add'))
    expect(p.onAdd).not.toHaveBeenCalled()
    await user.type(screen.getByTestId('height-name'), 'Tom')
    await user.click(screen.getByTestId('height-add'))
    expect(p.onAdd).not.toHaveBeenCalled()
  })

  it('vide le champ des cm après un ajout (prénom conservé)', async () => {
    const user = userEvent.setup()
    setup({ heights: [] })
    await user.type(screen.getByTestId('height-name'), 'Tom')
    await user.type(screen.getByTestId('height-cm'), '100')
    await user.click(screen.getByTestId('height-add'))
    expect(screen.getByTestId('height-cm')).toHaveValue(null)
    expect(screen.getByTestId('height-name')).toHaveValue('Tom')
  })

  it('supprime une mesure', async () => {
    const user = userEvent.setup()
    const p = setup()
    await user.click(screen.getByTestId('height-del-2'))
    expect(p.onRemove).toHaveBeenCalledWith(2)
  })

  it('ne plante pas sans callbacks', async () => {
    const user = userEvent.setup()
    render(<Heights sx={s} heights={HEIGHTS} />)
    await user.click(screen.getByTestId('height-del-1'))
    expect(screen.getByTestId('screen-heights')).toBeInTheDocument()
  })
})
