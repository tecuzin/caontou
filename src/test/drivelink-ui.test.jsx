import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DriveLink } from '../components/Links.jsx'
import { s } from '../utils.js'

describe('DriveLink — « 🚗 Y aller » (itinéraire voiture)', () => {
  it('rend un lien Maps driving depuis des coordonnées', () => {
    render(<DriveLink sx={s} place={{ lat: 45.02, lng: 2.66, name: 'Pas de Cère' }} />)
    const a = screen.getByTestId('drive-link')
    expect(a.getAttribute('href')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=45.02%2C2.66&travelmode=driving',
    )
    expect(a).toHaveTextContent('Y aller')
  })

  it('utilise l\'adresse texte à défaut de coordonnées, et un libellé custom', () => {
    render(<DriveLink sx={s} place="Vezels-Roussy (15130)" label="Aller au gîte" />)
    const a = screen.getByTestId('drive-link')
    expect(a.getAttribute('href')).toContain('/maps/dir/?api=1&destination=Vezels-Roussy')
    expect(a).toHaveTextContent('Aller au gîte')
  })

  it('ne rend rien sans lieu exploitable', () => {
    const { container } = render(<DriveLink sx={s} place="  " />)
    expect(container.firstChild).toBeNull()
  })
})
