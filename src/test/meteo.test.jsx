import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Meteo } from '../screens/Meteo.jsx'
import { s } from '../utils.js'

const trip = { start: '2026-08-05', end: '2026-08-12' }
const meteo = [
  { d: 'Mer', n: 5, icon: '☀️', rain: '10 %', hi: 26, lo: 14 },
  { d: 'Jeu', n: 6, icon: '⛅', rain: '30 %', hi: 22, lo: 12 },
]
const fmtDayShort = (iso) => iso.slice(8, 10)

describe('Écran Météo', () => {
  it('affiche la plage du séjour et une ligne par jour de prévision', () => {
    render(<Meteo sx={s} meteo={meteo} trip={trip} fmtDayShort={fmtDayShort} editMeteo={() => {}} deleteMeteo={() => {}} openAddMeteo={() => {}} />)
    expect(screen.getByText(/Prévisions du 05 au 12/)).toBeInTheDocument()
    expect(screen.getByText('Mer 5')).toBeInTheDocument()
    expect(screen.getByText('Jeu 6')).toBeInTheDocument()
    expect(screen.getByText('☀️')).toBeInTheDocument()
  })

  it('ouvre l\'édition du bon jour au clic sur sa ligne', async () => {
    const editMeteo = vi.fn()
    const user = userEvent.setup()
    render(<Meteo sx={s} meteo={meteo} trip={trip} fmtDayShort={fmtDayShort} editMeteo={editMeteo} deleteMeteo={() => {}} openAddMeteo={() => {}} />)
    await user.click(screen.getByText('Mer 5'))
    expect(editMeteo).toHaveBeenCalledWith(0)
  })

  it('supprime un jour et ouvre l\'ajout', async () => {
    const deleteMeteo = vi.fn()
    const openAddMeteo = vi.fn()
    const user = userEvent.setup()
    render(<Meteo sx={s} meteo={meteo} trip={trip} fmtDayShort={fmtDayShort} editMeteo={() => {}} deleteMeteo={deleteMeteo} openAddMeteo={openAddMeteo} />)
    await user.click(screen.getAllByText('🗑️')[1])
    expect(deleteMeteo).toHaveBeenCalledWith(1)
    await user.click(screen.getByText('+ Ajouter un jour'))
    expect(openAddMeteo).toHaveBeenCalledOnce()
  })
})
