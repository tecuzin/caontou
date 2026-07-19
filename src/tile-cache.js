/**
 * Pré-chargement des tuiles OpenTopoMap autour du gîte pour un usage **hors-ligne**
 * de la carte détaillée. Les tuiles sont stockées en IndexedDB (quota large,
 * persistant) puis servies en `objectURL` quand le réseau est absent.
 *
 * `tilesAround` est pure et testable ; les fonctions IndexedDB/fetch sont
 * tolérantes aux environnements sans navigateur (renvoient des valeurs neutres).
 */
import { lngToTileX, latToTileY, tileUrl } from './osm.js'

/**
 * Liste des tuiles {x,y,z} dans un carré de `radius` tuiles autour d'un point,
 * pour chaque niveau de zoom demandé. Bornée aux indices valides (0…2^z-1).
 */
export function tilesAround(lat, lng, zooms = [12, 13, 14], radius = 2) {
  const out = []
  for (const z of zooms) {
    const cx = Math.floor(lngToTileX(lng, z))
    const cy = Math.floor(latToTileY(lat, z))
    const max = 2 ** z
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = cx + dx, y = cy + dy
        if (x >= 0 && y >= 0 && x < max && y < max) out.push({ x, y, z })
      }
    }
  }
  return out
}

const DB_NAME = 'cantou-tiles'
const STORE = 'tiles'

function openDB() {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null)
    let req
    try { req = indexedDB.open(DB_NAME, 1) } catch { return resolve(null) }
    req.onupgradeneeded = () => { try { req.result.createObjectStore(STORE) } catch { /* déjà là */ } }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
}

function idbPut(url, blob) {
  return openDB().then((db) => new Promise((resolve) => {
    if (!db) return resolve(false)
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, url)
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => resolve(false)
  }))
}

function idbGet(url) {
  return openDB().then((db) => new Promise((resolve) => {
    if (!db) return resolve(null)
    const tx = db.transaction(STORE, 'readonly')
    const rq = tx.objectStore(STORE).get(url)
    rq.onsuccess = () => resolve(rq.result || null)
    rq.onerror = () => resolve(null)
  }))
}

/** Nombre de tuiles déjà en cache (0 si IndexedDB indisponible). */
export function countCachedTiles() {
  return openDB().then((db) => new Promise((resolve) => {
    if (!db) return resolve(0)
    const tx = db.transaction(STORE, 'readonly')
    const rq = tx.objectStore(STORE).count()
    rq.onsuccess = () => resolve(rq.result || 0)
    rq.onerror = () => resolve(0)
  }))
}

/**
 * Télécharge et met en cache les tuiles fournies (celles déjà présentes sont
 * ignorées). `onProgress(done, total)` est appelé au fil de l'eau. Renvoie le
 * nombre de tuiles disponibles en cache à la fin.
 */
export async function prefetchTiles(tiles, onProgress = () => {}) {
  let done = 0
  for (const t of tiles) {
    const url = tileUrl(t.x, t.y, t.z)
    try {
      const existing = await idbGet(url)
      if (!existing) {
        const res = await fetch(url)
        if (res && res.ok) await idbPut(url, await res.blob())
      }
    } catch { /* tuile ignorée */ }
    onProgress(++done, tiles.length)
  }
  return countCachedTiles()
}

/** URL objet d'une tuile mise en cache, ou null si absente. */
export async function cachedTileObjectURL(url) {
  const blob = await idbGet(url)
  return blob && typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(blob) : null
}
