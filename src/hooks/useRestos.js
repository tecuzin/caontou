import { useState } from 'react'
import { RESTOS_INITIAL } from '../data.js'

/**
 * État et actions du domaine "restos" (bonnes adresses de l'onglet Restos).
 * Chaque resto est identifié par un id stable, incrémenté à partir du max
 * existant. Hook de données pur : l'état du formulaire/modale reste dans App.
 */
export function useRestos(initialRestos) {
  const [restos, setRestos] = useState(initialRestos || structuredClone(RESTOS_INITIAL))

  const addResto = (data) => {
    const id = Math.max(0, ...restos.map((r) => r.id)) + 1
    setRestos((list) => [...list, { id, ...data }])
  }

  const updateResto = (id, data) => {
    setRestos((list) => list.map((r) => r.id === id ? { ...r, ...data } : r))
  }

  const removeResto = (id) => {
    setRestos((list) => list.filter((r) => r.id !== id))
  }

  return { restos, setRestos, addResto, updateResto, removeResto }
}
