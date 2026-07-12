import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { s } from '../utils.js'
import { EditActivityModal } from '../modals/EditActivityModal.jsx'
import { EditDayModal } from '../modals/EditDayModal.jsx'
import { EditMeteoModal } from '../modals/EditMeteoModal.jsx'
import { EditBudgetModal } from '../modals/EditBudgetModal.jsx'
import { AddMealModal } from '../modals/AddMealModal.jsx'
import { AddCourseItemModal } from '../modals/AddCourseItemModal.jsx'

describe('EditActivityModal', () => {
  const base = { isOpen: true, editIdx: 0, activities: [], editActivityLabel: 'Balade', setEditActivityLabel: vi.fn(), editActivityTime: '14:00', setEditActivityTime: vi.fn(), onSubmit: vi.fn(), onClose: vi.fn(), onDelete: vi.fn() }

  it('ne rend rien si fermé ou sans index', () => {
    const { container } = render(<EditActivityModal {...base} isOpen={false} sx={s} />)
    expect(container.firstChild).toBeNull()
    const { container: c2 } = render(<EditActivityModal {...base} editIdx={null} sx={s} />)
    expect(c2.firstChild).toBeNull()
  })

  it('édite, modifie et supprime', async () => {
    const p = { ...base, setEditActivityLabel: vi.fn(), onSubmit: vi.fn(), onClose: vi.fn(), onDelete: vi.fn() }
    const user = userEvent.setup()
    render(<EditActivityModal {...p} sx={s} />)
    expect(screen.getByText('Éditer activité')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/Balade, musée/), { target: { value: 'Musée' } })
    expect(p.setEditActivityLabel).toHaveBeenCalledWith('Musée')
    await user.click(screen.getByText('✓ Modifier'))
    expect(p.onSubmit).toHaveBeenCalledOnce()
    expect(p.onClose).toHaveBeenCalledOnce()
    await user.click(screen.getByText('🗑️ Supprimer'))
    expect(p.onDelete).toHaveBeenCalledOnce()
  })
})

describe('EditDayModal', () => {
  const base = { isOpen: true, editIdx: 0, editTitle: 'Arrivée', setEditTitle: vi.fn(), editSub: 'Gîte', setEditSub: vi.fn(), onSubmit: vi.fn(), onClose: vi.fn() }
  it('modifie titre/sous-titre puis soumet', async () => {
    const p = { ...base, setEditSub: vi.fn(), onSubmit: vi.fn() }
    const user = userEvent.setup()
    render(<EditDayModal {...p} sx={s} />)
    fireEvent.change(screen.getByPlaceholderText(/Installation au gîte/), { target: { value: 'Repos' } })
    expect(p.setEditSub).toHaveBeenCalledWith('Repos')
    await user.click(screen.getByText('✓ Modifier'))
    expect(p.onSubmit).toHaveBeenCalledOnce()
  })
})

describe('EditMeteoModal', () => {
  const base = { isOpen: true, editIdx: 0, editMeteoDay: 'Mer 5', editMeteoTemp: '22', setEditMeteoTemp: vi.fn(), editMeteoIcon: '☀️', setEditMeteoIcon: vi.fn(), editMeteoDesc: 'Beau', setEditMeteoDesc: vi.fn(), onSubmit: vi.fn(), onClose: vi.fn() }
  it('édite température/icône/description', () => {
    const p = { ...base, setEditMeteoTemp: vi.fn(), setEditMeteoIcon: vi.fn() }
    render(<EditMeteoModal {...p} sx={s} />)
    expect(screen.getByText('Éditer météo')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/🌧️/), { target: { value: '⛅' } })
    expect(p.setEditMeteoIcon).toHaveBeenCalledWith('⛅')
  })
})

describe('EditBudgetModal', () => {
  const base = { isOpen: true, newBudgetTotal: '800', setNewBudgetTotal: vi.fn(), budgetTotal: 800, onSubmit: vi.fn(), onClose: vi.fn() }
  it('saisit un montant et enregistre (bouton + touche Entrée)', async () => {
    const p = { ...base, setNewBudgetTotal: vi.fn(), onSubmit: vi.fn() }
    const user = userEvent.setup()
    render(<EditBudgetModal {...p} sx={s} />)
    const input = screen.getByPlaceholderText('800')
    fireEvent.change(input, { target: { value: '900' } })
    expect(p.setNewBudgetTotal).toHaveBeenCalledWith('900')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(p.onSubmit).toHaveBeenCalledOnce()
    await user.click(screen.getByText('Enregistrer'))
    expect(p.onSubmit).toHaveBeenCalledTimes(2)
  })
})

describe('AddMealModal', () => {
  const base = { isOpen: true, newMealDay: 0, setNewMealDay: vi.fn(), newMealType: 'diner', setNewMealType: vi.fn(), newMealLabel: '', setNewMealLabel: vi.fn(), days: [{ title: 'Arrivée' }, { title: 'Rando' }], onSubmit: vi.fn(), onClose: vi.fn() }
  it('choisit jour/type/plat et ajoute', async () => {
    const p = { ...base, setNewMealDay: vi.fn(), setNewMealLabel: vi.fn(), onSubmit: vi.fn() }
    const user = userEvent.setup()
    render(<AddMealModal {...p} sx={s} />)
    expect(screen.getByText('Ajouter un repas')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/Croque-monsieur/), { target: { value: 'Aligot' } })
    expect(p.setNewMealLabel).toHaveBeenCalledWith('Aligot')
    await user.click(screen.getByText('✓ Ajouter'))
    expect(p.onSubmit).toHaveBeenCalledOnce()
  })
})

describe('AddCourseItemModal', () => {
  const groups = [{ key: 'frais', name: 'Frais' }]
  const base = { isOpen: true, selectedCourseKey: 'frais', newCourseItem: '', setNewCourseItem: vi.fn(), courseGroups: groups, onSubmit: vi.fn(), onClose: vi.fn() }
  it('ne rend rien sans catégorie sélectionnée', () => {
    const { container } = render(<AddCourseItemModal {...base} selectedCourseKey={null} sx={s} />)
    expect(container.firstChild).toBeNull()
  })
  it('affiche la catégorie cible et ajoute un article', async () => {
    const p = { ...base, setNewCourseItem: vi.fn(), onSubmit: vi.fn() }
    const user = userEvent.setup()
    render(<AddCourseItemModal {...p} sx={s} />)
    expect(screen.getByText('Ajouter à Frais')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/Fromage/), { target: { value: 'Lait' } })
    expect(p.setNewCourseItem).toHaveBeenCalledWith('Lait')
    await user.click(screen.getByText('✓ Ajouter'))
    expect(p.onSubmit).toHaveBeenCalledOnce()
  })
})
