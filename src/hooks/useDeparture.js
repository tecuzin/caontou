import { useState } from 'react'
import { DEPARTURE_INITIAL } from '../departure.js'

/**
 * État et actions de la checklist « Départ du gîte » (état des lieux de sortie).
 * Items identifiés par id ; hook de données pur (les haptics restent dans App).
 */
export function useDeparture(initialDeparture) {
  const [departure, setDeparture] = useState(initialDeparture || structuredClone(DEPARTURE_INITIAL))

  const toggleDeparture = (id) => {
    setDeparture((l) => l.map((i) => i.id === id ? { ...i, done: !i.done } : i))
  }

  const addDepartureItem = (label) => {
    setDeparture((l) => [...l, { id: Date.now(), emoji: '✅', label, done: false }])
  }

  const removeDepartureItem = (id) => {
    setDeparture((l) => l.filter((i) => i.id !== id))
  }

  return { departure, setDeparture, toggleDeparture, addDepartureItem, removeDepartureItem }
}
