import { useState } from 'react'

/**
 * État et actions du domaine "dépenses" (onglet Budget). Les dépenses sont
 * identifiées par leur index dans le tableau (pas d'id stable) — comportement
 * existant préservé tel quel.
 */
export function useExpenses(initialExpenses) {
  const [expenses, setExpenses] = useState(initialExpenses || [])

  const addExpense = (data) => {
    setExpenses((list) => [...list, data])
  }

  const updateExpense = (idx, data) => {
    setExpenses((list) => list.map((e, i) => i === idx ? { ...e, ...data } : e))
  }

  const removeExpense = (idx) => {
    setExpenses((list) => list.filter((_, i) => i !== idx))
  }

  return { expenses, setExpenses, addExpense, updateExpense, removeExpense }
}
