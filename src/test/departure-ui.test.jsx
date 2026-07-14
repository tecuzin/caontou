import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Departure } from '../screens/Departure.jsx'
import { s } from '../utils.js'

function setup(overrides = {}) {
  const props = {
    sx: s,
    departure: [
      { id: 1, emoji: '🔑', label: 'Clés rendues', done: false },
      { id: 2, emoji: '🧊', label: 'Frigo vidé', done: true },
    ],
    toggleDeparture: vi.fn(),
    addDepartureItem: vi.fn(),
    removeDepartureItem: vi.fn(),
    ...overrides,
  }
  render(<Departure {...props} />)
  return props
}

describe('Écran Départ du gîte', () => {
  it('affiche les items et la progression (1/2 = 50 %)', () => {
    setup()
    expect(screen.getByTestId('screen-departure')).toBeInTheDocument()
    expect(screen.getAllByTestId('departure-item')).toHaveLength(2)
    expect(screen.getByTestId('departure-pct')).toHaveTextContent('50 %')
  })

  it('coche un item', async () => {
    const user = userEvent.setup()
    const p = setup()
    await user.click(screen.getByLabelText('Cocher Clés rendues'))
    expect(p.toggleDeparture).toHaveBeenCalledWith(1)
  })

  it('ajoute un point via le champ (Enter)', async () => {
    const user = userEvent.setup()
    const p = setup()
    await user.type(screen.getByTestId('departure-new'), 'Vérifier le barbecue{Enter}')
    expect(p.addDepartureItem).toHaveBeenCalledWith('Vérifier le barbecue')
  })

  it('n\'ajoute pas une entrée vide', async () => {
    const user = userEvent.setup()
    const p = setup()
    await user.click(screen.getByTestId('departure-add'))
    expect(p.addDepartureItem).not.toHaveBeenCalled()
  })

  it('supprime un item', async () => {
    const user = userEvent.setup()
    const p = setup()
    await user.click(screen.getByLabelText('Supprimer Frigo vidé'))
    expect(p.removeDepartureItem).toHaveBeenCalledWith(2)
  })
})
