import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Bilan } from '../screens/Bilan.jsx'
import { s } from '../utils.js'

const recap = {
  daysCount: 8, savedVisits: 3, spent: 420, budgetTotal: 800, spentPct: 53,
  mealsPlanned: 12, packPct: 75, coursesPct: 40, photosCount: 5,
  topCategories: [
    { name: 'Restau', amt: 180 },
    { name: 'Courses', amt: 140 },
    { name: 'Activités', amt: 100 },
  ],
}

describe('Écran Bilan', () => {
  it('affiche les tuiles de statistiques du séjour', () => {
    render(<Bilan sx={s} recap={recap} onShare={() => {}} />)
    expect(screen.getByTestId('screen-bilan')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('jours sur place')).toBeInTheDocument()
    expect(screen.getByText('53 %')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('repas planifiés')).toBeInTheDocument()
  })

  it('affiche la répartition budget (top catégories) et le compte de photos', () => {
    render(<Bilan sx={s} recap={recap} onShare={() => {}} />)
    expect(screen.getByText('Restau')).toBeInTheDocument()
    expect(screen.getByText(/5 photos souvenir/)).toBeInTheDocument()
  })

  it('masque les sections optionnelles quand vides', () => {
    render(<Bilan sx={s} recap={{ ...recap, topCategories: [], photosCount: 0 }} onShare={() => {}} />)
    expect(screen.queryByText('Où est passé le budget')).not.toBeInTheDocument()
    expect(screen.queryByText(/photo.* souvenir/)).not.toBeInTheDocument()
  })

  it('déclenche le partage au clic', async () => {
    const onShare = vi.fn()
    const user = userEvent.setup()
    render(<Bilan sx={s} recap={recap} onShare={onShare} />)
    await user.click(screen.getByTestId('btn-share-recap'))
    expect(onShare).toHaveBeenCalledOnce()
  })

  it('accorde le pluriel « jour » au singulier', () => {
    render(<Bilan sx={s} recap={{ ...recap, daysCount: 1 }} onShare={() => {}} />)
    expect(screen.getByText('jour sur place')).toBeInTheDocument()
  })
})
