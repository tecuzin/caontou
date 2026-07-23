import { describe, it, expect } from 'vitest'
import { composeHebMoment } from '../heb-datetime.js'

describe('composeHebMoment()', () => {
  it('compose date + heure + qualificatif (2026-08-05 = mercredi)', () => {
    expect(composeHebMoment('2026-08-05', '16:00', 'dès')).toBe('Mer 5 · dès 16:00')
    expect(composeHebMoment('2026-08-15', '10:00', 'avant')).toBe('Sam 15 · avant 10:00')
  })
  it('sans heure, ne renvoie que le jour', () => {
    expect(composeHebMoment('2026-08-05')).toBe('Mer 5')
  })
  it('sans qualificatif, garde juste l\'heure', () => {
    expect(composeHebMoment('2026-08-05', '16:00')).toBe('Mer 5 · 16:00')
  })
  it('renvoie "" si date absente ou invalide', () => {
    expect(composeHebMoment('')).toBe('')
    expect(composeHebMoment('pas-une-date', '16:00', 'dès')).toBe('')
  })
})
