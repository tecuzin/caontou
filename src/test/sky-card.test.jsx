import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkyCard } from '../screens/accueil/SkyCard.jsx'
import { s } from '../utils.js'

describe('SkyCard — ciel du jour', () => {
  it('affiche lever, coucher et illumination de la lune', () => {
    render(<SkyCard sx={s} date={new Date('2026-06-21T12:00:00Z')} />)
    expect(screen.getByTestId('sky-card')).toBeInTheDocument()
    // heures au format HH:MM (locale) — présentes et non « — »
    expect(screen.getByTestId('sky-sunrise').textContent).toMatch(/^\d{2}:\d{2}$/)
    expect(screen.getByTestId('sky-sunset').textContent).toMatch(/^\d{2}:\d{2}$/)
    expect(screen.getByTestId('sky-moon').textContent).toMatch(/^\d{1,3}%$/)
  })
})
