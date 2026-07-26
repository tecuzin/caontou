import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { makeUnlockChallenge } from '../kids-lock.js'

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

describe('Mode enfant — verrou bout en bout', () => {
  it('masque l’onglet Budget et affiche le bandeau une fois verrouillé', async () => {
    // Store semé : l'app démarre directement verrouillée.
    window.localStorage.setItem('cantou.v1', JSON.stringify({ kidsLock: true }))
    render(<App />)
    expect(screen.getByTestId('kids-lock-bar')).toBeInTheDocument()
    expect(screen.queryByTestId('tab-budget')).toBeNull()
    // les onglets de consultation restent
    expect(screen.getByTestId('tab-planning')).toBeInTheDocument()
  })

  it('ne déverrouille pas sur une mauvaise réponse, déverrouille sur la bonne', async () => {
    window.localStorage.setItem('cantou.v1', JSON.stringify({ kidsLock: true }))
    const user = userEvent.setup()
    render(<App />)
    const bar = screen.getByTestId('kids-lock-bar')

    // La question est du type « Combien font A × B ? » — on lit les facteurs.
    const question = bar.textContent.match(/(\d+)\s*×\s*(\d+)/)
    expect(question).toBeTruthy()
    const good = Number(question[1]) * Number(question[2])

    const input = bar.querySelector('input')
    await user.type(input, String(good + 1))
    await user.click(bar.querySelector('button'))
    expect(screen.getByTestId('kids-lock-bar')).toBeInTheDocument() // toujours verrouillé
    expect(screen.queryByTestId('tab-budget')).toBeNull()

    await user.clear(input)
    await user.type(input, String(good))
    await user.click(bar.querySelector('button'))
    expect(screen.queryByTestId('kids-lock-bar')).toBeNull()
    expect(screen.getByTestId('tab-budget')).toBeInTheDocument() // Budget revenu
  })

  it('le défi est déterministe pour une graine donnée', () => {
    expect(makeUnlockChallenge(42)).toEqual(makeUnlockChallenge(42))
  })
})
