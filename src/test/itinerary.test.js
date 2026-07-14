import { describe, it, expect } from 'vitest'
import { orderByProximity, routePlan, fmtMinutes, mapsDirectionsUrl } from '../itinerary.js'

const visits = [
  { id: 1, name: 'Puy Mary', dist: '1 h 10' },
  { id: 2, name: 'Rocher de Ronesque', dist: '15 min' },
  { id: 3, name: 'Pas de Cère', dist: '30 min' },
]

describe('orderByProximity', () => {
  it('ordonne du plus proche au plus loin (heures comprises)', () => {
    expect(orderByProximity(visits).map((v) => v.name)).toEqual([
      'Rocher de Ronesque', 'Pas de Cère', 'Puy Mary',
    ])
  })
  it('ne mute pas le tableau source', () => {
    const src = [...visits]
    orderByProximity(visits)
    expect(visits).toEqual(src)
  })
})

describe('routePlan', () => {
  it('calcule stops, plus lointaine et aller-retour', () => {
    const p = routePlan(visits)
    expect(p.stops).toBe(3)
    expect(p.farthestMin).toBe(70) // 1 h 10
    expect(p.roundTripMin).toBe(140)
    expect(p.ordered[0].name).toBe('Rocher de Ronesque')
  })
  it('sélection vide', () => {
    expect(routePlan([])).toMatchObject({ stops: 0, farthestMin: 0, roundTripMin: 0 })
  })
})

describe('fmtMinutes', () => {
  it('formate minutes et heures', () => {
    expect(fmtMinutes(45)).toBe('45 min')
    expect(fmtMinutes(60)).toBe('1 h')
    expect(fmtMinutes(70)).toBe('1 h 10')
    expect(fmtMinutes(0)).toBe('0 min')
  })
})

describe('mapsDirectionsUrl', () => {
  it('construit une URL directions avec waypoints ordonnés', () => {
    const url = mapsDirectionsUrl(visits)
    expect(url).toContain('https://www.google.com/maps/dir/?')
    expect(url).toContain('origin=Vezels-Roussy')
    expect(url).toContain('waypoints=')
    // ordre de proximité : Ronesque avant Puy Mary
    expect(url.indexOf('Ronesque')).toBeLessThan(url.indexOf('Puy'))
  })
  it('sans visite : pas de waypoints', () => {
    expect(mapsDirectionsUrl([])).not.toContain('waypoints=')
  })
})
