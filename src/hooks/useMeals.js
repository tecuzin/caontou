import { useState } from 'react'
import { MEALS_INITIAL } from '../data.js'

/**
 * État et actions du domaine "repas" (menus de l'onglet Repas). Identifiés
 * par un id stable (voir migration historique : le jour seul en string
 * causait des collisions entre deux repas du même libellé de jour).
 */
export function useMeals(initialMeals) {
  const [meals, setMeals] = useState(initialMeals || structuredClone(MEALS_INITIAL))

  const addMeal = (data) => {
    const newId = Math.max(0, ...meals.map((m) => m.id)) + 1
    setMeals((list) => [...list, { id: newId, ...data }])
  }

  const updateMeal = (id, data) => {
    setMeals((list) => list.map((m) => m.id === id ? { ...m, ...data } : m))
  }

  /** Retourne false sans rien faire si c'est le dernier repas (au moins un doit rester). */
  const removeMeal = (id) => {
    if (meals.length <= 1) return false
    setMeals((list) => list.filter((m) => m.id !== id))
    return true
  }

  return { meals, setMeals, addMeal, updateMeal, removeMeal }
}
