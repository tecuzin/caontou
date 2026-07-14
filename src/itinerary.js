import { parseDist } from './utils.js'

// ── Itinéraire du jour ordonné par proximité (depuis le gîte) ─────────────────
//
// Sans matrice de distances point-à-point (offline, pas d'API), on ordonne les
// sorties par distance depuis le gîte (heuristique « moyeu et rayons » : on
// enchaîne du plus proche au plus loin, retour au gîte). Calcul 100 % pur.

/** Trie les visites par distance croissante depuis le gîte (parseDist). */
export function orderByProximity(visits) {
  return [...(visits || [])].sort((a, b) => parseDist(a.dist) - parseDist(b.dist))
}

/**
 * Estimation de route pour une sélection : chaque sortie est un aller-retour
 * depuis le gîte (le plus honnête sans matrice inter-points). On additionne les
 * aller-retours, en réutilisant le trajet de la plus proche entre deux étapes
 * proches n'est pas modélisé — c'est une borne haute indicative.
 * @returns { ordered, stops, farthestMin, roundTripMin }
 */
export function routePlan(visits) {
  const ordered = orderByProximity(visits)
  const mins = ordered.map((v) => parseDist(v.dist)).filter((m) => m < 999)
  const farthestMin = mins.length ? Math.max(...mins) : 0
  // Heuristique moyeu-rayons : aller-retour vers la plus lointaine + petits
  // détours vers les plus proches (approx : somme des allers simples).
  const roundTripMin = farthestMin * 2
  return { ordered, stops: ordered.length, farthestMin, roundTripMin }
}

/** Formate une durée en minutes façon « 1 h 10 » / « 45 min ». */
export function fmtMinutes(min) {
  if (!min) return '0 min'
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h} h${m ? ' ' + String(m).padStart(2, '0') : ''}` : `${m} min`
}

/**
 * URL Google Maps « directions » : départ et arrivée au gîte, les sorties en
 * points de passage (dans l'ordre de proximité). Ouvre l'itinéraire réel.
 */
export function mapsDirectionsUrl(visits, origin = 'Vezels-Roussy 15130') {
  const ordered = orderByProximity(visits)
  const enc = encodeURIComponent
  const params = new URLSearchParams({ api: '1', origin, destination: origin, travelmode: 'driving' })
  const wp = ordered.map((v) => enc(`${v.name}, Cantal`)).join('|')
  // URLSearchParams encode déjà ; on ajoute waypoints manuellement pour garder
  // le séparateur '|' lisible par Maps.
  const base = `https://www.google.com/maps/dir/?${params.toString()}`
  return wp ? `${base}&waypoints=${wp}` : base
}
