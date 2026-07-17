import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFeatures } from '../hooks/useFeatures.js'

describe('useFeatures()', () => {
  it('tout activé par défaut', () => {
    const { result } = renderHook(() => useFeatures())
    expect(result.current.isOn('tab_repas')).toBe(true)
    expect(result.current.features).toEqual({})
  })

  it('initialise avec les fonctions coupées fournies', () => {
    const { result } = renderHook(() => useFeatures({ tab_budget: false }))
    expect(result.current.isOn('tab_budget')).toBe(false)
    expect(result.current.isOn('tab_repas')).toBe(true)
  })

  it('toggleFeature coupe puis réactive (retour au défaut)', () => {
    const { result } = renderHook(() => useFeatures())
    act(() => result.current.toggleFeature('mod_carte'))
    expect(result.current.isOn('mod_carte')).toBe(false)
    expect(result.current.features).toEqual({ mod_carte: false })
    act(() => result.current.toggleFeature('mod_carte'))
    expect(result.current.isOn('mod_carte')).toBe(true)
    expect(result.current.features).toEqual({}) // ne garde pas de true inutile
  })
})
