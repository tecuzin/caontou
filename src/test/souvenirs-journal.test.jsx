import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Souvenirs } from '../screens/Souvenirs.jsx'
import { s } from '../utils.js'

const days = [
  { dow: 'Mer', num: 5, title: 'Arrivée', items: [] },
  { dow: 'Jeu', num: 6, title: 'Pas de Cère', items: [] },
]
const baseProps = {
  sx: s, photos: [], days, srcMap: {},
  capturePhoto: vi.fn(), deletePhoto: vi.fn(), loadSrc: vi.fn(), shareDay: vi.fn(),
}

describe('Souvenirs — lien vers le journal du calendrier', () => {
  it('n\'affiche pas la section sans entrée de journal', () => {
    render(<Souvenirs {...baseProps} journal={{}} openDayJournal={vi.fn()} />)
    expect(screen.queryByTestId('souvenirs-journal')).toBeNull()
  })

  it('liste les jours avec journal et renvoie au bon jour du calendrier', async () => {
    const user = userEvent.setup()
    const openDayJournal = vi.fn()
    render(
      <Souvenirs
        {...baseProps}
        journal={{ 'Jeu 6': { text: 'Superbe rando à la cascade' } }}
        openDayJournal={openDayJournal}
      />,
    )
    expect(screen.getByTestId('souvenirs-journal')).toBeInTheDocument()
    expect(screen.getByText(/Superbe rando/)).toBeInTheDocument()
    // Jeu 6 est l'index 1 dans days
    await user.click(screen.getByTestId('journal-link-1'))
    expect(openDayJournal).toHaveBeenCalledWith(1)
  })
})

describe('Souvenirs — album souvenir', () => {
  it('cache le bouton album sans aucun contenu', () => {
    render(<Souvenirs {...baseProps} journal={{}} openDayJournal={vi.fn()} />)
    expect(screen.queryByTestId('btn-album')).toBeNull()
  })

  it('affiche le bouton album dès qu\'il y a du journal', () => {
    render(<Souvenirs {...baseProps} journal={{ 'Mer 5': { best: 'la cascade' } }} openDayJournal={vi.fn()} trip={{ start: '2026-08-05', end: '2026-08-15', destination: 'Vezels-Roussy' }} />)
    expect(screen.getByTestId('btn-album')).toBeInTheDocument()
  })
})
