import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Carte } from '../screens/Carte.jsx'
import { s } from '../utils.js'

const gite = { lat: 44.827, lng: 2.566, name: 'Notre gîte' }
const visits = [
  { id: 1, emoji: '🌉', name: 'Pas de Cère', cat: 'Nature', dist: '30 min', dur: '1 h 30', lat: 45.017, lng: 2.657 },
  { id: 2, emoji: '🚠', name: 'Le Lioran', cat: 'Nature', dist: '45 min', dur: '½ journée', lat: 45.083, lng: 2.744 },
  { id: 3, emoji: '🎪', name: 'Visite sans coords', cat: 'Autre', dist: '10 min', dur: '1 h' }, // pas placée
]

describe('Carte — carte simplifiée hors-ligne', () => {
  it('place le gîte et les visites qui ont des coordonnées', () => {
    render(<Carte sx={s} visits={visits} gite={gite} carSpot={null} savedIds={[]} />)
    expect(screen.getByTestId('map-gite')).toBeInTheDocument()
    expect(screen.getByTestId('map-visit-1')).toBeInTheDocument()
    expect(screen.getByTestId('map-visit-2')).toBeInTheDocument()
    // la visite sans coords n'est pas placée
    expect(screen.queryByTestId('map-visit-3')).toBeNull()
  })

  it('affiche le compteur de progression et marque les visites faites', () => {
    // visite 1 notée (4★) = faite ; visite 2 non notée
    render(<Carte sx={s} visits={visits} gite={gite} carSpot={null} savedIds={[]} ratings={{ 1: { stars: 4 } }} />)
    expect(screen.getByTestId('visit-progress')).toHaveTextContent('1/2 visités')
    expect(screen.getByTestId('map-visit-1')).toHaveAttribute('data-visited', '1')
    expect(screen.getByTestId('map-visit-2')).toHaveAttribute('data-visited', '0')
  })

  it('filtre les visites faites / à faire', async () => {
    const user = userEvent.setup()
    render(<Carte sx={s} visits={visits} gite={gite} carSpot={null} savedIds={[]} ratings={{ 1: { stars: 4 } }} />)
    await user.click(screen.getByTestId('carte-filter-done'))
    expect(screen.getByTestId('map-visit-1')).toBeInTheDocument()
    expect(screen.queryByTestId('map-visit-2')).toBeNull()
    await user.click(screen.getByTestId('carte-filter-todo'))
    expect(screen.queryByTestId('map-visit-1')).toBeNull()
    expect(screen.getByTestId('map-visit-2')).toBeInTheDocument()
  })

  it('n\'affiche pas la voiture sans position mémorisée', () => {
    render(<Carte sx={s} visits={visits} gite={gite} carSpot={null} savedIds={[]} />)
    expect(screen.queryByTestId('map-car')).toBeNull()
  })

  it('affiche la voiture quand carSpot est mémorisé', () => {
    render(<Carte sx={s} visits={visits} gite={gite} carSpot={{ lat: 45.08, lng: 2.74, at: Date.now() }} savedIds={[]} />)
    expect(screen.getByTestId('map-car')).toBeInTheDocument()
  })

  it('affiche le détail d\'une visite au tap', async () => {
    const user = userEvent.setup()
    render(<Carte sx={s} visits={visits} gite={gite} carSpot={null} savedIds={[1]} />)
    await user.click(screen.getByTestId('map-visit-1'))
    const detail = screen.getByTestId('map-selected')
    expect(detail).toHaveTextContent('Pas de Cère')
    expect(detail).toHaveTextContent('30 min · 1 h 30')
  })

  it('propose « M\'y guider » depuis le détail de la voiture', async () => {
    const user = userEvent.setup()
    const findCar = vi.fn()
    render(<Carte sx={s} visits={visits} gite={gite} carSpot={{ lat: 45.08, lng: 2.74, at: Date.now() }} savedIds={[]} findCar={findCar} />)
    await user.click(screen.getByTestId('map-car'))
    await user.click(screen.getByTestId('map-find-car'))
    expect(findCar).toHaveBeenCalled()
  })
})
