/**
 * Liens actionnables délégués à l'OS — brique transverse (restos, urgences,
 * hébergement, position). La génération des liens est 100 % offline ; seule
 * l'ouverture (composeur téléphone / Google Maps) est gérée par le système.
 */

/** `tel:` nettoyé : ne garde que chiffres et un éventuel « + » en tête. */
export function telHref(num) {
  const cleaned = String(num || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
  return cleaned ? `tel:${cleaned}` : null
}

/** Lien Google Maps de recherche pour une adresse libre ou des coordonnées. */
export function mapsHref(query) {
  const q = String(query || '').trim()
  if (!q) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

/** Lien Google Maps vers des coordonnées « lat,lng ». */
export function mapsCoordsHref(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) return null
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

/**
 * Récupère la position actuelle (navigator.geolocation, pas de plugin natif).
 * Résout un lien Google Maps vers les coordonnées, ou rejette si indisponible.
 */
export function currentPositionMapsHref() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Géolocalisation indisponible'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(mapsCoordsHref(pos.coords.latitude, pos.coords.longitude)),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    )
  })
}
