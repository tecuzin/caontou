import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { useEscapeKey } from '../hooks/useEscapeKey.js'

describe('useEscapeKey', () => {
  it('appelle onClose à la touche Échap', () => {
    const onClose = vi.fn()
    renderHook(() => useEscapeKey(onClose))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ignore les autres touches', () => {
    const onClose = vi.fn()
    renderHook(() => useEscapeKey(onClose))
    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.keyDown(document, { key: 'a' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('ne s\'arme pas quand enabled=false', () => {
    const onClose = vi.fn()
    renderHook(() => useEscapeKey(onClose, false))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('retire l\'écouteur au démontage', () => {
    const onClose = vi.fn()
    const { unmount } = renderHook(() => useEscapeKey(onClose))
    unmount()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
