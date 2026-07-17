/**
 * Carte détaillée à tuiles OpenTopoMap, **sans dépendance** (ni Leaflet ni
 * clé API). Projection Web Mercator « slippy map » : on calcule le zoom qui
 * fait tenir tous les points, la grille de tuiles couvrant le viewport, et la
 * position en pixels de chaque marqueur. Les tuiles sont chargées à la demande
 * (uniquement à l'ouverture de la vue détaillée) → l'app reste autonome.
 */

const DEG = Math.PI / 180
export const TILE_SIZE = 256

/** Sous-domaines OpenTopoMap (répartition de charge). */
const SUBDOMAINS = ['a', 'b', 'c']

/** URL d'une tuile OpenTopoMap. z/x/y = coordonnées de tuile entières. */
export function tileUrl(x, y, z) {
  const s = SUBDOMAINS[(x + y) % SUBDOMAINS.length]
  return `https://${s}.tile.opentopomap.org/${z}/${x}/${y}.png`
}

/** Attribution obligatoire OpenTopoMap / OpenStreetMap. */
export const OSM_ATTRIBUTION = '© OpenTopoMap (CC-BY-SA) · données © OpenStreetMap'

/** Longitude → coordonnée de tuile fractionnaire au zoom z. */
export function lngToTileX(lng, z) {
  return (lng + 180) / 360 * 2 ** z
}

/** Latitude → coordonnée de tuile fractionnaire au zoom z (Web Mercator). */
export function latToTileY(lat, z) {
  const s = Math.sin(lat * DEG)
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 2 ** z
}

function bounds(points) {
  const pts = (points || []).filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng))
  if (!pts.length) return null
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
  for (const p of pts) {
    minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat)
    minLng = Math.min(minLng, p.lng); maxLng = Math.max(maxLng, p.lng)
  }
  return { minLat, maxLat, minLng, maxLng }
}

/**
 * Plus grand zoom (entre minZoom et maxZoom) pour lequel l'emprise des points
 * tient dans width×height (avec marge `pad`). Un seul point → maxZoom.
 */
export function chooseZoom(b, width, height, { pad = 40, minZoom = 3, maxZoom = 15 } = {}) {
  if (!b) return minZoom
  const innerW = Math.max(width - 2 * pad, 1)
  const innerH = Math.max(height - 2 * pad, 1)
  for (let z = maxZoom; z >= minZoom; z--) {
    const spanX = Math.abs(lngToTileX(b.maxLng, z) - lngToTileX(b.minLng, z)) * TILE_SIZE
    const spanY = Math.abs(latToTileY(b.minLat, z) - latToTileY(b.maxLat, z)) * TILE_SIZE
    if (spanX <= innerW && spanY <= innerH) return z
  }
  return minZoom
}

/**
 * Construit le plan de rendu de la carte à tuiles pour un viewport width×height :
 * - `z` : zoom choisi,
 * - `tiles` : tuiles à afficher `{ x, y, z, left, top }` (px dans le viewport),
 * - `project({lat,lng})` : position pixel d'un point,
 * - `attribution` : texte à afficher.
 * Retourne null si aucun point valide.
 */
export function buildTileMap(points, { width, height, pad = 40, minZoom = 3, maxZoom = 15, zoom } = {}) {
  const b = bounds(points)
  if (!b) return null
  // Zoom explicite (boutons +/−) borné, sinon auto-fit de l'emprise.
  const z = Number.isFinite(zoom)
    ? Math.max(minZoom, Math.min(maxZoom, Math.round(zoom)))
    : chooseZoom(b, width, height, { pad, minZoom, maxZoom })

  // Centre de l'emprise en pixels-monde au zoom z.
  const centerX = (lngToTileX(b.minLng, z) + lngToTileX(b.maxLng, z)) / 2 * TILE_SIZE
  const centerY = (latToTileY(b.minLat, z) + latToTileY(b.maxLat, z)) / 2 * TILE_SIZE
  // Origine (coin haut-gauche du viewport) en pixels-monde.
  const originX = centerX - width / 2
  const originY = centerY - height / 2

  const project = ({ lat, lng }) => ({
    x: lngToTileX(lng, z) * TILE_SIZE - originX,
    y: latToTileY(lat, z) * TILE_SIZE - originY,
  })

  // Tuiles couvrant le viewport (une marge d'une tuile de chaque côté).
  const nTiles = 2 ** z
  const firstTileX = Math.floor(originX / TILE_SIZE)
  const firstTileY = Math.floor(originY / TILE_SIZE)
  const lastTileX = Math.floor((originX + width) / TILE_SIZE)
  const lastTileY = Math.floor((originY + height) / TILE_SIZE)

  const tiles = []
  for (let tx = firstTileX; tx <= lastTileX; tx++) {
    for (let ty = firstTileY; ty <= lastTileY; ty++) {
      if (ty < 0 || ty >= nTiles) continue // pas de tuile hors des pôles
      const wrappedX = ((tx % nTiles) + nTiles) % nTiles // longitude cyclique
      tiles.push({
        x: wrappedX,
        y: ty,
        z,
        left: tx * TILE_SIZE - originX,
        top: ty * TILE_SIZE - originY,
      })
    }
  }

  return { z, tiles, project, attribution: OSM_ATTRIBUTION }
}
