import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatParkedAt, hasCarSpot } from '../carspot.js'
import { mapsCoordsHref } from '../links.js'
import { CarSpot } from '../components/CarSpot.jsx'
import { s } from '../utils.js'

describe('carspot (pur)', () => {
  it('hasCarSpot valide les coordonnées', () => {
    expect(hasCarSpot(null)).toBe(false)
    expect(hasCarSpot({ lat: 44.9, lng: 2.6 })).toBe(true)
    expect(hasCarSpot({ lat: 'x', lng: 2 })).toBe(false)
    expect(hasCarSpot({ lat: NaN, lng: 2 })).toBe(false)
  })

  it('formatParkedAt : aujourd\'hui / hier / date', () => {
    const now = new Date(2026, 7, 10, 18, 0)
    expect(formatParkedAt(new Date(2026, 7, 10, 14, 5).getTime(), now)).toBe('Garée à 14:05')
    expect(formatParkedAt(new Date(2026, 7, 9, 9, 30).getTime(), now)).toBe('Garée hier à 09:30')
    expect(formatParkedAt(new Date(2026, 7, 7, 16, 0).getTime(), now)).toBe('Garée le 07/08 à 16:00')
    expect(formatParkedAt(0, now)).toBe('')
  })

  it('mapsCoordsHref construit un lien Maps vers le point', () => {
    expect(mapsCoordsHref(44.9, 2.6)).toContain('query=44.9,2.6')
    expect(mapsCoordsHref(NaN, 2)).toBeNull()
  })
})

describe('CarSpot (UI)', () => {
  const setup = (carSpot) => {
    const props = { sx: s, carSpot, parkCar: vi.fn(), findCar: vi.fn(), forgetCar: vi.fn() }
    render(<CarSpot {...props} />)
    return props
  }

  it('état vide : bouton « J\'ai garé ici »', async () => {
    const user = userEvent.setup()
    const p = setup(null)
    expect(screen.queryByTestId('btn-find-car')).toBeNull()
    await user.click(screen.getByTestId('btn-park-car'))
    expect(p.parkCar).toHaveBeenCalled()
  })

  it('garée : retour, re-mémorisation et oubli', async () => {
    const user = userEvent.setup()
    const p = setup({ lat: 45.07, lng: 2.68, at: Date.now() })
    expect(screen.getByText(/Garée à/)).toBeInTheDocument()
    await user.click(screen.getByTestId('btn-find-car'))
    expect(p.findCar).toHaveBeenCalled()
    await user.click(screen.getByTestId('btn-park-again'))
    expect(p.parkCar).toHaveBeenCalled()
    await user.click(screen.getByTestId('btn-forget-car'))
    expect(p.forgetCar).toHaveBeenCalled()
  })
})
