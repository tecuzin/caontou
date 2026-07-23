import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Planning } from '../screens/Planning.jsx'
import { s, fmtDayShort } from '../utils.js'

const cur = { dow: 'Ven', num: 7, title: 'Mise en jambes', sub: 'Carladès', items: [] }
const base = {
  sx: s, days: [cur], trip: { start: '2026-08-07', end: '2026-08-15' }, fmtDayShort,
  day: 0, setDay: () => {}, setShowDayAdd: () => {}, cur,
  editDay: () => {}, editActivity: () => {}, deleteActivity: () => {}, startAddActivity: () => {},
  openJournal: () => {}, shareActivity: () => {},
}

describe('Planning — repas du jour dans le calendrier', () => {
  it('affiche le repas daté correspondant au jour', () => {
    render(<Planning {...base} meals={[{ id: 1, day: 'Ven 7', dish: 'Truffade maison' }]} />)
    const banner = screen.getByTestId('planning-day-meal')
    expect(banner).toHaveTextContent('Repas du jour')
    expect(banner).toHaveTextContent('Truffade maison')
  })

  it('masque le bandeau si aucun repas ce jour', () => {
    render(<Planning {...base} meals={[{ id: 2, day: 'Sam 8', dish: 'Aligot' }]} />)
    expect(screen.queryByTestId('planning-day-meal')).toBeNull()
  })

  it('le bandeau ouvre l\'onglet Repas', () => {
    const setTab = vi.fn()
    render(<Planning {...base} meals={[{ id: 1, day: 'Ven 7', dish: 'Truffade' }]} setTab={setTab} />)
    fireEvent.click(screen.getByTestId('planning-day-meal'))
    expect(setTab).toHaveBeenCalledWith('repas')
  })
})
