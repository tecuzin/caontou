import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

beforeEach(() => localStorageMock.clear())

/** Ouvre Réglages, bascule une fonction par sa clé, puis revient à l'Accueil. */
async function toggleFeatureViaReglages(user, key) {
  await user.click(screen.getByTestId('module-sub:reglages'))
  await screen.findByTestId('screen-reglages')
  await user.click(screen.getByTestId(`reglage-row-${key}`).querySelector('[role="switch"]'))
  await user.click(screen.getByTestId('sub-back')) // ferme le sous-écran → retour Accueil
  await screen.findByTestId('screen-accueil')
}

describe('Fonctions désactivables — Réglages', () => {
  it('tout est visible par défaut', () => {
    render(<App />)
    expect(screen.getByTestId('tab-budget')).toBeInTheDocument()
    expect(screen.getByTestId('module-sub:carte')).toBeInTheDocument()
  })

  it('couper un onglet le retire de la barre du bas', async () => {
    const user = userEvent.setup()
    render(<App />)
    await toggleFeatureViaReglages(user, 'tab_budget')
    expect(screen.queryByTestId('tab-budget')).toBeNull()
    expect(screen.getByTestId('tab-accueil')).toBeInTheDocument() // accueil jamais coupé
  })

  it('réactiver un onglet le remet dans la barre', async () => {
    const user = userEvent.setup()
    render(<App />)
    await toggleFeatureViaReglages(user, 'tab_budget')
    expect(screen.queryByTestId('tab-budget')).toBeNull()
    await toggleFeatureViaReglages(user, 'tab_budget')
    expect(screen.getByTestId('tab-budget')).toBeInTheDocument()
  })

  it('couper un module le retire des tuiles de l\'Accueil', async () => {
    const user = userEvent.setup()
    render(<App />)
    await toggleFeatureViaReglages(user, 'mod_carte')
    expect(screen.queryByTestId('module-sub:carte')).toBeNull()
    expect(screen.getByTestId('module-sub:reglages')).toBeInTheDocument() // Réglages jamais coupé
  })

  it('le choix est persisté dans le store', async () => {
    const user = userEvent.setup()
    render(<App />)
    await toggleFeatureViaReglages(user, 'tab_repas')
    const stored = JSON.parse(localStorageMock.getItem('cantou.v1'))
    expect(stored.features.tab_repas).toBe(false)
  })
})
