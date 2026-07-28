import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUndo } from '../hooks/useUndo.js'

afterEach(() => { vi.useRealTimers() })

/** Petit harnais : deux tranches de state pilotées par le test. */
function setup(initial = { a: 1, b: 'x' }) {
  const state = { ...initial }
  const setters = {
    a: vi.fn((v) => { state.a = v }),
    b: vi.fn((v) => { state.b = v }),
  }
  const slices = () => ({ a: [state.a, setters.a], b: [state.b, setters.b] })
  return { state, setters, slices }
}

describe('useUndo()', () => {
  it('n’affiche rien tant qu’aucune suppression n’a eu lieu', () => {
    const { slices } = setup()
    const { result } = renderHook(() => useUndo(slices()))
    expect(result.current.undoMsg).toBeNull()
  })

  it('affiche le message puis restaure les valeurs capturées', () => {
    const { state, setters, slices } = setup({ a: 1, b: 'x' })
    const { result, rerender } = renderHook(() => useUndo(slices()))

    act(() => { result.current.offerUndo('Dépense supprimée') })
    expect(result.current.undoMsg).toBe('Dépense supprimée')

    // la suppression a lieu APRÈS l'instantané
    state.a = 999; state.b = 'supprimé'
    rerender()

    act(() => { result.current.applyUndo() })
    expect(setters.a).toHaveBeenCalledWith(1)
    expect(setters.b).toHaveBeenCalledWith('x')
    expect(result.current.undoMsg).toBeNull()
  })

  it('le bandeau disparaît tout seul après le délai', () => {
    vi.useFakeTimers()
    const { slices } = setup()
    const { result } = renderHook(() => useUndo(slices(), 5000))
    act(() => { result.current.offerUndo('Supprimé') })
    act(() => { vi.advanceTimersByTime(5100) })
    expect(result.current.undoMsg).toBeNull()
  })

  it('sans instantané, applyUndo ne fait rien et le signale', () => {
    const { setters, slices } = setup()
    const { result } = renderHook(() => useUndo(slices()))
    let out
    act(() => { out = result.current.applyUndo() })
    expect(out).toBe(false)
    expect(setters.a).not.toHaveBeenCalled()
  })

  it('ne restaure pas deux fois le même instantané', () => {
    const { setters, slices } = setup()
    const { result } = renderHook(() => useUndo(slices()))
    act(() => { result.current.offerUndo('Supprimé') })
    act(() => { result.current.applyUndo() })
    setters.a.mockClear()
    let second
    act(() => { second = result.current.applyUndo() })
    expect(second).toBe(false)
    expect(setters.a).not.toHaveBeenCalled()
  })

  it('une nouvelle suppression remplace l’instantané précédent', () => {
    const { state, setters, slices } = setup({ a: 1, b: 'x' })
    const { result, rerender } = renderHook(() => useUndo(slices()))
    act(() => { result.current.offerUndo('Première') })
    state.a = 2; rerender()
    act(() => { result.current.offerUndo('Deuxième') })   // nouvel instantané : a=2
    state.a = 3; rerender()
    act(() => { result.current.applyUndo() })
    expect(setters.a).toHaveBeenLastCalledWith(2)
  })

  it('appelle le rappel de restauration (haptique) uniquement si ça a restauré', () => {
    const { slices } = setup()
    const onRestore = vi.fn()
    const { result } = renderHook(() => useUndo(slices()))
    act(() => { result.current.applyUndo(onRestore) })
    expect(onRestore).not.toHaveBeenCalled()
    act(() => { result.current.offerUndo('Supprimé') })
    act(() => { result.current.applyUndo(onRestore) })
    expect(onRestore).toHaveBeenCalledTimes(1)
  })

  it('ignore une tranche dont le setter a disparu', () => {
    const { result } = renderHook(() => useUndo({ a: [1, undefined] }))
    act(() => { result.current.offerUndo('Supprimé') })
    expect(() => act(() => { result.current.applyUndo() })).not.toThrow()
  })
})
