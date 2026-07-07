import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVisits } from '../hooks/useVisits.js'

const sampleVisits = [
  { id: 1, emoji: '⛰️', name: 'Puy Mary', cat: 'Nature', dist: '25 min', dur: '2 h', age: 'Dès 4 ans' },
  { id: 2, emoji: '💧', name: 'Cascade', cat: 'Nature', dist: '10 min', dur: '1 h', age: 'Tous âges' },
]

describe('useVisits()', () => {
  it('initialise avec les visites et favoris fournis', () => {
    const { result } = renderHook(() => useVisits(sampleVisits, { 1: true }))
    expect(result.current.visits).toEqual(sampleVisits)
    expect(result.current.saved).toEqual({ 1: true })
    expect(result.current.savedCount).toBe(1)
  })

  it('utilise VISITS_INITIAL et {} par défaut si rien n\'est fourni', () => {
    const { result } = renderHook(() => useVisits(null, null))
    expect(result.current.visits.length).toBeGreaterThan(0)
    expect(result.current.saved).toEqual({})
    expect(result.current.savedCount).toBe(0)
  })

  it('toggleSaved bascule un favori', () => {
    const { result } = renderHook(() => useVisits(sampleVisits, {}))
    act(() => result.current.toggleSaved(1))
    expect(result.current.saved[1]).toBe(true)
    expect(result.current.savedCount).toBe(1)
    act(() => result.current.toggleSaved(1))
    expect(result.current.saved[1]).toBe(false)
    expect(result.current.savedCount).toBe(0)
  })

  it('addVisit ajoute une visite avec un id auto-incrémenté et emoji par défaut', () => {
    const { result } = renderHook(() => useVisits(sampleVisits, {}))
    act(() => result.current.addVisit({ name: 'Marché de Salers', cat: 'Marché', dist: '30 min', dur: '1 h', age: 'Tous âges' }))
    expect(result.current.visits).toHaveLength(3)
    const added = result.current.visits[2]
    expect(added.id).toBe(3)
    expect(added.emoji).toBe('📍')
    expect(added.name).toBe('Marché de Salers')
  })

  it('addVisit sur une liste vide démarre à l\'id 1', () => {
    const { result } = renderHook(() => useVisits([], {}))
    act(() => result.current.addVisit({ name: 'Première visite' }))
    expect(result.current.visits[0].id).toBe(1)
  })

  it('updateVisit modifie une visite existante sans toucher aux autres', () => {
    const { result } = renderHook(() => useVisits(sampleVisits, {}))
    act(() => result.current.updateVisit(1, { name: 'Puy Mary — Pas de Peyrol' }))
    expect(result.current.visits.find((v) => v.id === 1).name).toBe('Puy Mary — Pas de Peyrol')
    expect(result.current.visits.find((v) => v.id === 2).name).toBe('Cascade')
  })

  it('removeVisit supprime une visite et retourne true', () => {
    const { result } = renderHook(() => useVisits(sampleVisits, {}))
    let ok
    act(() => { ok = result.current.removeVisit(2) })
    expect(ok).toBe(true)
    expect(result.current.visits).toHaveLength(1)
    expect(result.current.visits[0].id).toBe(1)
  })

  it('removeVisit refuse de supprimer la dernière visite restante et retourne false', () => {
    const { result } = renderHook(() => useVisits([sampleVisits[0]], {}))
    let ok
    act(() => { ok = result.current.removeVisit(1) })
    expect(ok).toBe(false)
    expect(result.current.visits).toHaveLength(1)
  })
})
