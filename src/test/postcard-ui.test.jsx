import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Postcard } from '../screens/Postcard.jsx'
import { s } from '../utils.js'

describe('Postcard — composeur de carte postale', () => {
  it('affiche le canvas, la légende éditable et se ferme', () => {
    const onClose = vi.fn()
    render(<Postcard sx={s} src={null} defaultCaption="Coucou du Cantal" onClose={onClose} />)
    expect(screen.getByTestId('postcard-canvas')).toBeInTheDocument()
    const input = screen.getByTestId('postcard-caption')
    expect(input.value).toBe('Coucou du Cantal')
    fireEvent.change(input, { target: { value: 'Bisous des montagnes' } })
    expect(input.value).toBe('Bisous des montagnes')
    fireEvent.click(screen.getByTestId('postcard-close'))
    expect(onClose).toHaveBeenCalled()
  })
})
