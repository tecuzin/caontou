import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTripConfig } from '../hooks/useTripConfig.js'

const sample = { start: '2026-08-05', end: '2026-08-15', origin: 'Beauvais', etape: 'Laschamps', destination: 'Mandailles (Cantal)' }

describe('useTripConfig()', () => {
  it('initialise avec le voyage fourni', () => {
    const { result } = renderHook(() => useTripConfig(sample))
    expect(result.current.trip).toEqual(sample)
  })

  it('utilise TRIP_INITIAL par défaut si rien n\'est fourni', () => {
    const { result } = renderHook(() => useTripConfig(null))
    expect(result.current.trip.origin).toBeTruthy()
  })

  it('updateTrip fusionne les champs modifiés sans écraser les autres', () => {
    const { result } = renderHook(() => useTripConfig(sample))
    act(() => result.current.updateTrip({ destination: 'Aurillac' }))
    expect(result.current.trip.destination).toBe('Aurillac')
    expect(result.current.trip.origin).toBe('Beauvais')
    expect(result.current.trip.start).toBe('2026-08-05')
  })
})
