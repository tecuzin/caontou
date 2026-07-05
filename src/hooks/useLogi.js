import { useState } from 'react'
import { LOGI_INITIAL } from '../data.js'

/**
 * État et actions du domaine "logistique" (valises/listes de préparatifs) —
 * listes identifiées par clé stable, chacune avec ses items (chaînes simples,
 * pas d'id — comme les catégories de courses).
 */
export function useLogi(initialLogi) {
  const [logi, setLogi] = useState(initialLogi || structuredClone(LOGI_INITIAL))

  const addLogiList = (name, emoji) => {
    const key = `cl_${Date.now()}`
    setLogi((list) => [...list, { key, name, emoji: emoji || '📦', items: [] }])
    return key
  }

  /** Retourne false sans rien faire si c'est la dernière liste restante. */
  const removeLogiList = (key) => {
    if (logi.length <= 1) return false
    setLogi((list) => list.filter((L) => L.key !== key))
    return true
  }

  const addLogiItem = (key, item) => {
    setLogi((list) => list.map((L) => L.key === key ? { ...L, items: [...L.items, item] } : L))
  }

  const removeLogiItem = (key, item) => {
    setLogi((list) => list.map((L) => L.key === key ? { ...L, items: L.items.filter((i) => i !== item) } : L))
  }

  return { logi, setLogi, addLogiList, removeLogiList, addLogiItem, removeLogiItem }
}
