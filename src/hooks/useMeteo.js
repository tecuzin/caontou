import { useState } from 'react'
import { METEO_INITIAL } from '../data.js'

/**
 * État et actions du domaine "météo" (prévisions par jour, identifiées
 * par index — pas d'id stable, comme le tableau des dépenses).
 */
export function useMeteo(initialMeteo) {
  const [meteo, setMeteo] = useState(initialMeteo || structuredClone(METEO_INITIAL))

  const addMeteoDay = (data) => {
    setMeteo((list) => [...list, data])
  }

  const updateMeteoDay = (idx, data) => {
    setMeteo((list) => list.map((w, i) => i === idx ? { ...w, ...data } : w))
  }

  /** Retourne false sans rien faire si c'est le dernier jour météo (au moins un doit rester). */
  const removeMeteoDay = (idx) => {
    if (meteo.length <= 1) return false
    setMeteo((list) => list.filter((_, i) => i !== idx))
    return true
  }

  return { meteo, setMeteo, addMeteoDay, updateMeteoDay, removeMeteoDay }
}
