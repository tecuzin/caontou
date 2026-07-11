import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import App from '../App.jsx'
import { EMERGENCY_NUMBERS } from '../data.js'

const localStorageMock = (() => {
  let store = {}
  return { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] }, clear: () => { store = {} } }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'Notification', {
  value: class { static permission = 'denied'; static requestPermission = vi.fn().mockResolvedValue('denied') },
  writable: true,
})

beforeEach(() => { localStorageMock.clear() })

describe('Urgences cliquables (Accueil)', () => {
  it('affiche chaque numéro d\'urgence avec un lien tel:', () => {
    render(<App />)
    const block = screen.getByTestId('emergency-block')
    for (const e of EMERGENCY_NUMBERS) {
      expect(within(block).getByText(e.label)).toBeInTheDocument()
    }
    const links = within(block).getAllByTestId('tel-link')
    expect(links).toHaveLength(EMERGENCY_NUMBERS.length)
    // le 112 pointe bien vers tel:112
    const cent12 = links.find((a) => a.getAttribute('href') === 'tel:112')
    expect(cent12).toBeTruthy()
  })

  it('propose le bouton « Ma position »', () => {
    render(<App />)
    expect(screen.getByTestId('btn-my-position')).toBeInTheDocument()
  })
})
