import { useState } from 'react'

/**
 * Notes et avis des visites : map `{ [visitId]: { stars, note } }`, persistée
 * telle quelle dans le store. Hook de données pur (haptics gérés dans App).
 */
export function useRatings(initialRatings) {
  const [ratings, setRatings] = useState(initialRatings || {})

  const rateVisit = (id, stars) => {
    setRatings((r) => ({ ...r, [id]: { ...r[id], stars } }))
  }

  const setVisitNote = (id, note) => {
    setRatings((r) => ({ ...r, [id]: { ...r[id], note } }))
  }

  return { ratings, setRatings, rateVisit, setVisitNote }
}
