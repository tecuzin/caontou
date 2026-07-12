import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Souvenirs } from '../screens/Souvenirs.jsx'
import { s } from '../utils.js'

const days = [{ dow: 'Mer', num: 5, title: 'Arrivée' }]
const baseProps = {
  sx: s, days, srcMap: {},
  capturePhoto: vi.fn(), deletePhoto: vi.fn(), loadSrc: vi.fn(), shareDay: vi.fn(),
}

describe('Écran Souvenirs', () => {
  it('affiche l\'état vide quand aucune photo', () => {
    render(<Souvenirs {...baseProps} photos={[]} />)
    expect(screen.getByTestId('screen-souvenirs')).toBeInTheDocument()
    expect(screen.getByText(/Aucune photo pour l'instant/)).toBeInTheDocument()
  })

  it('déclenche la prise et l\'import de photo', async () => {
    const capturePhoto = vi.fn()
    const user = userEvent.setup()
    render(<Souvenirs {...baseProps} capturePhoto={capturePhoto} photos={[]} />)
    await user.click(screen.getByTestId('btn-take-photo'))
    expect(capturePhoto).toHaveBeenCalledWith('camera')
    await user.click(screen.getByTestId('btn-import-photo'))
    expect(capturePhoto).toHaveBeenCalledWith('photos')
  })

  it('regroupe les photos et charge leur source, ouvre puis supprime via la visionneuse', async () => {
    const loadSrc = vi.fn()
    const deletePhoto = vi.fn()
    const user = userEvent.setup()
    const photos = [{ id: 'p1', day: 'autres' }]
    render(<Souvenirs {...baseProps} loadSrc={loadSrc} deletePhoto={deletePhoto} photos={photos} />)
    // groupe « Autres photos » + chargement asynchrone de la vignette
    expect(screen.getByText(/Autres photos/)).toBeInTheDocument()
    expect(loadSrc).toHaveBeenCalledWith(photos[0])
    // ouvre la visionneuse plein écran via la vignette (placeholder 🖼️)
    await user.click(screen.getByText('🖼️'))
    expect(screen.getByTestId('photo-viewer')).toBeInTheDocument()
    await user.click(screen.getByTestId('btn-delete-photo'))
    expect(deletePhoto).toHaveBeenCalledWith('p1')
  })

  it('partage une journée de photos', async () => {
    const shareDay = vi.fn()
    const user = userEvent.setup()
    render(<Souvenirs {...baseProps} shareDay={shareDay} photos={[{ id: 'p1', day: 'autres' }]} />)
    await user.click(screen.getByTestId('btn-share-day-autres'))
    expect(shareDay).toHaveBeenCalledOnce()
  })
})
