import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'

const store = {}
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { for (const k in store) delete store[k] },
  },
})
Object.defineProperty(window, 'Notification', {
  value: class { static permission = 'denied'; static requestPermission = vi.fn().mockResolvedValue('denied') },
  writable: true,
})
beforeEach(() => { for (const k in store) delete store[k] })

const read = () => JSON.parse(window.localStorage.getItem('cantou.v1'))

describe('Bingo par enfant — bout en bout', () => {
  it('la progression HISTORIQUE (forme plate) reste visible après migration', async () => {
    // Ancien store : schéma 4, grille plate, 2 cases cochées.
    window.localStorage.setItem('cantou.v1', JSON.stringify({
      schemaVersion: 4, bingo: { 0: true, 1: true },
    }))
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-open-bingo'))
    await screen.findByTestId('screen-bingo')
    // C'est LE point du ticket : la famille ne doit pas croire sa progression perdue.
    expect(screen.getByTestId('bingo-lines')).toHaveTextContent('0/10')
    expect(screen.getByText('✓ 2/16 cases')).toBeInTheDocument()
  })

  it('sépare la progression de deux enfants', async () => {
    window.localStorage.setItem('cantou.v1', JSON.stringify({ familyMembers: ['Léa', 'Tom'] }))
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-open-bingo'))
    await screen.findByTestId('screen-bingo')

    await user.click(screen.getByTestId('bingo-child-Léa'))
    await user.click(screen.getByTestId('bingo-cell-0'))
    expect(screen.getByText('✓ 1/16 cases')).toBeInTheDocument()

    // On bascule sur Tom : sa grille est vierge, celle de Léa est intacte.
    await user.click(screen.getByTestId('bingo-child-Tom'))
    expect(screen.getByText('✓ 0/16 cases')).toBeInTheDocument()
    await user.click(screen.getByTestId('bingo-cell-5'))
    expect(screen.getByText('✓ 1/16 cases')).toBeInTheDocument()

    await user.click(screen.getByTestId('bingo-child-Léa'))
    expect(screen.getByText('✓ 1/16 cases')).toBeInTheDocument()

    const stored = read()
    expect(stored.bingo['Léa']).toEqual({ 0: true })
    expect(stored.bingo['Tom']).toEqual({ 5: true })
  })
})
