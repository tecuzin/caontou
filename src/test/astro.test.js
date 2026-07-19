import { describe, it, expect } from 'vitest'
import { sunTimes, moonPhase } from '../astro.js'

const LAT = 44.827, LNG = 2.566 // Vezels-Roussy (gîte)
const hUTC = (d) => d.getUTCHours() + d.getUTCMinutes() / 60

describe('sunTimes', () => {
  it('lever avant coucher, valeurs plausibles pour le Cantal', () => {
    const { sunrise, sunset } = sunTimes(new Date('2026-06-21T12:00:00Z'), LAT, LNG)
    expect(sunrise).toBeInstanceOf(Date)
    expect(sunset).toBeInstanceOf(Date)
    expect(sunrise.getTime()).toBeLessThan(sunset.getTime())
    // solstice d'été : lever ~04:03 UTC, coucher ~19:39 UTC (± quelques minutes)
    expect(hUTC(sunrise)).toBeCloseTo(4.05, 1)
    expect(hUTC(sunset)).toBeCloseTo(19.65, 1)
  })

  it('jour plus long en été qu\'en hiver', () => {
    const summer = sunTimes(new Date('2026-06-21T12:00:00Z'), LAT, LNG)
    const winter = sunTimes(new Date('2026-12-21T12:00:00Z'), LAT, LNG)
    const len = (s) => s.sunset.getTime() - s.sunrise.getTime()
    expect(len(summer)).toBeGreaterThan(len(winter))
    // hiver : lever plus tard, coucher plus tôt
    expect(hUTC(winter.sunrise)).toBeGreaterThan(hUTC(summer.sunrise))
    expect(hUTC(winter.sunset)).toBeLessThan(hUTC(summer.sunset))
  })

  it('renvoie null au pôle Nord en hiver (nuit polaire)', () => {
    const { sunrise } = sunTimes(new Date('2026-12-21T12:00:00Z'), 89, 0)
    expect(sunrise).toBeNull()
  })
})

describe('moonPhase', () => {
  it('nouvelle lune à l\'époque de référence', () => {
    const m = moonPhase(new Date('2000-01-06T18:14:00Z'))
    expect(m.fraction).toBeCloseTo(0, 2)
    expect(m.illumination).toBeCloseTo(0, 2)
    expect(m.name).toBe('Nouvelle lune')
  })

  it('reconnaît une nouvelle et une pleine lune connues', () => {
    expect(moonPhase(new Date('2024-01-11T11:57:00Z')).name).toBe('Nouvelle lune')
    const full = moonPhase(new Date('2024-01-25T17:54:00Z'))
    expect(full.name).toBe('Pleine lune')
    expect(full.illumination).toBeGreaterThan(0.98)
  })

  it('fraction et illumination bornées 0..1', () => {
    for (let i = 0; i < 30; i++) {
      const m = moonPhase(new Date(Date.UTC(2026, 6, 1 + i)))
      expect(m.fraction).toBeGreaterThanOrEqual(0)
      expect(m.fraction).toBeLessThan(1)
      expect(m.illumination).toBeGreaterThanOrEqual(0)
      expect(m.illumination).toBeLessThanOrEqual(1)
      expect(m.emoji).toMatch(/🌑|🌒|🌓|🌔|🌕|🌖|🌗|🌘/)
    }
  })
})
