import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDeparture } from '../hooks/useDeparture.js'

const sample = [
  { id: 1, emoji: '🔌', label: 'Couper l\'électricité', done: false },
  { id: 2, emoji: '🗑️', label: 'Sortir les poubelles', done: true },
]

describe('useDeparture()', () => {
  it('initialise avec les items fournis', () => {
    const { result } = renderHook(() => useDeparture(sample))
    expect(result.current.departure).toEqual(sample)
  })

  it('utilise DEPARTURE_INITIAL par défaut si rien n\'est fourni', () => {
    const { result } = renderHook(() => useDeparture(null))
    expect(result.current.departure.length).toBeGreaterThan(0)
  })

  it('toggleDeparture bascule le done de l\'item ciblé uniquement', () => {
    const { result } = renderHook(() => useDeparture(sample))
    act(() => result.current.toggleDeparture(1))
    expect(result.current.departure.find((i) => i.id === 1).done).toBe(true)
    expect(result.current.departure.find((i) => i.id === 2).done).toBe(true)
  })

  it('addDepartureItem ajoute un item non coché avec un id', () => {
    const { result } = renderHook(() => useDeparture(sample))
    act(() => result.current.addDepartureItem('Fermer les volets'))
    const added = result.current.departure[result.current.departure.length - 1]
    expect(added.label).toBe('Fermer les volets')
    expect(added.done).toBe(false)
    expect(typeof added.id).toBe('number')
  })

  it('removeDepartureItem retire l\'item ciblé', () => {
    const { result } = renderHook(() => useDeparture(sample))
    act(() => result.current.removeDepartureItem(2))
    expect(result.current.departure).toEqual([sample[0]])
  })
})
