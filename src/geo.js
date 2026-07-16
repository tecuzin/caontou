/**
 * Projection géographique pour la carte schématique du séjour (100 % hors-ligne).
 * À l'échelle d'un département, une projection équirectangulaire suffit : on
 * corrige la longitude par cos(latitude de référence) pour garder un rapport
 * d'aspect réaliste (1° de longitude ≈ cos(lat) × 1° de latitude au sol).
 */

const DEG = Math.PI / 180

/** True si le point a des coordonnées numériques exploitables. */
export function hasCoords(p) {
  return !!p && typeof p.lat === 'number' && typeof p.lng === 'number' &&
    Number.isFinite(p.lat) && Number.isFinite(p.lng)
}

/** Bornes { minLat, maxLat, minLng, maxLng } des points, ou null si aucun. */
export function geoBounds(points) {
  const pts = (points || []).filter(hasCoords)
  if (!pts.length) return null
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
  for (const p of pts) {
    if (p.lat < minLat) minLat = p.lat
    if (p.lat > maxLat) maxLat = p.lat
    if (p.lng < minLng) minLng = p.lng
    if (p.lng > maxLng) maxLng = p.lng
  }
  return { minLat, maxLat, minLng, maxLng }
}

/**
 * Construit un projecteur points { lat, lng } → { x, y } (pixels) dans un
 * viewport width×height, avec une marge `pad`. Nord en haut (y croît vers le
 * bas), échelle uniforme, contenu centré. Si tous les points sont confondus
 * (ou un seul), tout est projeté au centre du viewport.
 *
 * @returns { bounds, project } — `bounds` est null si aucun point valide.
 */
export function makeProjector(points, { width, height, pad = 24 } = {}) {
  const cx = width / 2, cy = height / 2
  const bounds = geoBounds(points)
  if (!bounds) return { bounds: null, project: () => ({ x: cx, y: cy }) }

  const { minLat, maxLat, minLng, maxLng } = bounds
  const midLat = (minLat + maxLat) / 2
  const cosLat = Math.cos(midLat * DEG) || 1
  const spanX = (maxLng - minLng) * cosLat
  const spanY = maxLat - minLat

  // Un seul point (ou tous confondus) : pas d'étendue → centrer.
  if (spanX <= 0 && spanY <= 0) return { bounds, project: () => ({ x: cx, y: cy }) }

  const innerW = Math.max(width - 2 * pad, 1)
  const innerH = Math.max(height - 2 * pad, 1)
  const scale = Math.min(
    spanX > 0 ? innerW / spanX : Infinity,
    spanY > 0 ? innerH / spanY : Infinity,
  )
  const usedW = spanX * scale
  const usedH = spanY * scale
  const offX = (width - usedW) / 2
  const offY = (height - usedH) / 2

  const project = ({ lat, lng }) => ({
    x: offX + (lng - minLng) * cosLat * scale,
    y: offY + (maxLat - lat) * scale, // le point le plus au nord (maxLat) est en haut
  })
  return { bounds, project }
}
