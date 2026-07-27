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
    // L'import unitaire a été remplacé par un import EN LOT (pickPhotos).
    const pickPhotos = vi.fn().mockResolvedValue({ imported: 3, failed: 0 })
    render(<Souvenirs {...baseProps} capturePhoto={capturePhoto} pickPhotos={pickPhotos} photos={[]} />)
    await user.click(screen.getAllByTestId('btn-import-photos-batch')[1])
    expect(pickPhotos).toHaveBeenCalled()
    expect(await screen.findByTestId('import-note')).toHaveTextContent('3 photo(s) importée(s)')
  })

  it('annonce le bilan réel quand des photos sont illisibles', async () => {
    const user = userEvent.setup()
    const pickPhotos = vi.fn().mockResolvedValue({ imported: 2, failed: 1 })
    render(<Souvenirs {...baseProps} pickPhotos={pickPhotos} photos={[]} />)
    await user.click(screen.getByTestId('btn-import-photos-batch'))
    // Le bilan ne doit PAS laisser croire à un succès complet.
    expect(await screen.findByTestId('import-note')).toHaveTextContent('2 importée(s), 1 illisible(s)')
  })

  it('ne casse pas si pickPhotos n’est pas fourni', async () => {
    const user = userEvent.setup()
    render(<Souvenirs {...baseProps} photos={[]} />)
    await user.click(screen.getByTestId('btn-import-photos-batch'))
    expect(screen.queryByTestId('import-note')).toBeNull()
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
