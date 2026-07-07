import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSuggestions } from '../hooks/useSuggestions.js'

describe('useSuggestions()', () => {
  it('démarre avec une liste vide par défaut', () => {
    const { result } = renderHook(() => useSuggestions(null))
    expect(result.current.suggestions).toEqual([])
  })

  it('initialise avec les suggestions fournies', () => {
    const initial = [{ id: 1, text: 'Test', createdAt: '2026-07-04T10:00:00.000Z' }]
    const { result } = renderHook(() => useSuggestions(initial))
    expect(result.current.suggestions).toEqual(initial)
  })

  it('addSuggestion ajoute une suggestion avec un id auto-incrémenté et une date', () => {
    const { result } = renderHook(() => useSuggestions([]))
    act(() => result.current.addSuggestion('Ajouter un mode sombre'))
    expect(result.current.suggestions).toHaveLength(1)
    expect(result.current.suggestions[0].id).toBe(1)
    expect(result.current.suggestions[0].text).toBe('Ajouter un mode sombre')
    expect(result.current.suggestions[0].createdAt).toBeTruthy()
  })

  it('addSuggestion ignore un texte vide ou uniquement des espaces', () => {
    const { result } = renderHook(() => useSuggestions([]))
    act(() => result.current.addSuggestion('   '))
    expect(result.current.suggestions).toHaveLength(0)
  })

  it('addSuggestion trim le texte avant de l\'enregistrer', () => {
    const { result } = renderHook(() => useSuggestions([]))
    act(() => result.current.addSuggestion('  Espaces autour  '))
    expect(result.current.suggestions[0].text).toBe('Espaces autour')
  })

  it('removeSuggestion supprime la suggestion correspondante', () => {
    const initial = [
      { id: 1, text: 'A', createdAt: '2026-07-04T10:00:00.000Z' },
      { id: 2, text: 'B', createdAt: '2026-07-04T10:00:00.000Z' },
    ]
    const { result } = renderHook(() => useSuggestions(initial))
    act(() => result.current.removeSuggestion(1))
    expect(result.current.suggestions).toEqual([initial[1]])
  })

  it('les ids s\'incrémentent correctement après plusieurs ajouts', () => {
    const { result } = renderHook(() => useSuggestions([]))
    act(() => result.current.addSuggestion('Premier'))
    act(() => result.current.addSuggestion('Deuxième'))
    expect(result.current.suggestions.map((s) => s.id)).toEqual([1, 2])
  })
})
