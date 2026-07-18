import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Reglages } from '../screens/Reglages.jsx'
import { s } from '../utils.js'

const onEverything = () => true

describe('Reglages — section Parcours (UX)', () => {
  it('affiche le compteur et déclenche partage / reset', async () => {
    const user = userEvent.setup()
    const onShareTracking = vi.fn(); const onResetTracking = vi.fn()
    render(<Reglages sx={s} isOn={onEverything} toggleFeature={vi.fn()} trackingCount={42} onShareTracking={onShareTracking} onResetTracking={onResetTracking} />)
    expect(screen.getByTestId('tracking-count')).toHaveTextContent('42')
    await user.click(screen.getByTestId('btn-share-tracking'))
    expect(onShareTracking).toHaveBeenCalledTimes(1)
    await user.click(screen.getByTestId('btn-reset-tracking'))
    expect(onResetTracking).toHaveBeenCalledTimes(1)
  })

  it('masque la section si la fonction tracking est désactivée', () => {
    const isOn = (k) => k !== 'extra_tracking'
    render(<Reglages sx={s} isOn={isOn} toggleFeature={vi.fn()} onShareTracking={vi.fn()} onResetTracking={vi.fn()} />)
    expect(screen.queryByTestId('tracking-section')).toBeNull()
  })
})
