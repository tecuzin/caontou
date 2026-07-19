/**
 * Progression des visites, 100 % local et déterministe. Une visite est
 * considérée « faite » dès qu'elle a reçu une note (étoiles > 0) dans `ratings`
 * (map `{ [visitId]: { stars, note } }`). Module pur, testable comme `geo.js`.
 */

/** true si la visite `id` a été notée (donc visitée). */
export function isVisited(ratings, id) {
  const r = ratings && ratings[id]
  return !!(r && Number(r.stars) > 0)
}

/** Set des ids de visites faites (typés comme les ids passés en `visits`). */
export function visitedIdSet(visits = [], ratings = {}) {
  const done = new Set()
  for (const v of visits) if (isVisited(ratings, v.id)) done.add(v.id)
  return done
}

/** Compteur { done, total } sur une liste de visites (total = visites de la liste). */
export function visitProgress(visits = [], ratings = {}) {
  const total = visits.length
  let done = 0
  for (const v of visits) if (isVisited(ratings, v.id)) done++
  return { done, total }
}
