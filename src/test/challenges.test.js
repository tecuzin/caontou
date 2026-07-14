import { describe, it, expect } from 'vitest'
import { CHALLENGES, dayKey, challengeOfDay } from '../challenges.js'

describe('dayKey', () => {
  it('formate en YYYY-MM-DD local', () => {
    expect(dayKey(new Date(2026, 7, 5))).toBe('2026-08-05')
    expect(dayKey(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('challengeOfDay', () => {
  it('déterministe : même jour → même défi', () => {
    expect(challengeOfDay('2026-08-07')).toEqual(challengeOfDay('2026-08-07'))
  })

  it('avance dans le pool de jour en jour', () => {
    const a = challengeOfDay('2026-08-07').idx
    const b = challengeOfDay('2026-08-08').idx
    expect(b).toBe((a + 1) % CHALLENGES.length)
  })

  it('renvoie un défi valide (emoji + label)', () => {
    const c = challengeOfDay('2026-08-10')
    expect(c).toHaveProperty('emoji')
    expect(typeof c.label).toBe('string')
    expect(c.idx).toBeGreaterThanOrEqual(0)
  })

  it('pool vide → null', () => {
    expect(challengeOfDay('2026-08-10', [])).toBeNull()
  })
})
