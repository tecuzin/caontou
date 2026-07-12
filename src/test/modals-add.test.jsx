import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { s } from '../utils.js'
import { AddLogiItemModal } from '../modals/AddLogiItemModal.jsx'
import { AddTrajetCheckModal } from '../modals/AddTrajetCheckModal.jsx'
import { EditHebergementModal } from '../modals/EditHebergementModal.jsx'
import { EditTrajetStepModal } from '../modals/EditTrajetStepModal.jsx'
import { EditMeteoFullModal } from '../modals/EditMeteoFullModal.jsx'

describe('AddLogiItemModal', () => {
  const base = { isOpen: true, selectedLogiKey: 'pharma', newLogiItem: '', setNewLogiItem: vi.fn(), logiLists: [{ key: 'pharma', name: 'Pharmacie' }], onSubmit: vi.fn(), onClose: vi.fn() }
  it('masqué sans liste sélectionnée', () => {
    const { container } = render(<AddLogiItemModal {...base} selectedLogiKey={null} sx={s} />)
    expect(container.firstChild).toBeNull()
  })
  it('ajoute un item à la liste', async () => {
    const p = { ...base, setNewLogiItem: vi.fn(), onSubmit: vi.fn() }
    const user = userEvent.setup()
    render(<AddLogiItemModal {...p} sx={s} />)
    fireEvent.change(screen.getByPlaceholderText(/Trousse de secours/), { target: { value: 'Doliprane' } })
    expect(p.setNewLogiItem).toHaveBeenCalledWith('Doliprane')
    await user.click(screen.getByText('✓ Ajouter'))
    expect(p.onSubmit).toHaveBeenCalledOnce()
  })
})

describe('AddTrajetCheckModal', () => {
  const base = { isOpen: true, newTrajetCheckItem: '', setNewTrajetCheckItem: vi.fn(), onSubmit: vi.fn(), onClose: vi.fn() }
  it('masqué si fermé', () => {
    const { container } = render(<AddTrajetCheckModal {...base} isOpen={false} sx={s} />)
    expect(container.firstChild).toBeNull()
  })
  it('ajoute un point de contrôle', async () => {
    const p = { ...base, setNewTrajetCheckItem: vi.fn(), onSubmit: vi.fn(), onClose: vi.fn() }
    const user = userEvent.setup()
    render(<AddTrajetCheckModal {...p} sx={s} />)
    fireEvent.change(screen.getByPlaceholderText(/Vérifier les pneus/), { target: { value: 'Plein essence' } })
    expect(p.setNewTrajetCheckItem).toHaveBeenCalledWith('Plein essence')
    await user.click(screen.getByText('✓ Ajouter'))
    expect(p.onSubmit).toHaveBeenCalledOnce()
    await user.click(screen.getByText('Annuler'))
    expect(p.onClose).toHaveBeenCalledOnce()
  })
})

describe('EditHebergementModal', () => {
  const base = { isOpen: true, hebFields: { nom: 'Gîte' }, setHebFields: vi.fn(), onSubmit: vi.fn(), onClose: vi.fn() }
  it('édite un champ et enregistre', async () => {
    const p = { ...base, setHebFields: vi.fn(), onSubmit: vi.fn() }
    const user = userEvent.setup()
    render(<EditHebergementModal {...p} sx={s} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Gîte du Carladès' } })
    expect(p.setHebFields).toHaveBeenCalledOnce()
    await user.click(screen.getByText('Enregistrer'))
    expect(p.onSubmit).toHaveBeenCalledOnce()
  })
})

describe('EditTrajetStepModal', () => {
  const base = { isOpen: true, editingTrajetIdx: 0, newTrajetTime: '08:00', setNewTrajetTime: vi.fn(), newTrajetPlace: 'Lyon', setNewTrajetPlace: vi.fn(), newTrajetNote: '', setNewTrajetNote: vi.fn(), newTrajetColor: '#4a5d3a', setNewTrajetColor: vi.fn(), onSubmit: vi.fn(), onClose: vi.fn() }
  it('masqué sans index', () => {
    const { container } = render(<EditTrajetStepModal {...base} editingTrajetIdx={null} sx={s} />)
    expect(container.firstChild).toBeNull()
  })
  it('édite lieu et couleur puis enregistre', async () => {
    const p = { ...base, setNewTrajetPlace: vi.fn(), onSubmit: vi.fn() }
    const user = userEvent.setup()
    render(<EditTrajetStepModal {...p} sx={s} />)
    fireEvent.change(screen.getByPlaceholderText('Ex : Lyon'), { target: { value: 'Clermont' } })
    expect(p.setNewTrajetPlace).toHaveBeenCalledWith('Clermont')
    await user.click(screen.getByText('Enregistrer'))
    expect(p.onSubmit).toHaveBeenCalledOnce()
  })
})

describe('EditMeteoFullModal', () => {
  const base = { isOpen: true, editingMeteoIdx: 0, newMeteoDay: 'Sam', setNewMeteoDay: vi.fn(), newMeteoNum: '11', setNewMeteoNum: vi.fn(), newMeteoIcon: '☀️', setNewMeteoIcon: vi.fn(), newMeteoHi: '24', setNewMeteoHi: vi.fn(), newMeteoLo: '12', setNewMeteoLo: vi.fn(), newMeteoRain: '10 %', setNewMeteoRain: vi.fn(), onSubmit: vi.fn(), onClose: vi.fn() }
  it('édite les champs météo et enregistre', async () => {
    const p = { ...base, setNewMeteoHi: vi.fn(), onSubmit: vi.fn() }
    const user = userEvent.setup()
    render(<EditMeteoFullModal {...p} sx={s} />)
    fireEvent.change(screen.getByPlaceholderText('24'), { target: { value: '26' } })
    expect(p.setNewMeteoHi).toHaveBeenCalledWith('26')
    await user.click(screen.getByText('Enregistrer'))
    expect(p.onSubmit).toHaveBeenCalledOnce()
  })
})
