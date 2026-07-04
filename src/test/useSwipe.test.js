import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSwipe } from '../hooks/useSwipe.js'

const touchStart = (x, y) => ({ touches: [{ clientX: x, clientY: y }] })
const touchEnd = (x, y) => ({ changedTouches: [{ clientX: x, clientY: y }] })

describe('useSwipe()', () => {
  it('déclenche onSwipeLeft quand le doigt glisse vers la gauche au-delà du seuil', () => {
    const onLeft = vi.fn()
    const onRight = vi.fn()
    const { result } = renderHook(() => useSwipe(onLeft, onRight))
    result.current.onTouchStart(touchStart(300, 400))
    result.current.onTouchEnd(touchEnd(200, 400)) // -100px
    expect(onLeft).toHaveBeenCalledTimes(1)
    expect(onRight).not.toHaveBeenCalled()
  })

  it('déclenche onSwipeRight quand le doigt glisse vers la droite au-delà du seuil', () => {
    const onLeft = vi.fn()
    const onRight = vi.fn()
    const { result } = renderHook(() => useSwipe(onLeft, onRight))
    result.current.onTouchStart(touchStart(100, 400))
    result.current.onTouchEnd(touchEnd(220, 400)) // +120px
    expect(onRight).toHaveBeenCalledTimes(1)
    expect(onLeft).not.toHaveBeenCalled()
  })

  it('ignore un déplacement sous le seuil (tap normal, pas de conflit avec les clics)', () => {
    const onLeft = vi.fn()
    const onRight = vi.fn()
    const { result } = renderHook(() => useSwipe(onLeft, onRight))
    result.current.onTouchStart(touchStart(200, 400))
    result.current.onTouchEnd(touchEnd(215, 400)) // +15px, sous le seuil de 50px
    expect(onLeft).not.toHaveBeenCalled()
    expect(onRight).not.toHaveBeenCalled()
  })

  it('ignore un geste trop vertical (scroll), même avec un grand deltaX', () => {
    const onLeft = vi.fn()
    const onRight = vi.fn()
    const { result } = renderHook(() => useSwipe(onLeft, onRight))
    result.current.onTouchStart(touchStart(200, 100))
    result.current.onTouchEnd(touchEnd(280, 400)) // dx=80 mais dy=300, bien plus vertical
    expect(onLeft).not.toHaveBeenCalled()
    expect(onRight).not.toHaveBeenCalled()
  })

  it('ne fait rien si onTouchEnd est appelé sans onTouchStart préalable', () => {
    const onLeft = vi.fn()
    const onRight = vi.fn()
    const { result } = renderHook(() => useSwipe(onLeft, onRight))
    expect(() => result.current.onTouchEnd(touchEnd(300, 400))).not.toThrow()
    expect(onLeft).not.toHaveBeenCalled()
    expect(onRight).not.toHaveBeenCalled()
  })

  it('ne lève pas d\'exception si le callback correspondant est absent (null)', () => {
    const { result } = renderHook(() => useSwipe(null, null))
    result.current.onTouchStart(touchStart(300, 400))
    expect(() => result.current.onTouchEnd(touchEnd(100, 400))).not.toThrow()
  })

  it('réinitialise le point de départ après chaque swipe (pas d\'état persistant erroné)', () => {
    const onLeft = vi.fn()
    const { result } = renderHook(() => useSwipe(onLeft, null))
    result.current.onTouchStart(touchStart(300, 400))
    result.current.onTouchEnd(touchEnd(200, 400))
    expect(onLeft).toHaveBeenCalledTimes(1)
    // Un deuxième onTouchEnd sans nouveau onTouchStart ne doit rien redéclencher
    result.current.onTouchEnd(touchEnd(100, 400))
    expect(onLeft).toHaveBeenCalledTimes(1)
  })
})
