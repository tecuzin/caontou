import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRestos } from '../hooks/useRestos.js'

const sample = [
  { id: 1, name: 'Auberge des Montagnes', place: 'Pailherols', reserved: false },
  { id: 2, name: 'Le Cantou', place: 'Vezels-Roussy', reserved: true },
]

describe('useRestos()', () => {
  it('initialise avec les restos fournis', () => {
    const { result } = renderHook(() => useRestos(sample))
    expect(result.current.restos).toEqual(sample)
  })

  it('utilise RESTOS_INITIAL par défaut si rien n\'est fourni', () => {
    const { result } = renderHook(() => useRestos(null))
    expect(result.current.restos.length).toBeGreaterThan(0)
  })

  it('addResto ajoute un resto avec un id auto-incrémenté (max + 1)', () => {
    const { result } = renderHook(() => useRestos(sample))
    act(() => result.current.addResto({ name: 'Chez Marie', place: 'Aurillac' }))
    expect(result.current.restos).toHaveLength(3)
    expect(result.current.restos[2]).toEqual({ id: 3, name: 'Chez Marie', place: 'Aurillac' })
  })

  it('addResto sur une liste vide démarre à l\'id 1', () => {
    const { result } = renderHook(() => useRestos([]))
    act(() => result.current.addResto({ name: 'Nouveau' }))
    expect(result.current.restos[0].id).toBe(1)
  })

  it('addResto calcule le max même si les ids ne sont pas triés', () => {
    const { result } = renderHook(() => useRestos([{ id: 5, name: 'A' }, { id: 2, name: 'B' }]))
    act(() => result.current.addResto({ name: 'C' }))
    expect(result.current.restos[2].id).toBe(6)
  })

  it('updateResto modifie un resto existant sans toucher aux autres', () => {
    const { result } = renderHook(() => useRestos(sample))
    act(() => result.current.updateResto(1, { reserved: true }))
    expect(result.current.restos.find((r) => r.id === 1).reserved).toBe(true)
    expect(result.current.restos.find((r) => r.id === 2).name).toBe('Le Cantou')
  })

  it('removeResto supprime le resto ciblé', () => {
    const { result } = renderHook(() => useRestos(sample))
    act(() => result.current.removeResto(2))
    expect(result.current.restos).toEqual([sample[0]])
  })
})
