import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from '../App.jsx'
import { STORE_KEYS } from '../backup.js'

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

describe('Complétude du store (tout est dans le JSON)', () => {
  it('le store persisté contient les données de référence désormais éditables', () => {
    render(<App />)
    const stored = JSON.parse(localStorageMock.getItem('cantou.v1'))
    expect(Array.isArray(stored.kidsGames)).toBe(true)
    expect(stored.kidsGames.length).toBeGreaterThan(0)
    expect(Array.isArray(stored.bingoItems)).toBe(true)
    expect(stored.bingoItems.length).toBeGreaterThan(0)
    expect(Array.isArray(stored.emergencyNumbers)).toBe(true)
    expect(stored.emergencyNumbers.length).toBeGreaterThan(0)
    expect(stored.features).toBeDefined()
  })

  it('aucune clé de STORE_KEYS pertinente ne manque au store persisté', () => {
    render(<App />)
    const stored = JSON.parse(localStorageMock.getItem('cantou.v1'))
    // Clés legacy tolérées (jamais réécrites) : trajetSteps (remplacé par trajets)
    const legacy = new Set(['trajetSteps'])
    for (const k of STORE_KEYS) {
      if (legacy.has(k)) continue
      expect(stored, `clé manquante: ${k}`).toHaveProperty(k)
    }
  })
})
