import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMeteo } from '../hooks/useMeteo.js'

const sample = [
  { d: 'Mer', n: 5, icon: '☀️', hi: 26, lo: 14, rain: '5 %' },
  { d: 'Jeu', n: 6, icon: '⛅', hi: 24, lo: 13, rain: '15 %' },
]

describe('useMeteo()', () => {
  it('initialise avec les prévisions fournies', () => {
    const { result } = renderHook(() => useMeteo(sample))
    expect(result.current.meteo).toEqual(sample)
  })

  it('utilise METEO_INITIAL par défaut si rien n\'est fourni', () => {
    const { result } = renderHook(() => useMeteo(null))
    expect(result.current.meteo.length).toBeGreaterThan(0)
  })

  it('addMeteoDay ajoute un jour à la fin', () => {
    const { result } = renderHook(() => useMeteo(sample))
    act(() => result.current.addMeteoDay({ d: 'Ven', n: 7, icon: '☀️', hi: 25, lo: 13, rain: '10 %' }))
    expect(result.current.meteo).toHaveLength(3)
    expect(result.current.meteo[2].d).toBe('Ven')
  })

  it('updateMeteoDay modifie le jour à l\'index donné sans toucher aux autres', () => {
    const { result } = renderHook(() => useMeteo(sample))
    act(() => result.current.updateMeteoDay(0, { hi: 30 }))
    expect(result.current.meteo[0].hi).toBe(30)
    expect(result.current.meteo[0].d).toBe('Mer') // reste inchangé
    expect(result.current.meteo[1]).toEqual(sample[1])
  })

  it('removeMeteoDay supprime le jour et retourne true', () => {
    const { result } = renderHook(() => useMeteo(sample))
    let ok
    act(() => { ok = result.current.removeMeteoDay(1) })
    expect(ok).toBe(true)
    expect(result.current.meteo).toHaveLength(1)
  })

  it('removeMeteoDay refuse de supprimer le dernier jour restant et retourne false', () => {
    const { result } = renderHook(() => useMeteo([sample[0]]))
    let ok
    act(() => { ok = result.current.removeMeteoDay(0) })
    expect(ok).toBe(false)
    expect(result.current.meteo).toHaveLength(1)
  })
})
