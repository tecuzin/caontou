import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { computeRecap, buildRecapText } from '../recap.js'
import { Visites } from '../screens/Visites.jsx'
import { s } from '../utils.js'

const visits = [
  { id: 1, emoji: '🌉', name: 'Pas de Cère', cat: 'Nature', dist: '30 min', dur: '1 h', age: '4 ans' },
  { id: 2, emoji: '🚠', name: 'Le Lioran', cat: 'Nature', dist: '45 min', dur: '½ j', age: 'Tous' },
  { id: 3, emoji: '🏰', name: 'Château', cat: 'Patrimoine', dist: '20 min', dur: '1 h', age: 'Tous' },
]
const recapBase = {
  days: [{}], spent: 0, budgetTotal: 100, spentPct: 0, budgetCats: [],
  savedCount: 0, packPct: 0, coursesPct: 0, meals: [], photos: [],
}

describe('computeRecap — notes de visite', () => {
  it('classe les coups de cœur (≥4★) et les « à revoir » (≤2★)', () => {
    const ratings = { 1: { stars: 5 }, 2: { stars: 2 }, 3: { stars: 4, note: 'Superbe' } }
    const r = computeRecap({ ...recapBase, ratings, visits })
    expect(r.ratedCount).toBe(3)
    expect(r.topRated.map((x) => x.name)).toEqual(['Pas de Cère', 'Château'])
    expect(r.topRated[0].stars).toBe(5)
    expect(r.toAvoid.map((x) => x.name)).toEqual(['Le Lioran'])
  })

  it('sans note : listes vides', () => {
    const r = computeRecap({ ...recapBase, ratings: {}, visits })
    expect(r.ratedCount).toBe(0)
    expect(r.topRated).toEqual([])
  })

  it('buildRecapText inclut les coups de cœur', () => {
    const r = computeRecap({ ...recapBase, ratings: { 1: { stars: 5 } }, visits })
    expect(buildRecapText(r)).toContain('Coups de cœur : Pas de Cère (5★)')
  })
})

describe('Visites — notation par étoiles', () => {
  const baseProps = {
    sx: s, savedCount: 0, filter: 'Tous', setFilter: () => {}, visitSort: null, setVisitSort: () => {},
    filteredVisits: [visits[0]], saved: {},
    setEditingVisitId: () => {}, setNewVisitName: () => {}, setNewVisitDist: () => {}, setNewVisitDur: () => {},
    setNewVisitAge: () => {}, setNewVisitCat: () => {}, setShowVisitEdit: () => {},
    toggleSaved: () => {}, editVisit: () => {}, deleteVisit: () => {},
  }

  it('note une visite au clic sur une étoile', async () => {
    const user = userEvent.setup()
    const rateVisit = vi.fn()
    render(<Visites {...baseProps} ratings={{}} rateVisit={rateVisit} setVisitNote={() => {}} />)
    await user.click(screen.getByLabelText('Noter Pas de Cère 4 sur 5'))
    expect(rateVisit).toHaveBeenCalledWith(1, 4)
  })

  it('reclique la note actuelle → remet à 0', async () => {
    const user = userEvent.setup()
    const rateVisit = vi.fn()
    render(<Visites {...baseProps} ratings={{ 1: { stars: 3 } }} rateVisit={rateVisit} setVisitNote={() => {}} />)
    await user.click(screen.getByLabelText('Noter Pas de Cère 3 sur 5'))
    expect(rateVisit).toHaveBeenCalledWith(1, 0)
  })

  it('saisit un commentaire', async () => {
    const user = userEvent.setup()
    const setVisitNote = vi.fn()
    render(<Visites {...baseProps} ratings={{}} rateVisit={() => {}} setVisitNote={setVisitNote} />)
    await user.type(screen.getByTestId('visit-note-1'), 'X')
    expect(setVisitNote).toHaveBeenCalledWith(1, 'X')
  })
})
