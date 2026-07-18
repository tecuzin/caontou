import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddLogiItemModal } from '../modals/AddLogiItemModal.jsx'
import { AddCourseItemModal } from '../modals/AddCourseItemModal.jsx'
import { AddTrajetCheckModal } from '../modals/AddTrajetCheckModal.jsx'

describe('Modales d\'ajout d\'item — Enregistrer & nouveau', () => {
  it('préparatifs : « & nouveau » sauvegarde sans fermer', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(); const onSubmitAndNew = vi.fn(); const onClose = vi.fn()
    render(<AddLogiItemModal isOpen selectedLogiKey="cl_1" newLogiItem="Crème solaire" setNewLogiItem={vi.fn()} logiLists={[{ key: 'cl_1', name: 'Valise' }]} onClose={onClose} onSubmit={onSubmit} onSubmitAndNew={onSubmitAndNew} />)
    await user.click(screen.getByTestId('btn-add-logi-item-new'))
    expect(onSubmitAndNew).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('courses : « & nouveau » sauvegarde sans fermer', async () => {
    const user = userEvent.setup()
    const onSubmitAndNew = vi.fn(); const onClose = vi.fn()
    render(<AddCourseItemModal isOpen selectedCourseKey="co_1" newCourseItem="Pain" setNewCourseItem={vi.fn()} courseGroups={[{ key: 'co_1', name: 'Épicerie' }]} onClose={onClose} onSubmit={vi.fn()} onSubmitAndNew={onSubmitAndNew} />)
    await user.click(screen.getByTestId('btn-add-course-item-new'))
    expect(onSubmitAndNew).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('le bouton « Ajouter » ferme toujours (onSubmit)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AddTrajetCheckModal isOpen newTrajetCheckItem="Pneus" setNewTrajetCheckItem={vi.fn()} onClose={vi.fn()} onSubmit={onSubmit} onSubmitAndNew={vi.fn()} />)
    await user.click(screen.getByText('✓ Ajouter'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('le bouton « & nouveau » est masqué sans handler (rétro-compat)', () => {
    render(<AddTrajetCheckModal isOpen newTrajetCheckItem="x" setNewTrajetCheckItem={vi.fn()} onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.queryByTestId('btn-add-trajet-check-new')).toBeNull()
  })
})
