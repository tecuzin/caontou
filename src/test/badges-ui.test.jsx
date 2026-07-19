import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badges } from '../screens/Badges.jsx'
import { s } from '../utils.js'

describe('Badges — écran Mes badges', () => {
  it('affiche le compteur et l\'état verrouillé/débloqué', () => {
    const store = () => ({ visits: [{ id: 1 }], ratings: { 1: { stars: 4 } } })
    render(<Badges sx={s} storeData={store} />)
    expect(screen.getByTestId('badges-header')).toBeInTheDocument()
    expect(screen.getByTestId('badge-first-visit')).toHaveAttribute('data-unlocked', '1')
    expect(screen.getByTestId('badge-explorer')).toHaveAttribute('data-unlocked', '0')
  })

  it('rien de débloqué sur un store vide', () => {
    render(<Badges sx={s} storeData={() => ({})} />)
    expect(screen.getByTestId('badge-first-visit')).toHaveAttribute('data-unlocked', '0')
  })
})
