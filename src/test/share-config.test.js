import { describe, it, expect, vi } from 'vitest'
import { buildSharePayload, encodeSharePayload, parseSharePayload, applySharedConfig } from '../share-config.js'

const store = {
  trip: { start: '2026-08-05', end: '2026-08-15', origin: 'Beauvais', etape: 'Laschamps', destination: 'Vezels-Roussy' },
  saved: { 1: true, 5: true, 9: false },
  budgetTotal: 1800,
  features: { tab_budget: false },
  expenses: [{ label: 'x', amt: 10 }], // ne doit PAS être partagé
  photos: [{ id: 'p1' }],
}

describe('buildSharePayload', () => {
  it('ne garde que le sous-ensemble compact (pas de photos/dépenses)', () => {
    const p = buildSharePayload(store)
    expect(p).toEqual({ t: store.trip, v: [1, 5], b: 1800, f: { tab_budget: false } })
    expect(p).not.toHaveProperty('expenses')
    expect(p).not.toHaveProperty('photos')
  })
})

describe('encode / parse round-trip', () => {
  it('reconstruit la config normalisée', () => {
    const { data, error } = parseSharePayload(encodeSharePayload(store))
    expect(error).toBe('')
    expect(data.trip.destination).toBe('Vezels-Roussy')
    expect(data.savedIds).toEqual([1, 5])
    expect(data.budgetTotal).toBe(1800)
    expect(data.features).toEqual({ tab_budget: false })
  })
  it('rejette du JSON étranger', () => {
    expect(parseSharePayload('{"foo":1}').error).toMatch(/config Cantou/)
  })
  it('rejette du texte illisible', () => {
    expect(parseSharePayload('pas du json').error).toMatch(/illisible/)
  })
  it('texte vide → pas d\'erreur, data null', () => {
    expect(parseSharePayload('   ')).toEqual({ data: null, error: '' })
  })
})

describe('applySharedConfig', () => {
  it('appelle les setters avec les valeurs reçues', () => {
    const setTrip = vi.fn(); const setSaved = vi.fn(); const setBudgetTotal = vi.fn(); const setFeatures = vi.fn()
    const { data } = parseSharePayload(encodeSharePayload(store))
    applySharedConfig(data, { setTrip, setSaved, setBudgetTotal, setFeatures })
    expect(setTrip).toHaveBeenCalledWith(store.trip)
    expect(setBudgetTotal).toHaveBeenCalledWith(1800)
    expect(setFeatures).toHaveBeenCalledWith({ tab_budget: false })
    expect(setSaved).toHaveBeenCalledWith({ 1: true, 5: true })
  })
  it('ignore proprement data null', () => {
    expect(() => applySharedConfig(null, {})).not.toThrow()
  })
})
