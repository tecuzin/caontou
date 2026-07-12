import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'

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

/** Ouvre un lien externe (Maps/navigateur) : `_system` sur natif, `_blank` sur web. */
export function openExternal(href) {
  if (!href) return
  try { window.open(href, Capacitor.isNativePlatform() ? '_system' : '_blank') } catch { }
}

/** Lien Google Maps vers des coordonnées « lat,lng ». */
export function mapsCoordsHref(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) return null
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

/**
 * Récupère la position actuelle et résout un lien Google Maps vers les
 * coordonnées. Sur Android/iOS : plugin @capacitor/geolocation (permissions +
 * GPS gérés nativement — `navigator.geolocation` n'est pas fiable dans la
 * WebView). Sur web : `navigator.geolocation` en secours. Rejette si refusé.
 */
export async function currentPositionMapsHref() {
  if (Capacitor.isNativePlatform()) {
    const perm = await Geolocation.requestPermissions()
    if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
      throw new Error('Autorisation de localisation refusée')
    }
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })
    return mapsCoordsHref(pos.coords.latitude, pos.coords.longitude)
  }
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
