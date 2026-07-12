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

beforeEach(() => { localStorageMock.clear() })

describe('Bingo du Cantal (UI)', () => {
  it('s\'ouvre depuis l\'accueil, coche une case et la persiste', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-open-bingo'))
    expect(await screen.findByTestId('screen-bingo')).toBeInTheDocument()
    expect(screen.getByTestId('bingo-lines')).toHaveTextContent('0/10')

    await user.click(screen.getByTestId('bingo-cell-0'))
    const stored = JSON.parse(window.localStorage.getItem('cantou.v1'))
    expect(stored.bingo['0']).toBe(true)
  })

  it('complète une rangée et met à jour le compteur de lignes', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-open-bingo'))
    await screen.findByTestId('screen-bingo')
    for (const i of [0, 1, 2, 3]) await user.click(screen.getByTestId(`bingo-cell-${i}`))
    expect(screen.getByTestId('bingo-lines')).toHaveTextContent('1/10')
  })
})
