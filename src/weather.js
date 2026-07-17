/**
 * Suggestions d'activités selon la météo du jour (100 % hors-ligne : croise le
 * tableau `meteo` du store avec les `visits`). Objectif : les jours de pluie,
 * mettre en avant les activités couvertes/indoor et signaler les sorties plein
 * air à reporter.
 */

/** Catégories/mots-clés d'activités abritées (repli quand `visit.indoor` absent). */
const INDOOR_CATS = new Set(['Patrimoine', 'Gourmand', 'Marché'])
const INDOOR_RE = /maison des volcans|buronnerie|dégustation|degustation|marché|marche|musée|musee|château|chateau/i

/** Un jour est pluvieux si l'icône est la pluie ou si la probabilité ≥ seuil. */
export function isRainyDay(meteoDay, threshold = 50) {
  if (!meteoDay) return false
  if (typeof meteoDay.icon === 'string' && meteoDay.icon.includes('🌧')) return true
  const pct = parseInt(String(meteoDay.rain ?? '').replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(pct) && pct >= threshold
}

/** Une visite est abritée : champ `indoor` explicite, sinon heuristique. */
export function isIndoorVisit(visit) {
  if (!visit) return false
  if (typeof visit.indoor === 'boolean') return visit.indoor
  return INDOOR_CATS.has(visit.cat) || INDOOR_RE.test(visit.name || '')
}

/**
 * Suggestion pour un jour donné :
 *  { rainy, indoor:[visites abritées], message }.
 * Par temps sec, `rainy=false` et pas de repli imposé (message positif).
 */
export function weatherSuggestion(meteoDay, visits = []) {
  const rainy = isRainyDay(meteoDay)
  const indoor = visits.filter(isIndoorVisit)
  if (!rainy) {
    return { rainy: false, indoor, message: 'Beau temps annoncé — profitez des sorties plein air !' }
  }
  const message = indoor.length
    ? 'Pluie annoncée — plutôt une activité au sec aujourd\'hui :'
    : 'Pluie annoncée — gardez les grandes randos pour un jour plus clément.'
  return { rainy: true, indoor, message }
}
