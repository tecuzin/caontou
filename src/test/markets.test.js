import { describe, it, expect } from 'vitest'
import { MARKETS, MARKETS_DISCLAIMER } from '../markets.js'

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0

describe('MARKETS — forme des données', () => {
  it('expose au moins un marché', () => {
    expect(Array.isArray(MARKETS)).toBe(true)
    expect(MARKETS.length).toBeGreaterThan(0)
  })

  it.each(MARKETS.map((m) => [m.town, m]))(
    '« %s » a ville, jours, horaires et distance non vides',
    (_town, m) => {
      expect(isNonEmptyString(m.town)).toBe(true)
      expect(isNonEmptyString(m.days)).toBe(true)
      expect(isNonEmptyString(m.hours)).toBe(true)
      expect(isNonEmptyString(m.dist)).toBe(true)
    },
  )

  it.each(MARKETS.map((m) => [m.town, m]))(
    '« %s » a des coordonnées finies et plausibles pour le Cantal',
    (_town, m) => {
      expect(Number.isFinite(m.lat)).toBe(true)
      expect(Number.isFinite(m.lng)).toBe(true)
      // Cantal : latitude ~44–46, longitude ~2–3
      expect(m.lat).toBeGreaterThanOrEqual(44)
      expect(m.lat).toBeLessThanOrEqual(46)
      expect(m.lng).toBeGreaterThanOrEqual(2)
      expect(m.lng).toBeLessThanOrEqual(3)
    },
  )

  it('a une note descriptive non vide pour chaque marché', () => {
    for (const m of MARKETS) expect(isNonEmptyString(m.note)).toBe(true)
  })

  it('n’a pas de ville en double', () => {
    const towns = MARKETS.map((m) => m.town)
    expect(new Set(towns).size).toBe(towns.length)
  })

  it('n’a pas de coordonnées en double (chaque marché a son point)', () => {
    const points = MARKETS.map((m) => `${m.lat},${m.lng}`)
    expect(new Set(points).size).toBe(points.length)
  })
})

describe('MARKETS_DISCLAIMER', () => {
  it('est une chaîne non vide (horaires indicatifs)', () => {
    expect(isNonEmptyString(MARKETS_DISCLAIMER)).toBe(true)
  })
})
