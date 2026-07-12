import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { VISITS_INITIAL } from '../data.js'

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

const openVote = async (user) => {
  await user.click(screen.getByTestId('tab-visites'))
  await user.click(screen.getByTestId('btn-open-vote'))
}

describe('Vote familial (UI, pass-and-play)', () => {
  it('déroule un vote à 2 votants, désigne le VRAI gagnant et l\'ajoute au planning', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openVote(user)

    // 2 votants
    await user.type(screen.getByTestId('vote-new-voter'), 'Papa')
    await user.click(screen.getByTestId('vote-add-voter'))
    await user.type(screen.getByTestId('vote-new-voter'), 'Maman')
    await user.click(screen.getByTestId('vote-add-voter'))

    // Candidats : les visites ♥ par défaut (ids 1 et 5) sont pré-remplies.
    // On note l'id du 1er candidat proposé pour voter 2× dessus (gagnant net).
    await user.click(screen.getByTestId('vote-start'))
    const picks = screen.getAllByTestId(/^vote-pick-/)
    const winnerId = Number(picks[0].getAttribute('data-testid').replace('vote-pick-', ''))
    const expectedName = VISITS_INITIAL.find((v) => v.id === winnerId).name

    // Papa vote pour le 1er candidat
    await user.click(screen.getByTestId(`vote-pick-${winnerId}`))
    // Maman vote pour le même
    await user.click(screen.getByTestId(`vote-pick-${winnerId}`))

    // RÉSULTAT : le nom réel de la visite s'affiche (régression : c'était « — »
    // car pickWinner renvoyait une clé string ≠ id numérique de la visite).
    expect(screen.getByTestId('vote-winner')).toHaveTextContent(expectedName)

    // Jour cible par défaut = index 1 ; ajout au planning
    await user.click(screen.getByTestId('vote-add-planning'))

    const stored = JSON.parse(window.localStorage.getItem('cantou.v1'))
    const added = stored.days[1].items.find((it) => it.title === expectedName)
    expect(added).toBeDefined()
    expect(added.note).toContain('Choisi par la famille')
    expect(stored.familyMembers).toEqual(['Papa', 'Maman'])
  })

  it('respecte le choix de chaque votant (gagnant = majorité)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openVote(user)
    // 3 votants
    for (const n of ['A', 'B', 'C']) {
      await user.type(screen.getByTestId('vote-new-voter'), n)
      await user.click(screen.getByTestId('vote-add-voter'))
    }
    await user.click(screen.getByTestId('vote-start'))
    const picks = screen.getAllByTestId(/^vote-pick-/)
    const idA = Number(picks[0].getAttribute('data-testid').replace('vote-pick-', ''))
    const idB = Number(picks[1].getAttribute('data-testid').replace('vote-pick-', ''))
    const nameA = VISITS_INITIAL.find((v) => v.id === idA).name
    // 2 voix pour A, 1 pour B → A gagne
    await user.click(screen.getByTestId(`vote-pick-${idA}`))
    await user.click(screen.getByTestId(`vote-pick-${idB}`))
    await user.click(screen.getByTestId(`vote-pick-${idA}`))
    expect(screen.getByTestId('vote-winner')).toHaveTextContent(nameA)
  })

  it('empêche de commencer sans au moins 2 candidats et 1 votant', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openVote(user)
    expect(screen.getByTestId('vote-start')).toBeDisabled()
  })
})
