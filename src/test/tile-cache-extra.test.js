import { describe, it, expect, vi, afterEach } from 'vitest'
import { tilesAround, prefetchTiles, countCachedTiles, cachedTileObjectURL } from '../tile-cache.js'
import { tileUrl, lngToTileX, latToTileY } from '../osm.js'

/*
 * IndexedDB et fetch n'existent pas en jsdom : on les simule (store en mémoire)
 * pour couvrir la logique de pré-chargement hors-ligne sans I/O réelle.
 */

const LAT = 44.827, LNG = 2.566 // gîte (Vezels-Roussy)

/** Faux IndexedDB minimal : un seul object store, tout en mémoire. */
function fakeIndexedDB({ store = new Map(), failOpen = false, throwOpen = false, failRequests = false } = {}) {
  const createObjectStore = vi.fn()
  const db = {
    createObjectStore,
    transaction: vi.fn(() => {
      const tx = {}
      const os = {
        put: (value, key) => {
          if (failRequests) queueMicrotask(() => tx.onerror?.())
          else { store.set(key, value); queueMicrotask(() => tx.oncomplete?.()) }
          return {}
        },
        get: (key) => {
          const rq = {}
          queueMicrotask(() => {
            if (failRequests) return rq.onerror?.()
            rq.result = store.get(key)
            rq.onsuccess?.()
          })
          return rq
        },
        count: () => {
          const rq = {}
          queueMicrotask(() => {
            if (failRequests) return rq.onerror?.()
            rq.result = store.size
            rq.onsuccess?.()
          })
          return rq
        },
      }
      tx.objectStore = vi.fn(() => os)
      return tx
    }),
  }
  const open = vi.fn(() => {
    if (throwOpen) throw new Error('SecurityError: IndexedDB bloqué')
    const req = { result: db }
    queueMicrotask(() => {
      if (failOpen) return req.onerror?.()
      req.onupgradeneeded?.()
      req.onsuccess?.()
    })
    return req
  })
  vi.stubGlobal('indexedDB', { open })
  return { store, open, db, createObjectStore }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('tilesAround() — logique pure de sélection des tuiles', () => {
  it('produit des clés de tuiles cohérentes avec la projection OSM', () => {
    const [t] = tilesAround(LAT, LNG, [14], 0)
    expect(t).toEqual({ x: Math.floor(lngToTileX(LNG, 14)), y: Math.floor(latToTileY(LAT, 14)), z: 14 })
    expect(tileUrl(t.x, t.y, t.z)).toMatch(/^https:\/\/[abc]\.tile\.opentopomap\.org\/14\/\d+\/\d+\.png$/)
  })

  it('radius 0 → une seule tuile par zoom', () => {
    expect(tilesAround(LAT, LNG, [12, 13, 14], 0)).toHaveLength(3)
  })

  it('liste vide si aucun zoom demandé', () => {
    expect(tilesAround(LAT, LNG, [], 2)).toEqual([])
  })

  it('ne produit aucun doublon de clé x/y/z', () => {
    const tiles = tilesAround(LAT, LNG, [12, 13], 2)
    const keys = new Set(tiles.map((t) => `${t.z}/${t.x}/${t.y}`))
    expect(keys.size).toBe(tiles.length)
  })

  it('écrête au bord du monde au lieu de sortir des bornes (zoom 1)', () => {
    const tiles = tilesAround(-85, 179, [1], 3)
    expect(tiles.length).toBeGreaterThan(0)
    expect(tiles.every((t) => t.x >= 0 && t.y >= 0 && t.x < 2 && t.y < 2)).toBe(true)
  })

  it('des zooms plus profonds donnent des index de tuile plus grands', () => {
    const [a] = tilesAround(LAT, LNG, [10], 0)
    const [b] = tilesAround(LAT, LNG, [14], 0)
    expect(b.x).toBeGreaterThan(a.x)
    expect(b.y).toBeGreaterThan(a.y)
  })
})

describe('countCachedTiles()', () => {
  it('compte les entrées présentes dans le store', async () => {
    fakeIndexedDB({ store: new Map([['u1', 'b1'], ['u2', 'b2']]) })
    expect(await countCachedTiles()).toBe(2)
  })

  it('renvoie 0 si IndexedDB refuse d\'ouvrir la base', async () => {
    fakeIndexedDB({ failOpen: true })
    expect(await countCachedTiles()).toBe(0)
  })

  it('renvoie 0 si indexedDB.open lève (mode privé)', async () => {
    fakeIndexedDB({ throwOpen: true })
    expect(await countCachedTiles()).toBe(0)
  })

  it('renvoie 0 si la requête de comptage échoue', async () => {
    fakeIndexedDB({ failRequests: true })
    expect(await countCachedTiles()).toBe(0)
  })
})

describe('prefetchTiles()', () => {
  it('télécharge chaque tuile absente et la range sous son URL de tuile', async () => {
    const { store } = fakeIndexedDB()
    const blob = { size: 10 }
    const fetchMock = vi.fn(async () => ({ ok: true, blob: async () => blob }))
    vi.stubGlobal('fetch', fetchMock)

    const tiles = tilesAround(LAT, LNG, [13], 1) // 9 tuiles
    const n = await prefetchTiles(tiles)

    expect(fetchMock).toHaveBeenCalledTimes(9)
    expect(fetchMock).toHaveBeenCalledWith(tileUrl(tiles[0].x, tiles[0].y, tiles[0].z))
    expect(store.size).toBe(9)
    expect(store.get(tileUrl(tiles[0].x, tiles[0].y, tiles[0].z))).toBe(blob)
    expect(n).toBe(9)
  })

  it('appelle onProgress(done, total) pour chaque tuile, dans l\'ordre', async () => {
    fakeIndexedDB()
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, blob: async () => ({}) })))
    const progress = []
    await prefetchTiles([{ x: 1, y: 1, z: 12 }, { x: 2, y: 1, z: 12 }], (done, total) => progress.push([done, total]))
    expect(progress).toEqual([[1, 2], [2, 2]])
  })

  it('ignore les tuiles déjà en cache (pas de fetch)', async () => {
    const url = tileUrl(1, 1, 12)
    const { store } = fakeIndexedDB({ store: new Map([[url, 'déjà là']]) })
    const fetchMock = vi.fn(async () => ({ ok: true, blob: async () => ({}) }))
    vi.stubGlobal('fetch', fetchMock)

    await prefetchTiles([{ x: 1, y: 1, z: 12 }])

    expect(fetchMock).not.toHaveBeenCalled()
    expect(store.get(url)).toBe('déjà là')
  })

  it('n\'enregistre rien si la réponse HTTP n\'est pas ok', async () => {
    const { store } = fakeIndexedDB()
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    const n = await prefetchTiles([{ x: 1, y: 1, z: 12 }])
    expect(store.size).toBe(0)
    expect(n).toBe(0)
  })

  it('poursuit malgré une tuile en erreur réseau (hors ligne partiel)', async () => {
    const { store } = fakeIndexedDB()
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ ok: true, blob: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)
    const progress = []

    const n = await prefetchTiles([{ x: 1, y: 1, z: 12 }, { x: 2, y: 1, z: 12 }], (d) => progress.push(d))

    expect(progress).toEqual([1, 2])
    expect(store.size).toBe(1)
    expect(n).toBe(1)
  })

  it('ne fait rien sur une liste vide', async () => {
    fakeIndexedDB()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await prefetchTiles([])).toBe(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('cachedTileObjectURL()', () => {
  it('renvoie un objectURL quand la tuile est en cache', async () => {
    const url = tileUrl(3, 4, 12)
    fakeIndexedDB({ store: new Map([[url, { size: 1 }]]) })
    const createObjectURL = vi.fn(() => 'blob:tuile')
    vi.stubGlobal('URL', { ...URL, createObjectURL })

    await expect(cachedTileObjectURL(url)).resolves.toBe('blob:tuile')
    expect(createObjectURL).toHaveBeenCalledWith({ size: 1 })
  })

  it('renvoie null quand la tuile est absente', async () => {
    fakeIndexedDB()
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:x') })
    await expect(cachedTileObjectURL(tileUrl(9, 9, 12))).resolves.toBeNull()
  })

  it('renvoie null sans IndexedDB', async () => {
    vi.stubGlobal('indexedDB', undefined)
    await expect(cachedTileObjectURL(tileUrl(1, 1, 12))).resolves.toBeNull()
  })
})
