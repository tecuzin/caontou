import { describe, it, expect } from 'vitest'
import { tilesAround, prefetchTiles, countCachedTiles } from '../tile-cache.js'
import { lngToTileX, latToTileY } from '../osm.js'

const LAT = 44.827, LNG = 2.566 // gîte

describe('tilesAround', () => {
  it('renvoie un carré (2r+1)² par zoom, centré sur le point', () => {
    const tiles = tilesAround(LAT, LNG, [13], 2)
    expect(tiles).toHaveLength(25) // (2*2+1)^2
    const cx = Math.floor(lngToTileX(LNG, 13))
    const cy = Math.floor(latToTileY(LAT, 13))
    expect(tiles.some((t) => t.x === cx && t.y === cy && t.z === 13)).toBe(true)
    expect(tiles.every((t) => Math.abs(t.x - cx) <= 2 && Math.abs(t.y - cy) <= 2)).toBe(true)
  })

  it('cumule plusieurs zooms', () => {
    expect(tilesAround(LAT, LNG, [12, 13, 14], 1)).toHaveLength(9 * 3)
  })

  it('borne les indices aux valeurs valides (0…2^z-1)', () => {
    // près du coin (lat/lng extrêmes) les indices restent >= 0
    const tiles = tilesAround(85, -179, [2], 3)
    expect(tiles.every((t) => t.x >= 0 && t.y >= 0 && t.x < 4 && t.y < 4)).toBe(true)
  })
})

describe('prefetch/count sans IndexedDB (jsdom)', () => {
  it('dégradent proprement (aucune tuile, pas d\'erreur)', async () => {
    expect(await countCachedTiles()).toBe(0)
    const n = await prefetchTiles([{ x: 1, y: 1, z: 12 }])
    expect(n).toBe(0) // pas d'IndexedDB → rien mis en cache
  })
})
