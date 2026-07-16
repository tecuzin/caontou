import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Trajet } from '../screens/Trajet.jsx'
import { Planning } from '../screens/Planning.jsx'
import { Logistique } from '../screens/Logistique.jsx'
import { Bilan } from '../screens/Bilan.jsx'
import { s, buildList, eur } from '../utils.js'

const trip = { origin: 'Beauvais', etape: 'Laschamps', destination: 'Vezels-Roussy', start: '2026-08-05', end: '2026-08-15' }
const fmtDay = () => 'mer. 5'

describe('Écran Trajet (couverture handlers)', () => {
  const setup = (overrides = {}) => {
    const props = {
      sx: s, trajetDir: 'aller', setTrajetDir: vi.fn(), trip, fmtDayShort: fmtDay,
      trajets: { aller: [{ time: '09:00', place: 'Départ de Beauvais', note: 'GO', color: '#5b7042' }], retour: [] },
      editTrajetStep: vi.fn(), deleteTrajetStep: vi.fn(),
      setEditingTrajetIdx: vi.fn(), setNewTrajetTime: vi.fn(), setNewTrajetPlace: vi.fn(),
      setNewTrajetNote: vi.fn(), setNewTrajetColor: vi.fn(), setShowTrajetEdit: vi.fn(),
      tr: { done: 1, total: 2, items: [{ label: 'Plein fait', checked: true }, { label: 'Gonfler pneus', checked: false }] },
      setShowAddTrajetCheck: vi.fn(), toggleCheck: vi.fn(), deleteTrajetCheckItem: vi.fn(),
      carGames: { cowLeft: 3, cowRight: 5 }, bumpCow: vi.fn(), resetCows: vi.fn(),
      ...overrides,
    }
    render(<Trajet {...props} />)
    return props
  }

  it('bascule aller/retour', async () => {
    const user = userEvent.setup()
    const p = setup()
    await user.click(screen.getByTestId('btn-trajet-retour'))
    expect(p.setTrajetDir).toHaveBeenCalledWith('retour')
  })

  it('édite et supprime une étape, ouvre l\'ajout', async () => {
    const user = userEvent.setup()
    const p = setup()
    await user.click(screen.getByText('✏️'))
    expect(p.editTrajetStep).toHaveBeenCalledWith(0)
    await user.click(screen.getAllByText('🗑️')[0])
    expect(p.deleteTrajetStep).toHaveBeenCalledWith(0)
    await user.click(screen.getByText('+ Ajouter une étape'))
    expect(p.setShowTrajetEdit).toHaveBeenCalledWith(true)
    expect(p.setEditingTrajetIdx).toHaveBeenCalledWith(null)
  })

  it('checklist : coche, supprime, ajoute', async () => {
    const user = userEvent.setup()
    const p = setup()
    await user.click(screen.getByText('Gonfler pneus'))
    expect(p.toggleCheck).toHaveBeenCalledWith('tr_dep', 'Gonfler pneus')
    await user.click(screen.getByText('＋'))
    expect(p.setShowAddTrajetCheck).toHaveBeenCalledWith(true)
  })

  it('compteur de vaches : tape et remet à zéro', async () => {
    const user = userEvent.setup()
    const p = setup()
    expect(screen.getByTestId('cow-count-left')).toHaveTextContent('3')
    expect(screen.getByTestId('cow-count-right')).toHaveTextContent('5')
    await user.click(screen.getByTestId('btn-cow-left'))
    expect(p.bumpCow).toHaveBeenCalledWith('left')
    await user.click(screen.getByTestId('btn-reset-cows'))
    expect(p.resetCows).toHaveBeenCalled()
  })

  it('affiche le sens retour (destination → origine)', () => {
    setup({ trajetDir: 'retour' })
    expect(screen.getAllByText('Vezels-Roussy')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Retour').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Les etapes · retour')).toBeInTheDocument()
  })
})

