import { describe, it, expect } from 'vitest'
import { hasCoords, geoBounds, makeProjector } from '../geo.js'

describe('hasCoords', () => {
  it('accepte des coordonnées numériques finies', () => {
    expect(hasCoords({ lat: 44.8, lng: 2.5 })).toBe(true)
  })
  it('rejette null, NaN, non-numérique', () => {
    expect(hasCoords(null)).toBe(false)
    expect(hasCoords({ lat: 44.8 })).toBe(false)
    expect(hasCoords({ lat: NaN, lng: 2 })).toBe(false)
    expect(hasCoords({ lat: '44', lng: '2' })).toBe(false)
  })
})

describe('geoBounds', () => {
  it('null si aucun point valide', () => {
    expect(geoBounds([])).toBeNull()
    expect(geoBounds([{ name: 'sans coords' }])).toBeNull()
  })
  it('calcule les bornes et ignore les points sans coords', () => {
    const b = geoBounds([{ lat: 44, lng: 2 }, { lat: 45, lng: 3 }, { foo: 1 }])
    expect(b).toEqual({ minLat: 44, maxLat: 45, minLng: 2, maxLng: 3 })
  })
})

describe('makeProjector', () => {
  const viewport = { width: 300, height: 400, pad: 20 }

  it('projette tout au centre si un seul point', () => {
    const { project, bounds } = makeProjector([{ lat: 44.8, lng: 2.5 }], viewport)
    expect(bounds).not.toBeNull()
    expect(project({ lat: 44.8, lng: 2.5 })).toEqual({ x: 150, y: 200 })
  })

  it('centre le viewport quand aucun point', () => {
    const { project, bounds } = makeProjector([], viewport)
    expect(bounds).toBeNull()
    expect(project({ lat: 0, lng: 0 })).toEqual({ x: 150, y: 200 })
  })

  it('met le nord en haut et l\'est à droite', () => {
    const pts = [{ lat: 44.5, lng: 2.0 }, { lat: 45.0, lng: 2.8 }]
    const { project } = makeProjector(pts, viewport)
    const south = project(pts[0])
    const north = project(pts[1])
    expect(north.y).toBeLessThan(south.y)   // plus au nord → plus haut (y plus petit)
    expect(north.x).toBeGreaterThan(south.x) // plus à l'est → plus à droite
  })

  it('garde tous les points dans le viewport (marge incluse)', () => {
    const pts = [
      { lat: 44.79, lng: 2.22 }, { lat: 45.28, lng: 2.75 }, { lat: 44.85, lng: 2.58 },
    ]
    const { project } = makeProjector(pts, viewport)
    for (const p of pts) {
      const { x, y } = project(p)
      expect(x).toBeGreaterThanOrEqual(20 - 1e-6)
      expect(x).toBeLessThanOrEqual(280 + 1e-6)
      expect(y).toBeGreaterThanOrEqual(20 - 1e-6)
      expect(y).toBeLessThanOrEqual(380 + 1e-6)
    }
  })

  it('applique une échelle uniforme (pas de déformation X/Y)', () => {
    // deux points séparés uniquement en latitude → x identique
    const pts = [{ lat: 44.5, lng: 2.5 }, { lat: 45.0, lng: 2.5 }]
    const { project } = makeProjector(pts, viewport)
    expect(project(pts[0]).x).toBeCloseTo(project(pts[1]).x, 6)
  })
})
