import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { SavedIndicator } from '../components/SavedIndicator.jsx'
import { s } from '../utils.js'

afterEach(() => { vi.useRealTimers() })

describe('SavedIndicator', () => {
  it('n’affiche rien sans savedAt (pas de faux positif au 1er rendu)', () => {
    render(<SavedIndicator sx={s} />)
    expect(screen.queryByTestId('saved-indicator')).toBeNull()
  })

  it('apparaît quand savedAt est fourni', () => {
    render(<SavedIndicator sx={s} savedAt={1000} />)
    expect(screen.getByTestId('saved-indicator')).toHaveTextContent('Enregistré')
  })

  it('disparaît après le délai', () => {
    vi.useFakeTimers()
    render(<SavedIndicator sx={s} savedAt={1000} duration={2000} />)
    expect(screen.getByTestId('saved-indicator')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(2100) })
    expect(screen.queryByTestId('saved-indicator')).toBeNull()
  })

  it('réapparaît à chaque nouvelle sauvegarde', () => {
    vi.useFakeTimers()
    const { rerender } = render(<SavedIndicator sx={s} savedAt={1000} duration={2000} />)
    act(() => { vi.advanceTimersByTime(2100) })
    expect(screen.queryByTestId('saved-indicator')).toBeNull()
    rerender(<SavedIndicator sx={s} savedAt={2000} duration={2000} />)
    expect(screen.getByTestId('saved-indicator')).toBeInTheDocument()
  })

  it('est annoncé aux lecteurs d’écran sans voler le focus', () => {
    render(<SavedIndicator sx={s} savedAt={1} />)
    const el = screen.getByTestId('saved-indicator')
    expect(el.getAttribute('role')).toBe('status')
    expect(el.getAttribute('aria-live')).toBe('polite')
  })
})
