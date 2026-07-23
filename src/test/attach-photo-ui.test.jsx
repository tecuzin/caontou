import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AttachPhotoButton } from '../components/AttachPhotoButton.jsx'
import { s } from '../utils.js'

describe('AttachPhotoButton — 📸 sur un élément', () => {
  it('capture une photo en passant le label de l\'élément', () => {
    const capturePhoto = vi.fn()
    render(<AttachPhotoButton sx={s} capturePhoto={capturePhoto} label="Château de Messilhac" />)
    fireEvent.click(screen.getByTestId('btn-attach-photo'))
    expect(capturePhoto).toHaveBeenCalledWith('camera', { label: 'Château de Messilhac' })
  })

  it('sans label, capture sans métadonnée de label', () => {
    const capturePhoto = vi.fn()
    render(<AttachPhotoButton sx={s} capturePhoto={capturePhoto} />)
    fireEvent.click(screen.getByTestId('btn-attach-photo'))
    expect(capturePhoto).toHaveBeenCalledWith('camera', {})
  })

  it('ne rend rien si capturePhoto est absent', () => {
    const { container } = render(<AttachPhotoButton sx={s} label="X" />)
    expect(container.firstChild).toBeNull()
  })
})
