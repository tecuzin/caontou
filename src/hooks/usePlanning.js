import { useState } from 'react'
import { DAYS_INITIAL } from '../data.js'
import { sortItemsByTime } from '../utils.js'

/**
 * État et actions du domaine "planning" (jours du séjour + activités par
 * jour). Les jours sont identifiés par index, triés par numéro à l'ajout ;
 * les activités d'un jour sont identifiées par index dans `d.items`, triées
 * par heure après chaque ajout/modification.
 */
export function usePlanning(initialDays) {
  const [days, setDays] = useState(initialDays || structuredClone(DAYS_INITIAL))

  const addDay = (data) => {
    setDays((list) => {
      const next = [...list, { ...data, items: [] }]
      next.sort((a, b) => a.num - b.num)
      return next
    })
  }

  const updateDay = (dayIdx, data) => {
    setDays((list) => list.map((d, i) => i === dayIdx ? { ...d, ...data } : d))
  }

  /** Retourne false sans rien faire si c'est le dernier jour restant. */
  const removeDay = (dayIdx) => {
    if (days.length <= 1) return false
    setDays((list) => list.filter((_, i) => i !== dayIdx))
    return true
  }

  const addActivity = (dayIdx, data) => {
    setDays((list) => list.map((d, di) => {
      if (di !== dayIdx) return d
      return { ...d, items: sortItemsByTime([...d.items, data]) }
    }))
  }

  const updateActivity = (dayIdx, itemIdx, data) => {
    setDays((list) => list.map((d, di) => {
      if (di !== dayIdx) return d
      const updated = d.items.map((it, ii) => ii === itemIdx ? { ...it, ...data } : it)
      return { ...d, items: sortItemsByTime(updated) }
    }))
  }

  const removeActivity = (dayIdx, itemIdx) => {
    setDays((list) => list.map((d, di) => di === dayIdx ? { ...d, items: d.items.filter((_, ii) => ii !== itemIdx) } : d))
  }

  return { days, setDays, addDay, updateDay, removeDay, addActivity, updateActivity, removeActivity }
}