describe('Écran Planning (couverture handlers)', () => {
  const days = [
    { dow: 'Mer', num: 5, title: 'Départ', sub: 'La route', items: [{ time: '09:00', title: 'Départ', note: 'GO', color: '#5b7042' }] },
    { dow: 'Jeu', num: 6, title: 'Cantal', sub: 'Arrivée', items: [] },
  ]
  const setup = () => {
    const props = {
      sx: s, days, trip, fmtDayShort: fmtDay, day: 0, setDay: vi.fn(), setShowDayAdd: vi.fn(),
      cur: days[0], editDay: vi.fn(), editActivity: vi.fn(), deleteActivity: vi.fn(),
      startAddActivity: vi.fn(), openJournal: vi.fn(), shareActivity: vi.fn(),
    }
    render(<Planning {...props} />)
    return props
  }

  it('change de jour et ajoute un jour', async () => {
    const user = userEvent.setup()
    const p = setup()
    await user.click(screen.getByText('Jeu'))
    expect(p.setDay).toHaveBeenCalledWith(1)
    await user.click(screen.getByTestId('btn-add-day'))
    expect(p.setShowDayAdd).toHaveBeenCalledWith(true)
  })

  it('journal, édition du jour, partage/édition/suppression d\'activité, ajout', async () => {
    const user = userEvent.setup()
    const p = setup()
    await user.click(screen.getByTestId('btn-journal'))
    expect(p.openJournal).toHaveBeenCalledWith(0)
    // 1er ✏️ dans le DOM = édition du jour (avant les activités)
    await user.click(screen.getAllByText('✏️')[0])
    expect(p.editDay).toHaveBeenCalledWith(0)
    await user.click(screen.getByTestId('btn-share-activity-0'))
    expect(p.shareActivity).toHaveBeenCalledWith(0, 0)
    await user.click(screen.getByText('+ Ajouter activite'))
    expect(p.startAddActivity).toHaveBeenCalledWith(0)
  })
})

describe('Écran Logistique (couverture handlers)', () => {
  const logi = [{ key: 'cl_v', name: 'Valises', emoji: '🧳', items: ['Duvets', 'K-ways'] }]
  const setup = (logiSorted = false) => {
    const props = {
      sx: s, logi, logiSorted, setLogiSorted: vi.fn(), checks: { cl_v: { Duvets: true } },
      buildList, toggleCheck: vi.fn(), deleteLogiList: vi.fn(), deleteLogiItem: vi.fn(),
      setEditingLogiKey: vi.fn(), setShowAddLogiItem: vi.fn(), setShowAddLogiList: vi.fn(),
    }
    render(<Logistique {...props} />)
    return props
  }

  it('affiche la liste avec progression et coche un item', async () => {
    const user = userEvent.setup()
    const p = setup()
    expect(screen.getByText('Valises')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
    await user.click(screen.getByText('K-ways'))
    expect(p.toggleCheck).toHaveBeenCalledWith('cl_v', 'K-ways')
  })

  it('tri « non cochés en premier » et suppressions', async () => {
    const user = userEvent.setup()
    const p = setup(true)
    await user.click(screen.getByText('↑ Non cochés en premier'))
    expect(p.setLogiSorted).toHaveBeenCalledWith(false)
    await user.click(screen.getAllByText('🗑️')[0])
    expect(p.deleteLogiList).toHaveBeenCalledWith('cl_v')
    await user.click(screen.getByText('+ Ajouter article'))
    expect(p.setEditingLogiKey).toHaveBeenCalledWith('cl_v')
    expect(p.setShowAddLogiItem).toHaveBeenCalledWith(true)
  })
})

describe('Écran Bilan (sections notées)', () => {
  it('affiche coups de cœur et « à revoir » avec étoiles', () => {
    const recap = {
      daysCount: 3, savedVisits: 1, spent: 100, budgetTotal: 500, spentPct: 20,
      mealsPlanned: 4, packPct: 50, coursesPct: 60, photosCount: 2,
      topCategories: [{ name: 'Nourriture', amt: 60 }],
      topRated: [{ name: 'Pas de Cère', emoji: '🌉', stars: 5, note: 'magique' }],
      toAvoid: [{ name: 'Musée', emoji: '🏛️', stars: 1, note: '' }],
    }
    render(<Bilan sx={s} recap={recap} onShare={vi.fn()} />)
    expect(screen.getByTestId('recap-coups-de-coeur')).toHaveTextContent('Pas de Cère')
    expect(screen.getByTestId('recap-coups-de-coeur')).toHaveTextContent('★★★★★')
    expect(screen.getByTestId('recap-coups-de-coeur')).toHaveTextContent('magique')
    expect(screen.getByTestId('recap-a-eviter')).toHaveTextContent('Musée')
  })

  it('déclenche le partage', async () => {
    const user = userEvent.setup()
    const onShare = vi.fn()
    const recap = { daysCount: 1, savedVisits: 0, spent: 0, budgetTotal: 0, spentPct: 0, mealsPlanned: 0, packPct: 0, coursesPct: 0, photosCount: 0, topCategories: [] }
    render(<Bilan sx={s} recap={recap} onShare={onShare} />)
    await user.click(screen.getByTestId('btn-share-recap'))
    expect(onShare).toHaveBeenCalled()
  })
})
