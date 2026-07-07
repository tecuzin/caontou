import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExpenses } from '../hooks/useExpenses.js'

const sample = [
  { label: 'Essence', cat: 'Transport', amt: 60 },
  { label: 'Glaces', cat: 'Nourriture', amt: 12 },
]

describe('useExpenses()', () => {
  it('initialise avec les dépenses fournies', () => {
    const { result } = renderHook(() => useExpenses(sample))
    expect(result.current.expenses).toEqual(sample)
  })

  it('démarre avec une liste vide si rien n\'est fourni', () => {
    const { result } = renderHook(() => useExpenses(null))
    expect(result.current.expenses).toEqual([])
  })

  it('addExpense ajoute une dépense à la fin', () => {
    const { result } = renderHook(() => useExpenses(sample))
    act(() => result.current.addExpense({ label: 'Péage', cat: 'Transport', amt: 15 }))
    expect(result.current.expenses).toHaveLength(3)
    expect(result.current.expenses[2]).toEqual({ label: 'Péage', cat: 'Transport', amt: 15 })
  })

  it('updateExpense modifie la dépense à l\'index donné sans toucher aux autres', () => {
    const { result } = renderHook(() => useExpenses(sample))
    act(() => result.current.updateExpense(0, { amt: 70 }))
    expect(result.current.expenses[0]).toEqual({ label: 'Essence', cat: 'Transport', amt: 70 })
    expect(result.current.expenses[1]).toEqual(sample[1])
  })

  it('removeExpense supprime la dépense à l\'index donné', () => {
    const { result } = renderHook(() => useExpenses(sample))
    act(() => result.current.removeExpense(0))
    expect(result.current.expenses).toEqual([sample[1]])
  })

  it('removeExpense peut vider entièrement la liste (pas de garde-fou)', () => {
    const { result } = renderHook(() => useExpenses([sample[0]]))
    act(() => result.current.removeExpense(0))
    expect(result.current.expenses).toEqual([])
  })
})
