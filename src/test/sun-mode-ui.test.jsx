import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Reglages } from '../screens/Reglages.jsx'
import { s } from '../utils.js'

const base = { sx: s, isOn: () => true, toggleFeature: () => {} }

describe('Réglages — bascule « Mode plein soleil »', () => {
  it('affiche l’interrupteur quand setSunMode est fourni', () => {
    render(<Reglages {...base} sunMode={false} setSunMode={() => {}} />)
    const row = screen.getByTestId('reglage-row-sun-mode')
    expect(row).toHaveTextContent('Mode plein soleil')
    expect(row.querySelector('[role="switch"]').getAttribute('aria-checked')).toBe('false')
  })

  it('reflète l’état actif', () => {
    render(<Reglages {...base} sunMode setSunMode={() => {}} />)
    const sw = screen.getByTestId('reglage-row-sun-mode').querySelector('[role="switch"]')
    expect(sw.getAttribute('aria-checked')).toBe('true')
  })

  it('bascule via une mise à jour fonctionnelle (pas d’écrasement d’état)', () => {
    const setSunMode = vi.fn()
    render(<Reglages {...base} sunMode={false} setSunMode={setSunMode} />)
    fireEvent.click(screen.getByTestId('reglage-row-sun-mode').querySelector('[role="switch"]'))
    expect(setSunMode).toHaveBeenCalledTimes(1)
    expect(typeof setSunMode.mock.calls[0][0]).toBe('function')
    expect(setSunMode.mock.calls[0][0](false)).toBe(true)
  })

  it('masque la section si le mode n’est pas câblé', () => {
    render(<Reglages {...base} />)
    expect(screen.queryByTestId('reglage-row-sun-mode')).toBeNull()
  })
})
