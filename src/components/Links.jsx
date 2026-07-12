import { telHref, mapsHref } from '../links.js'

/**
 * Liens actionnables réutilisables — délèguent à l'OS (composeur / Google Maps).
 * `sx` est le helper de style du projet ; `children` remplace le libellé par défaut.
 */

/** Numéro cliquable → ouvre l'app Téléphone. Rien si le numéro est vide. */
export function TelLink({ sx, num, children, style }) {
  const href = telHref(num)
  if (!href) return null
  return (
    <a data-testid="tel-link" href={href} style={sx(style || 'color:#4a5d3a;font-weight:700;text-decoration:none;')}>
      {children || `📞 ${num}`}
    </a>
  )
}

/** Lieu/adresse cliquable → ouvre Google Maps. Rien si vide. */
export function MapLink({ sx, place, children, style }) {
  const href = mapsHref(place)
  if (!href) return null
  return (
    <a data-testid="map-link" href={href} target="_blank" rel="noreferrer" style={sx(style || 'color:#4f8a86;font-weight:700;text-decoration:none;')}>
      {children || `📍 ${place}`}
    </a>
  )
}
