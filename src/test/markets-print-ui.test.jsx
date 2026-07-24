import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarketsCard } from '../components/MarketsCard.jsx'
import { PrintSheet } from '../screens/PrintSheet.jsx'
import { s } from '../utils.js'

describe('MarketsCard — marchés du Carladès', () => {
  it('affiche Vic-sur-Cère et Aurillac avec jours/horaires', () => {
    render(<MarketsCard sx={s} />)
    expect(screen.getByTestId('markets-card')).toBeInTheDocument()
    expect(screen.getByTestId('market-Vic-sur-Cère')).toHaveTextContent('Mardi')
    expect(screen.getByTestId('market-Aurillac')).toHaveTextContent('Mercredi')
    // ne mentionne PAS Mandailles (piste corrigée)
    expect(screen.getByTestId('markets-card')).not.toHaveTextContent(/Mandailles/i)
  })
})

describe('PrintSheet — pense-bête du jour', () => {
  const cur = { dow: 'Ven', num: 7, title: 'Mise en jambes', sub: 'Carladès', items: [{ time: '10:00', title: 'Ronesque', note: 'panorama' }] }
  it('compose planning + repas + visites cochées', () => {
    render(<PrintSheet sx={s} cur={cur}
      meals={[{ day: 'Ven 7', dish: 'Truffade' }]}
      visits={[{ id: 1, name: 'Pas de Cère', dist: '30 min' }, { id: 2, name: 'Autre', dist: '1 h' }]}
      saved={{ 1: true }} trip={{ dest: 'Vezels-Roussy' }} />)
    const sheet = screen.getByTestId('screen-print')
    expect(sheet).toHaveTextContent('Ronesque')
    expect(sheet).toHaveTextContent('Truffade')
    expect(sheet).toHaveTextContent('Pas de Cère')
    expect(sheet).not.toHaveTextContent('Autre') // non cochée
    expect(screen.getByTestId('btn-do-print')).toBeInTheDocument()
  })
})
