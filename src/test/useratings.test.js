import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRatings } from '../hooks/useRatings.js'

describe('useRatings()', () => {
  it('initialise vide par défaut', () => {
    const { result } = renderHook(() => useRatings(null))
    expect(result.current.ratings).toEqual({})
  })

  it('initialise avec les notes fournies', () => {
    const seed = { 3: { stars: 4, note: 'Superbe' } }
    const { result } = renderHook(() => useRatings(seed))
    expect(result.current.ratings).toEqual(seed)
  })

  it('rateVisit pose les étoiles sans écraser la note existante', () => {
    const { result } = renderHook(() => useRatings({ 3: { note: 'Déjà noté' } }))
    act(() => result.current.rateVisit(3, 5))
    expect(result.current.ratings[3]).toEqual({ note: 'Déjà noté', stars: 5 })
  })

  it('setVisitNote pose la note sans écraser les étoiles existantes', () => {
    const { result } = renderHook(() => useRatings({ 3: { stars: 2 } }))
    act(() => result.current.setVisitNote(3, 'Un peu déçu'))
    expect(result.current.ratings[3]).toEqual({ stars: 2, note: 'Un peu déçu' })
  })

  it('note plusieurs visites indépendamment', () => {
    const { result } = renderHook(() => useRatings({}))
    act(() => result.current.rateVisit(1, 3))
    act(() => result.current.rateVisit(2, 5))
    expect(result.current.ratings).toEqual({ 1: { stars: 3 }, 2: { stars: 5 } })
  })
})
