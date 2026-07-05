import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLogi } from '../hooks/useLogi.js'

const sample = [
  { key: 've', name: 'Valise enfants', emoji: '🧒', items: ['Bodies', 'Pulls'] },
  { key: 'va', name: 'Valise adultes', emoji: '🎒', items: ['Chaussures'] },
]

describe('useLogi()', () => {
  it('initialise avec les listes fournies', () => {
    const { result } = renderHook(() => useLogi(sample))
    expect(result.current.logi).toEqual(sample)
  })

  it('utilise LOGI_INITIAL par défaut si rien n\'est fourni', () => {
    const { result } = renderHook(() => useLogi(null))
    expect(result.current.logi.length).toBeGreaterThan(0)
  })

  it('addLogiList ajoute une liste avec une clé unique', () => {
    const { result } = renderHook(() => useLogi(sample))
    let key
    act(() => { key = result.current.addLogiList('Pharmacie', '🩹') })
    expect(result.current.logi).toHaveLength(3)
    expect(result.current.logi[2]).toEqual({ key, name: 'Pharmacie', emoji: '🩹', items: [] })
  })

  it('addLogiList utilise un emoji par défaut si non fourni', () => {
    const { result } = renderHook(() => useLogi(sample))
    act(() => result.current.addLogiList('Divers', ''))
    expect(result.current.logi[2].emoji).toBe('📦')
  })

  it('removeLogiList supprime la liste et retourne true', () => {
    const { result } = renderHook(() => useLogi(sample))
    let ok
    act(() => { ok = result.current.removeLogiList('ve') })
    expect(ok).toBe(true)
    expect(result.current.logi).toHaveLength(1)
    expect(result.current.logi[0].key).toBe('va')
  })

  it('removeLogiList refuse de supprimer la dernière liste et retourne false', () => {
    const { result } = renderHook(() => useLogi([sample[0]]))
    let ok
    act(() => { ok = result.current.removeLogiList('ve') })
    expect(ok).toBe(false)
    expect(result.current.logi).toHaveLength(1)
  })

  it('addLogiItem ajoute un article à la bonne liste uniquement', () => {
    const { result } = renderHook(() => useLogi(sample))
    act(() => result.current.addLogiItem('ve', 'Doudou'))
    expect(result.current.logi[0].items).toEqual(['Bodies', 'Pulls', 'Doudou'])
    expect(result.current.logi[1].items).toEqual(['Chaussures'])
  })

  it('removeLogiItem retire un article de la bonne liste uniquement', () => {
    const { result } = renderHook(() => useLogi(sample))
    act(() => result.current.removeLogiItem('ve', 'Bodies'))
    expect(result.current.logi[0].items).toEqual(['Pulls'])
    expect(result.current.logi[1].items).toEqual(['Chaussures'])
  })
})
