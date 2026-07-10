import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'
import { TRIP_INITIAL } from '../data.js'

// localStorage mock (même pattern que App.test.jsx)
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
afterEach(() => { vi.useRealTimers() })

const setToday = (iso, h = 9) => {
  const [y, m, d] = iso.split('-').map(Number)
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date(y, m - 1, d, h, 0, 0))
}

describe('Mode « Jour J » (jour du départ)', () => {
  it('affiche la bannière du grand jour le matin du départ', () => {
    setToday(TRIP_INITIAL.start)
    render(<App />)
    expect(screen.getByTestId('jour-j-banner')).toBeInTheDocument()
    expect(screen.getByTestId('countdown-pill')).toHaveTextContent('Jour J')
    expect(screen.getByText(/C'EST LE GRAND JOUR/i)).toBeInTheDocument()
  })

  it('n\'affiche rien de spécial un jour ordinaire avant le départ', () => {
    setToday('2026-07-10')
    render(<App />)
    expect(screen.queryByTestId('jour-j-banner')).not.toBeInTheDocument()
    expect(screen.getByTestId('countdown-pill')).toHaveTextContent(/^J-\d+$/)
  })

  it('la bannière mène à la checklist du trajet', async () => {
    setToday(TRIP_INITIAL.start)
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Checklist avant de partir →'))
    expect(screen.getByTestId('sub-screen-wrapper')).toBeInTheDocument()
    expect(screen.getByText(/Avant de partir/)).toBeInTheDocument()
  })
})

describe('Compteur de vaches (jeu du trajet)', () => {
  it('incrémente chaque côté indépendamment et persiste', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Voir le trajet →'))
    await user.click(screen.getByTestId('btn-cow-left'))
    await user.click(screen.getByTestId('btn-cow-left'))
    await user.click(screen.getByTestId('btn-cow-right'))
    expect(screen.getByTestId('cow-count-left')).toHaveTextContent('2')
    expect(screen.getByTestId('cow-count-right')).toHaveTextContent('1')
    const stored = JSON.parse(window.localStorage.getItem('cantou.v1'))
    expect(stored.carGames).toEqual({ cowLeft: 2, cowRight: 1 })
  })

  it('remet les scores à zéro', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Voir le trajet →'))
    await user.click(screen.getByTestId('btn-cow-left'))
    await user.click(screen.getByTestId('btn-reset-cows'))
    expect(screen.getByTestId('cow-count-left')).toHaveTextContent('0')
  })
})

describe('Journal de bord (UI)', () => {
  it('saisit et persiste une entrée du jour', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-planning'))
    await user.click(screen.getByTestId('btn-journal'))
    await user.type(screen.getByTestId('journal-best'), 'la cascade')
    await user.click(screen.getByTestId('mood-😊'))
    const stored = JSON.parse(window.localStorage.getItem('cantou.v1'))
    const entries = Object.values(stored.journal)
    expect(entries[0].best).toBe('la cascade')
    expect(entries[0].mood).toBe('😊')
  })

  it('le partage est désactivé tant que le journal est vide', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-planning'))
    await user.click(screen.getByTestId('btn-journal'))
    expect(screen.getByTestId('btn-share-journal')).toBeDisabled()
  })
})

describe('Galerie souvenirs (navigation)', () => {
  it('ouvre le sous-écran Souvenirs depuis les modules de l\'accueil', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Souvenirs'))
    expect(screen.getByTestId('screen-souvenirs')).toBeInTheDocument()
    expect(screen.getByTestId('btn-take-photo')).toBeInTheDocument()
    expect(screen.getByTestId('btn-import-photo')).toBeInTheDocument()
  })
})
