import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Reglages } from '../screens/Reglages.jsx'
import { s } from '../utils.js'

describe('Reglages — relancer l\'assistant', () => {
  it('affiche le bouton et appelle relaunchOnboarding au clic', async () => {
    const user = userEvent.setup()
    const relaunchOnboarding = vi.fn()
    render(<Reglages sx={s} isOn={() => true} toggleFeature={vi.fn()} relaunchOnboarding={relaunchOnboarding} />)
    await user.click(screen.getByTestId('btn-relaunch-onboarding'))
    expect(relaunchOnboarding).toHaveBeenCalledTimes(1)
  })

  it('masque le bouton si aucun handler fourni', () => {
    render(<Reglages sx={s} isOn={() => true} toggleFeature={vi.fn()} />)
    expect(screen.queryByTestId('btn-relaunch-onboarding')).toBeNull()
  })
})
