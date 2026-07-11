import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { CHANGELOG } from '../changelog.js'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
    _seed: (obj) => { store['cantou.v1'] = JSON.stringify(obj) },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'Notification', {
  value: class { static permission = 'denied'; static requestPermission = vi.fn().mockResolvedValue('denied') },
  writable: true,
})

beforeEach(() => { localStorageMock.clear() })

describe('« Quoi de neuf ? » au lancement', () => {
  it('ne s\'affiche PAS sur une première install (store vide)', () => {
    render(<App />)
    expect(screen.queryByTestId('btn-whatsnew-ok')).not.toBeInTheDocument()
    // et cale lastSeenBuild sur le build courant
    const stored = JSON.parse(window.localStorage.getItem('cantou.v1'))
    expect(stored.lastSeenBuild).toBeGreaterThanOrEqual(0)
  })

  it('s\'affiche pour un utilisateur venant d\'un build plus ancien', async () => {
    const user = userEvent.setup()
    localStorageMock._seed({ lastSeenBuild: 1 }) // très ancien → nouveautés à montrer
    render(<App />)
    expect(screen.getByTestId('btn-whatsnew-ok')).toBeInTheDocument()
    expect(screen.getByText('🆕 Quoi de neuf ?')).toBeInTheDocument()
    await user.click(screen.getByTestId('btn-whatsnew-ok'))
    expect(screen.queryByTestId('btn-whatsnew-ok')).not.toBeInTheDocument()
    // build vu mémorisé (plus de re-affichage)
    const stored = JSON.parse(window.localStorage.getItem('cantou.v1'))
    expect(stored.lastSeenBuild).toBeGreaterThan(1)
  })

  it('la page Historique liste tous les builds du changelog', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-open-historique'))
    expect(screen.getByTestId('screen-historique')).toBeInTheDocument()
    for (const e of CHANGELOG) {
      expect(screen.getByTestId(`changelog-${e.build}`)).toBeInTheDocument()
    }
  })
})
