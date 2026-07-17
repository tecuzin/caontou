import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CarteDetaillee } from '../screens/CarteDetaillee.jsx'
import { s } from '../utils.js'

const gite = { lat: 44.827, lng: 2.566, name: 'Notre gîte' }
const visits = [
  { id: 1, emoji: '🌉', name: 'Pas de Cère', dist: '30 min', dur: '1 h 30', lat: 45.017, lng: 2.657 },
  { id: 2, emoji: '🚠', name: 'Le Lioran', dist: '45 min', dur: '½ j', lat: 45.083, lng: 2.744 },
]

function setOnline(v) {
  Object.defineProperty(navigator, 'onLine', { value: v, configurable: true })
}
afterEach(() => setOnline(true))

describe('CarteDetaillee — carte topographique OpenTopoMap', () => {
  it('en ligne : affiche des tuiles OpenTopoMap, marqueurs et attribution', () => {
    setOnline(true)
    render(<CarteDetaillee sx={s} visits={visits} gite={gite} carSpot={{ lat: 45.08, lng: 2.74, at: Date.now() }} savedIds={[1]} />)
    const imgs = document.querySelectorAll('img[src*="tile.opentopomap.org"]')
    expect(imgs.length).toBeGreaterThan(0)
    expect(screen.getByTestId('detmap-gite')).toBeInTheDocument()
    expect(screen.getByTestId('detmap-visit-1')).toBeInTheDocument()
    expect(screen.getByTestId('detmap-car')).toBeInTheDocument()
    expect(screen.getByText(/données © OpenStreetMap/)).toBeInTheDocument() // attribution obligatoire
  })

  it('hors-ligne : repli sur la carte simplifiée avec bandeau', () => {
    setOnline(false)
    render(<CarteDetaillee sx={s} visits={visits} gite={gite} carSpot={null} savedIds={[]} />)
    expect(screen.getByTestId('carte-offline-banner')).toBeInTheDocument()
    expect(screen.getByTestId('screen-carte')).toBeInTheDocument() // carte simplifiée
    expect(document.querySelectorAll('img[src*="opentopomap"]').length).toBe(0)
  })

  it('tap sur un marqueur affiche son détail', async () => {
    setOnline(true)
    const user = userEvent.setup()
    render(<CarteDetaillee sx={s} visits={visits} gite={gite} carSpot={null} savedIds={[]} />)
    await user.click(screen.getByTestId('detmap-visit-1'))
    expect(screen.getByTestId('detmap-selected')).toHaveTextContent('Pas de Cère')
  })

  it('le bouton + augmente le niveau de zoom des tuiles', async () => {
    setOnline(true)
    const user = userEvent.setup()
    render(<CarteDetaillee sx={s} visits={visits} gite={gite} carSpot={null} savedIds={[]} />)
    const zOf = () => Number(document.querySelector('img[src*="tile.opentopomap.org"]').src.match(/opentopomap\.org\/(\d+)\//)[1])
    const before = zOf()
    await user.click(screen.getByTestId('detmap-zoom-in'))
    expect(zOf()).toBe(before + 1)
  })
})
