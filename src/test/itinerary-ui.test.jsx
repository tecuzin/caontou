import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Itinerary } from '../screens/Itinerary.jsx'
import { s } from '../utils.js'

const visits = [
  { id: 1, emoji: '⛰️', name: 'Puy Mary', dist: '1 h 10' },
  { id: 2, emoji: '🪨', name: 'Rocher de Ronesque', dist: '15 min' },
  { id: 3, emoji: '🌉', name: 'Pas de Cère', dist: '30 min' },
]

describe('Écran Itinéraire du jour', () => {
  it('sans sélection : pas de résumé de route', () => {
    render(<Itinerary sx={s} visits={visits} saved={{}} openMaps={() => {}} />)
    expect(screen.getByTestId('screen-itinerary')).toBeInTheDocument()
    expect(screen.queryByTestId('route-summary')).toBeNull()
  })

  it('pré-sélectionne les favoris et ordonne par proximité', () => {
    render(<Itinerary sx={s} visits={visits} saved={{ 1: true, 2: true }} openMaps={() => {}} />)
    expect(screen.getByTestId('route-summary')).toBeInTheDocument()
    const stops = screen.getAllByTestId('route-stop')
    expect(stops).toHaveLength(2)
    // Ronesque (15 min) avant Puy Mary (1 h 10)
    expect(stops[0]).toHaveTextContent('Rocher de Ronesque')
    expect(stops[1]).toHaveTextContent('Puy Mary')
  })

  it('coche une sortie et ouvre Google Maps', async () => {
    const user = userEvent.setup()
    const openMaps = vi.fn()
    render(<Itinerary sx={s} visits={visits} saved={{}} openMaps={openMaps} />)
    await user.click(screen.getByTestId('pick-visit-3'))
    expect(screen.getByTestId('route-summary')).toBeInTheDocument()
    await user.click(screen.getByTestId('btn-open-maps'))
    expect(openMaps).toHaveBeenCalledTimes(1)
    expect(openMaps.mock.calls[0][0]).toContain('google.com/maps/dir')
  })
})
