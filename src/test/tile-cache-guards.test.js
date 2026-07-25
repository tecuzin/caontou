import { describe, it, expect, vi, afterEach } from 'vitest'
import { prefetchTiles, countCachedTiles, cachedTileObjectURL } from '../tile-cache.js'

/*
 * Garde de robustesse : la base peut s'ouvrir alors que l'object store est
 * absent (upgrade partiellement échoué). `db.transaction()` / `objectStore()`
 * lèvent alors de façon SYNCHRONE. Le contrat du module est de toujours
 * dégrader vers une valeur neutre — jamais de faire échouer l'appelant.
 */

/** IndexedDB qui s'ouvre correctement mais dont toute transaction lève. */
function stubBrokenStore() {
  const db = {
    createObjectStore: vi.fn(),
    transaction: vi.fn(() => { throw new DOMException('object store absent', 'NotFoundError') }),
  }
  vi.stubGlobal('indexedDB', {
    open: vi.fn(() => {
      const req = { result: db }
      queueMicrotask(() => { req.onupgradeneeded?.(); req.onsuccess?.() })
      return req
    }),
  })
  return db
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('tile-cache — object store absent : dégrader, ne pas rejeter', () => {
  it('countCachedTiles() renvoie 0 au lieu de rejeter', async () => {
    stubBrokenStore()
    await expect(countCachedTiles()).resolves.toBe(0)
  })

  it('cachedTileObjectURL() renvoie null au lieu de rejeter', async () => {
    stubBrokenStore()
    await expect(cachedTileObjectURL('https://x/1/2/3.png')).resolves.toBeNull()
  })

  it('prefetchTiles() se termine proprement (le total final ne rejette pas)', async () => {
    stubBrokenStore()
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, blob: async () => new Blob(['x']) })))
    const onProgress = vi.fn()
    // Sans la garde, le `return countCachedTiles()` final propageait le rejet.
    await expect(prefetchTiles([{ x: 1, y: 2, z: 14 }], onProgress)).resolves.toBe(0)
    expect(onProgress).toHaveBeenCalledWith(1, 1) // la boucle a bien progressé
  })
})
