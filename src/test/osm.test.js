import { describe, it, expect } from 'vitest'
import { tileUrl, lngToTileX, latToTileY, chooseZoom, buildTileMap, TILE_SIZE, OSM_ATTRIBUTION } from '../osm.js'

describe('projection de tuiles Web Mercator', () => {
  it('lngToTileX : 0° au centre, ±180° aux bords', () => {
    expect(lngToTileX(-180, 1)).toBeCloseTo(0, 6)
    expect(lngToTileX(0, 1)).toBeCloseTo(1, 6)
    expect(lngToTileX(180, 1)).toBeCloseTo(2, 6)
  })
  it('latToTileY : équateur au centre, croît vers le sud', () => {
    expect(latToTileY(0, 1)).toBeCloseTo(1, 6)
    expect(latToTileY(60, 1)).toBeLessThan(1)   // nord = plus haut (y plus petit)
    expect(latToTileY(-60, 1)).toBeGreaterThan(1)
  })
})

describe('tileUrl', () => {
  it('produit une URL OpenTopoMap z/x/y valide', () => {
    expect(tileUrl(5, 3, 10)).toMatch(/^https:\/\/[abc]\.tile\.opentopomap\.org\/10\/5\/3\.png$/)
  })
})

describe('chooseZoom', () => {
  const cantal = { minLat: 44.79, maxLat: 45.28, minLng: 2.22, maxLng: 2.75 }
  it('choisit un zoom qui fait tenir l\'emprise dans le viewport', () => {
    const z = chooseZoom(cantal, 340, 430, { pad: 40 })
    const spanX = Math.abs(lngToTileX(cantal.maxLng, z) - lngToTileX(cantal.minLng, z)) * TILE_SIZE
    const spanY = Math.abs(latToTileY(cantal.minLat, z) - latToTileY(cantal.maxLat, z)) * TILE_SIZE
    expect(spanX).toBeLessThanOrEqual(340 - 80 + 1e-6)
    expect(spanY).toBeLessThanOrEqual(430 - 80 + 1e-6)
  })
  it('zoom plus grand pour une emprise plus petite', () => {
    const large = chooseZoom({ minLat: 44.8, maxLat: 45.3, minLng: 2.2, maxLng: 2.8 }, 340, 430)
    const small = chooseZoom({ minLat: 44.82, maxLat: 44.84, minLng: 2.56, maxLng: 2.58 }, 340, 430)
    expect(small).toBeGreaterThan(large)
  })
})

describe('buildTileMap', () => {
  const pts = [
    { lat: 44.827, lng: 2.566 }, { lat: 45.083, lng: 2.744 }, { lat: 45.279, lng: 2.660 },
  ]
  it('null sans point valide', () => {
    expect(buildTileMap([], { width: 340, height: 430 })).toBeNull()
  })
  it('projette les points dans le viewport et fournit des tuiles', () => {
    const m = buildTileMap(pts, { width: 340, height: 430, pad: 40 })
    expect(m.tiles.length).toBeGreaterThan(0)
    expect(m.attribution).toBe(OSM_ATTRIBUTION)
    for (const p of pts) {
      const { x, y } = m.project(p)
      expect(x).toBeGreaterThanOrEqual(-1)
      expect(x).toBeLessThanOrEqual(341)
      expect(y).toBeGreaterThanOrEqual(-1)
      expect(y).toBeLessThanOrEqual(431)
    }
  })
  it('les tuiles couvrent le viewport (coins inclus)', () => {
    const m = buildTileMap(pts, { width: 340, height: 430 })
    const coversTopLeft = m.tiles.some((t) => t.left <= 0 && t.top <= 0)
    const coversBottomRight = m.tiles.some((t) => t.left + TILE_SIZE >= 340 && t.top + TILE_SIZE >= 430)
    expect(coversTopLeft).toBe(true)
    expect(coversBottomRight).toBe(true)
  })
  it('centre l\'emprise (nord en haut)', () => {
    const m = buildTileMap(pts, { width: 340, height: 430 })
    const north = m.project({ lat: 45.279, lng: 2.660 })
    const south = m.project({ lat: 44.827, lng: 2.566 })
    expect(north.y).toBeLessThan(south.y)
  })
})
