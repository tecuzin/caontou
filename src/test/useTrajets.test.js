import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTrajets } from '../hooks/useTrajets.js'

const sample = {
  aller: [
    { time: '09:00', place: 'Beauvais', note: 'Départ', color: '#5b7042' },
    { time: '16:00', place: 'Laschamps', note: 'Étape', color: '#9c6b4a' },
  ],
  retour: [
    { time: '09:30', place: 'Mandailles', note: 'Check-out', color: '#9c6b4a' },
  ],
}

describe('useTrajets()', () => {
  it('initialise avec les trajets fournis', () => {
    const { result } = renderHook(() => useTrajets(sample))
    expect(result.current.trajets).toEqual(sample)
  })

  it('utilise TRAJETS_INITIAL par défaut si rien n\'est fourni', () => {
    const { result } = renderHook(() => useTrajets(null))
    expect(result.current.trajets.aller.length).toBeGreaterThan(0)
    expect(result.current.trajets.retour.length).toBeGreaterThan(0)
  })

  it('addTrajetStep ajoute une étape à la direction donnée uniquement', () => {
    const { result } = renderHook(() => useTrajets(sample))
    act(() => result.current.addTrajetStep('aller', { time: '18:00', place: 'Mandailles', note: '', color: '#b8503f' }))
    expect(result.current.trajets.aller).toHaveLength(3)
    expect(result.current.trajets.retour).toHaveLength(1) // inchangé
  })

  it('updateTrajetStep modifie l\'étape à l\'index donné sans toucher aux autres', () => {
    const { result } = renderHook(() => useTrajets(sample))
    const updated = { time: '10:00', place: 'Beauvais (retardé)', note: '', color: '#5b7042' }
    act(() => result.current.updateTrajetStep('aller', 0, updated))
    expect(result.current.trajets.aller[0]).toEqual(updated)
    expect(result.current.trajets.aller[1]).toEqual(sample.aller[1])
  })

  it('removeTrajetStep supprime l\'étape et retourne true', () => {
    const { result } = renderHook(() => useTrajets(sample))
    let ok
    act(() => { ok = result.current.removeTrajetStep('aller', 1) })
    expect(ok).toBe(true)
    expect(result.current.trajets.aller).toHaveLength(1)
  })

  it('removeTrajetStep refuse de supprimer la dernière étape d\'une direction et retourne false', () => {
    const { result } = renderHook(() => useTrajets(sample))
    let ok
    act(() => { ok = result.current.removeTrajetStep('retour', 0) })
    expect(ok).toBe(false)
    expect(result.current.trajets.retour).toHaveLength(1)
  })

  it('les deux directions restent indépendantes après plusieurs opérations', () => {
    const { result } = renderHook(() => useTrajets(sample))
    act(() => result.current.addTrajetStep('retour', { time: '13:00', place: 'Pause', note: '', color: '#cf7d3c' }))
    act(() => result.current.removeTrajetStep('aller', 0))
    expect(result.current.trajets.retour).toHaveLength(2)
    expect(result.current.trajets.aller).toHaveLength(1)
    expect(result.current.trajets.aller[0]).toEqual(sample.aller[1])
  })
})
