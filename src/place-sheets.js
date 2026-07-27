/* ------------------------------------------------------------------ *
 * Fiches de visite — préparer une sortie et l'avoir sous la main SANS
 * RÉSEAU sur place (le Carladès a beaucoup de zones blanches).
 *
 * Le contenu est embarqué et sourcé. Toute donnée non vérifiable est
 * laissée vide plutôt qu'estimée : une famille s'y fie sur le terrain,
 * une durée sous-estimée ou une consigne de sécurité inventée serait un
 * vrai problème. Les champs vides ne sont simplement pas affichés.
 * ------------------------------------------------------------------ */

/**
 * @typedef {object} PlaceSheet
 * @property {string} id
 * @property {string} emoji
 * @property {string} name
 * @property {string} town        commune de rattachement
 * @property {string} summary     à quoi ça ressemble, en une phrase
 * @property {string} access      accès routier et stationnement
 * @property {string} duration    durée aller-retour
 * @property {string} difficulty  niveau + dénivelé
 * @property {string} withKids    praticabilité poussette, âge conseillé
 * @property {string} safety      ce qu'il faut surveiller
 * @property {string} season      période d'ouverture / accessibilité
 * @property {{lat:number,lng:number}|null} coords  point de départ
 * @property {string[]} sources   URLs consultées
 */

/** @type {PlaceSheet[]} */
export const PLACE_SHEETS = []

/** Fiche par identifiant, ou `null`. Pur. */
export function getPlaceSheet(id) {
  return PLACE_SHEETS.find((s) => s.id === id) || null
}

/** Champs renseignés d'une fiche, dans l'ordre d'affichage. Pur. */
export function sheetRows(sheet) {
  if (!sheet) return []
  const rows = [
    ['🚗', 'Accès & parking', sheet.access],
    ['⏱️', 'Durée', sheet.duration],
    ['📈', 'Difficulté', sheet.difficulty],
    ['👶', 'Avec les enfants', sheet.withKids],
    ['⚠️', 'Prudence', sheet.safety],
    ['📅', 'Saison', sheet.season],
  ]
  // Une info absente n'est pas affichée : mieux vaut un trou qu'une invention.
  return rows.filter(([, , value]) => typeof value === 'string' && value.trim())
}

/** True si la fiche a au moins une source citée. Pur. */
export function isSourced(sheet) {
  return !!sheet && Array.isArray(sheet.sources) && sheet.sources.length > 0
}
