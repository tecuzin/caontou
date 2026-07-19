import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Trajet } from '../screens/Trajet.jsx'
import { s } from '../utils.js'

const base = {
  sx: s, trajetDir: 'aller', setTrajetDir: () => {}, trip: { start: '2026-08-05', end: '2026-08-15' },
  fmtDayShort: () => 'Mer 5', trajets: { aller: [], retour: [] }, tr: { done: 0, total: 0, items: [] },
  carGames: { cowLeft: 0, cowRight: 0, plates: {} },
  bumpCow: () => {}, resetCows: () => {},
}

describe('Trajet — jeux de route', () => {
  it('I-Spy affiche un défi au tap', () => {
    render(<Trajet {...base} togglePlate={() => {}} resetPlates={() => {}} />)
    expect(screen.getByTestId('ispy-prompt').textContent).toMatch(/Tape pour/)
    fireEvent.click(screen.getByTestId('btn-ispy'))
    expect(screen.getByTestId('ispy-prompt').textContent).not.toMatch(/Tape pour/)
  })

  it('plaques : compteur et toggle', () => {
    const togglePlate = vi.fn()
    render(<Trajet {...base} carGames={{ cowLeft: 0, cowRight: 0, plates: { 15: true } }} togglePlate={togglePlate} resetPlates={() => {}} />)
    expect(screen.getByTestId('plate-progress').textContent).toBe('1/12')
    expect(screen.getByTestId('plate-15')).toHaveAttribute('data-spotted', '1')
    expect(screen.getByTestId('plate-63')).toHaveAttribute('data-spotted', '0')
    fireEvent.click(screen.getByTestId('plate-63'))
    expect(togglePlate).toHaveBeenCalledWith('63')
  })
})
