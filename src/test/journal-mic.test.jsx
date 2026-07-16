import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JournalModal } from '../modals/JournalModal.jsx'
import { s } from '../utils.js'

const instances = []
class FakeRecognition {
  constructor() { this.continuous = false; this.interimResults = true; instances.push(this) }
  start() { this.started = true }
  stop() { this.stopped = true; this.onend?.() }
  emitFinal(t) { this.onresult?.({ resultIndex: 0, results: [{ 0: { transcript: t }, isFinal: true, length: 1 }] }) }
}

afterEach(() => { delete window.SpeechRecognition; instances.length = 0 })

const baseProps = {
  isOpen: true, onClose: vi.fn(), sx: s,
  dayLabel: 'Jeu 6 — Pas de Cère', onShare: vi.fn(), canShare: false,
}

describe('JournalModal — dictée vocale', () => {
  it('masque le bouton micro si la plateforme ne sait pas dicter', () => {
    render(<JournalModal {...baseProps} entry={{}} updateEntry={vi.fn()} />)
    expect(screen.queryByTestId('btn-journal-mic')).toBeNull()
  })

  it('dicte : démarre, concatène la bribe au récit, puis s\'arrête', async () => {
    window.SpeechRecognition = FakeRecognition
    const user = userEvent.setup()
    const updateEntry = vi.fn()
    render(<JournalModal {...baseProps} entry={{ text: 'Belle journée.' }} updateEntry={updateEntry} />)

    const mic = screen.getByTestId('btn-journal-mic')
    await user.click(mic)
    expect(instances[0].started).toBe(true)
    expect(mic).toHaveTextContent(/Enregistre/)

    instances[0].emitFinal('On a vu la cascade')
    expect(updateEntry).toHaveBeenCalledWith('text', 'Belle journée. On a vu la cascade')

    await user.click(mic)
    expect(instances[0].stopped).toBe(true)
    expect(screen.getByTestId('btn-journal-mic')).toHaveTextContent(/Dicter/)
  })

  it('affiche une erreur si le micro est refusé', async () => {
    window.SpeechRecognition = FakeRecognition
    const user = userEvent.setup()
    render(<JournalModal {...baseProps} entry={{}} updateEntry={vi.fn()} />)
    await user.click(screen.getByTestId('btn-journal-mic'))
    instances[0].onerror({ error: 'not-allowed' })
    expect(await screen.findByTestId('journal-mic-error')).toHaveTextContent('Micro refusé')
  })
})
