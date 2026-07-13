import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModalShell } from '../modals/ModalShell.jsx'

function Harness({ onClose }) {
  return (
    <ModalShell onClose={onClose}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <button data-testid="inside">Contenu</button>
      </div>
    </ModalShell>
  )
}

describe('ModalShell', () => {
  it('ferme au clic sur le backdrop', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<Harness onClose={onClose} />)
    // Le backdrop est le parent presentation du dialog.
    const dialog = screen.getByRole('dialog')
    await user.click(dialog.parentElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ne ferme pas au clic à l\'intérieur de la feuille', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<Harness onClose={onClose} />)
    await user.click(screen.getByTestId('inside'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('ferme à la touche Échap (a11y clavier)', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<Harness onClose={onClose} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('expose un dialog accessible (role=dialog, aria-modal)', () => {
    render(<Harness onClose={() => {}} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
