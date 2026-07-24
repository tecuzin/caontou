/* ------------------------------------------------------------------ *
 * Deep-link d'onglet — ouvre directement un onglet via `?tab=…`
 * (raccourcis du Web App Manifest / lien partagé). Pur & testable ;
 * App.jsx s'en sert seulement pour initialiser l'état `tab`.
 * ------------------------------------------------------------------ */

export const DEEPLINK_TABS = ['accueil', 'planning', 'visites', 'repas', 'budget']

/**
 * Onglet demandé dans une query string, s'il est valide.
 * @param {string} search  ex. "?tab=repas" (window.location.search)
 * @param {string[]} valid  onglets autorisés (défaut DEEPLINK_TABS)
 * @returns {string|null} l'onglet, ou null si absent/inconnu.
 */
export function initialTabFromSearch(search = '', valid = DEEPLINK_TABS) {
  try {
    const tab = new URLSearchParams(search).get('tab')
    return tab && valid.includes(tab) ? tab : null
  } catch {
    return null
  }
}
