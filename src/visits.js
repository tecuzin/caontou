import { parseDist } from './utils.js'

/** Ordre de tri des catégories de visites (extrait d'App.jsx). */
export const CAT_ORDER = ['Nature', 'Famille', 'Patrimoine', 'Baignade', 'Gourmand', 'Marché', 'Marche']

/**
 * Filtre les visites par catégorie (`'Tous'` = toutes) puis trie par distance
 * (`'dist'`) ou catégorie (`'cat'`). Fonction pure — ne mute pas `visits`
 * (le `.filter` crée un nouveau tableau avant le `.sort`).
 */
export function filterAndSortVisits(visits, filter, visitSort) {
  return visits
    .filter((v) => filter === 'Tous' || v.cat === filter)
    .sort((a, b) => {
      if (visitSort === 'dist') return parseDist(a.dist) - parseDist(b.dist)
      if (visitSort === 'cat') return CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat)
      return 0
    })
}
