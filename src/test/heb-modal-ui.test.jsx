import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditHebergementModal } from '../modals/EditHebergementModal.jsx'

const base = {
  isOpen: true, onClose: () => {}, darkMode: false, onSubmit: () => {},
  hebFields: { nom: 'Gîte', adresse: 'Vezels', arrivee: 'Mer 5 · dès 16 h', depart: '', arriveeDate: '', arriveeTime: '', departDate: '', departTime: '' },
}

describe('EditHebergementModal — arrivée/départ avec calendrier + horloge', () => {
  it('affiche des sélecteurs date (calendrier) et heure (horloge)', () => {
    render(<EditHebergementModal {...base} setHebFields={() => {}} />)
    expect(screen.getByTestId('heb-arriveeDate').getAttribute('type')).toBe('date')
    expect(screen.getByTestId('heb-arriveeTime').getAttribute('type')).toBe('time')
    expect(screen.getByTestId('heb-departDate').getAttribute('type')).toBe('date')
    expect(screen.getByTestId('heb-departTime').getAttribute('type')).toBe('time')
  })

  it('choisir une date compose la chaîne affichée + stocke le champ structuré (objet, pas fonction)', () => {
    const setHebFields = vi.fn()
    render(<EditHebergementModal {...base} setHebFields={setHebFields} />)
    fireEvent.change(screen.getByTestId('heb-arriveeDate'), { target: { value: '2026-08-05' } })
    expect(setHebFields).toHaveBeenCalledWith({
      arriveeDate: '2026-08-05', arriveeTime: '', arrivee: 'Mer 5',
    })
    // on passe bien un OBJET (contrat App), jamais une fonction
    expect(typeof setHebFields.mock.calls[0][0]).toBe('object')
  })

  it('montre la valeur actuelle en repli quand aucune date structurée', () => {
    render(<EditHebergementModal {...base} setHebFields={() => {}} />)
    expect(screen.getByText(/Actuel : Mer 5 · dès 16 h/)).toBeInTheDocument()
  })
})
