import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'Notification', {
  value: class { static permission = 'denied'; static requestPermission = vi.fn().mockResolvedValue('denied') },
  writable: true,
})

beforeEach(() => { localStorageMock.clear() })

describe('Vote familial (UI, pass-and-play)', () => {
  it('déroule un vote complet et ajoute la gagnante au planning', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-visites'))
    await user.click(screen.getByTestId('btn-open-vote'))

    // Setup : les visites ♥ par défaut pré-remplissent déjà les candidats ;
    // il suffit d'ajouter un votant.
    await user.type(screen.getByTestId('vote-new-voter'), 'Lina')
    await user.click(screen.getByTestId('vote-add-voter'))
    expect(screen.getByTestId('vote-start')).not.toBeDisabled()
    await user.click(screen.getByTestId('vote-start'))

    // Voting : un seul votant → un pick suffit
    expect(screen.getByTestId('vote-current-voter')).toHaveTextContent('Lina')
    const picks = screen.getAllByTestId(/^vote-pick-/)
    const winnerId = picks[0].getAttribute('data-testid').replace('vote-pick-', '')
    await user.click(picks[0])

    // Result : gagnante affichée, ajout au planning
    expect(screen.getByTestId('vote-winner')).toBeInTheDocument()
    await user.click(screen.getByTestId('vote-add-planning'))

    // Le vote a persisté le membre de famille
    const stored = JSON.parse(window.localStorage.getItem('cantou.v1'))
    expect(stored.familyMembers).toContain('Lina')
  })

  it('empêche de commencer sans au moins 2 candidats et 1 votant', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-visites'))
    await user.click(screen.getByTestId('btn-open-vote'))
    expect(screen.getByTestId('vote-start')).toBeDisabled()
  })
})
