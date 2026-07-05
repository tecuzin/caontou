import { describe, it, expect } from 'vitest'
import { runSelfTests } from '../selftest.js'

// jsdom ne fournit pas window.localStorage par défaut dans cet environnement
// de test (voir App.test.jsx) — même mock minimal ici.
if (!window.localStorage) {
  const store = {}
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => { store[k] = String(v) },
      removeItem: (k) => { delete store[k] },
      clear: () => { for (const k in store) delete store[k] },
    },
  })
}

describe('runSelfTests()', () => {
  it('retourne un tableau non vide de résultats', () => {
    const results = runSelfTests()
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThan(5)
  })

  it('chaque résultat a un nom, un statut pass et un détail', () => {
    const results = runSelfTests()
    for (const r of results) {
      expect(typeof r.name).toBe('string')
      expect(typeof r.pass).toBe('boolean')
      expect(typeof r.detail).toBe('string')
    }
  })

  it('tous les checks passent sur le code actuel (régression)', () => {
    const results = runSelfTests()
    const failed = results.filter((r) => !r.pass)
    expect(failed).toEqual([])
  })
})
