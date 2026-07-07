import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMeals } from '../hooks/useMeals.js'

const sample = [
  { id: 1, day: 'Mer 5', dish: 'Étape resto' },
  { id: 2, day: 'Jeu 6', dish: 'Pâtes au pesto' },
]

describe('useMeals()', () => {
  it('initialise avec les repas fournis', () => {
    const { result } = renderHook(() => useMeals(sample))
    expect(result.current.meals).toEqual(sample)
  })

  it('utilise MEALS_INITIAL par défaut si rien n\'est fourni', () => {
    const { result } = renderHook(() => useMeals(null))
    expect(result.current.meals.length).toBeGreaterThan(0)
  })

  it('addMeal ajoute un repas avec un id auto-incrémenté', () => {
    const { result } = renderHook(() => useMeals(sample))
    act(() => result.current.addMeal({ day: 'Ven 7', dish: 'Truffade' }))
    expect(result.current.meals).toHaveLength(3)
    expect(result.current.meals[2]).toEqual({ id: 3, day: 'Ven 7', dish: 'Truffade' })
  })

  it('addMeal sur une liste vide démarre à l\'id 1', () => {
    const { result } = renderHook(() => useMeals([]))
    act(() => result.current.addMeal({ day: 'Lun 1', dish: 'Test' }))
    expect(result.current.meals[0].id).toBe(1)
  })

  it('updateMeal modifie un repas existant sans toucher aux autres', () => {
    const { result } = renderHook(() => useMeals(sample))
    act(() => result.current.updateMeal(1, { dish: 'Nouveau plat' }))
    expect(result.current.meals.find((m) => m.id === 1).dish).toBe('Nouveau plat')
    expect(result.current.meals.find((m) => m.id === 2).dish).toBe('Pâtes au pesto')
  })

  it('removeMeal supprime un repas et retourne true', () => {
    const { result } = renderHook(() => useMeals(sample))
    let ok
    act(() => { ok = result.current.removeMeal(2) })
    expect(ok).toBe(true)
    expect(result.current.meals).toHaveLength(1)
  })

  it('removeMeal refuse de supprimer le dernier repas restant et retourne false', () => {
    const { result } = renderHook(() => useMeals([sample[0]]))
    let ok
    act(() => { ok = result.current.removeMeal(1) })
    expect(ok).toBe(false)
    expect(result.current.meals).toHaveLength(1)
  })
})
