import { useState } from 'react'
import { VISITS_INITIAL } from '../data.js'

/**
 * État et actions du domaine "visites" : la liste des points d'intérêt et
 * les favoris (♥). Les actions sont pures (prennent des données déjà
 * validées) — la collecte du formulaire (champs contrôlés de la modal
 * d'édition) reste dans le composant appelant.
 */
export function useVisits(initialVisits, initialSaved) {
  const [visits, setVisits] = useState(initialVisits || structuredClone(VISITS_INITIAL))
  const [saved, setSaved] = useState(initialSaved || {})

  const savedCount = Object.values(saved).filter(Boolean).length

  const toggleSaved = (id) => setSaved((sv) => ({ ...sv, [id]: !sv[id] }))

  const addVisit = (data) => {
    const newId = Math.max(0, ...visits.map((v) => v.id)) + 1
    setVisits((list) => [...list, { id: newId, emoji: '📍', ...data }])
  }

  const updateVisit = (id, data) => {
    setVisits((list) => list.map((v) => v.id === id ? { ...v, ...data } : v))
  }

  /** Retourne false sans rien faire si c'est la dernière visite (au moins une doit rester). */
  const removeVisit = (id) => {
    if (visits.length <= 1) return false
    setVisits((list) => list.filter((v) => v.id !== id))
    return true
  }

  return { visits, setVisits, saved, setSaved, savedCount, toggleSaved, addVisit, updateVisit, removeVisit }
}
