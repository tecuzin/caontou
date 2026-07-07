import { useState } from 'react'
import { TRAJETS_INITIAL } from '../data.js'

/**
 * État et actions du domaine "trajet" — deux directions (aller/retour),
 * chacune une liste d'étapes identifiées par index. Chaque action prend
 * la direction en paramètre plutôt que de la lire d'un state séparé —
 * le composant appelant reste responsable de savoir quelle direction est
 * affichée (toggle Aller/Retour, état purement UI).
 */
export function useTrajets(initialTrajets) {
  const [trajets, setTrajets] = useState(initialTrajets || structuredClone(TRAJETS_INITIAL))

  const addTrajetStep = (direction, data) => {
    setTrajets((t) => ({ ...t, [direction]: [...t[direction], data] }))
  }

  const updateTrajetStep = (direction, idx, data) => {
    setTrajets((t) => ({ ...t, [direction]: t[direction].map((st, i) => i === idx ? data : st) }))
  }

  /** Retourne false sans rien faire si c'est la dernière étape de cette direction. */
  const removeTrajetStep = (direction, idx) => {
    if (trajets[direction].length <= 1) return false
    setTrajets((t) => ({ ...t, [direction]: t[direction].filter((_, i) => i !== idx) }))
    return true
  }

  return { trajets, setTrajets, addTrajetStep, updateTrajetStep, removeTrajetStep }
}
