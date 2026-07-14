import { describe, it, expect } from 'vitest'
import { isCheckoutWindow, DEPARTURE_INITIAL } from '../departure.js'

describe('isCheckoutWindow', () => {
  const end = '2026-08-15'
  it('vrai le jour du retour', () => {
    expect(isCheckoutWindow(end, new Date(2026, 7, 15, 9))).toBe(true)
  })
  it('vrai la veille du retour', () => {
    expect(isCheckoutWindow(end, new Date(2026, 7, 14, 20))).toBe(true)
  })
  it('faux deux jours avant', () => {
    expect(isCheckoutWindow(end, new Date(2026, 7, 13, 12))).toBe(false)
  })
  it('faux après le retour', () => {
    expect(isCheckoutWindow(end, new Date(2026, 7, 16, 8))).toBe(false)
  })
  it('faux sans date de retour', () => {
    expect(isCheckoutWindow('', new Date())).toBe(false)
  })
})

describe('DEPARTURE_INITIAL', () => {
  it('items par défaut non cochés, avec id/label/emoji', () => {
    expect(DEPARTURE_INITIAL.length).toBeGreaterThanOrEqual(6)
    for (const i of DEPARTURE_INITIAL) {
      expect(i).toMatchObject({ done: false })
      expect(typeof i.label).toBe('string')
      expect(typeof i.id).toBe('number')
    }
  })
})
