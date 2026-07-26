import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dialect } from '../screens/Dialect.jsx'
import { applyMigrations, LATEST_SCHEMA } from '../migrations.js'
import { DIALECT_WORDS } from '../dialect.js'
import { s } from '../utils.js'

const WORDS = [
  { word: 'Cantou', meaning: 'Le coin du feu', source: 'CNRTL' },
  { word: 'Buron', meaning: 'Cabane du vacher', source: 'Wikipédia' },
]

describe('Dialect — CRUD du lexique', () => {
  it('reste en lecture seule sans setWords', () => {
    render(<Dialect sx={s} words={WORDS} />)
    expect(screen.queryByTestId('dialect-toggle-manage')).toBeNull()
    expect(screen.getByTestId('dialect-card')).toBeInTheDocument()
  })

  it('bascule en gestion et liste les mots', () => {
    render(<Dialect sx={s} words={WORDS} setWords={() => {}} />)
    fireEvent.click(screen.getByTestId('dialect-toggle-manage'))
    expect(screen.getByTestId('dialect-row-0')).toHaveTextContent('Cantou')
    expect(screen.getByTestId('dialect-row-1')).toHaveTextContent('Buron')
  })

  it('ajoute un mot', () => {
    const setWords = vi.fn()
    render(<Dialect sx={s} words={WORDS} setWords={setWords} />)
    fireEvent.click(screen.getByTestId('dialect-toggle-manage'))
    fireEvent.click(screen.getByTestId('dialect-add'))
    fireEvent.change(screen.getByTestId('dialect-input-word'), { target: { value: 'Poutou' } })
    fireEvent.change(screen.getByTestId('dialect-input-meaning'), { target: { value: 'Un bisou' } })
    fireEvent.click(screen.getByTestId('dialect-save'))
    expect(setWords).toHaveBeenCalledTimes(1)
    const next = setWords.mock.calls[0][0]
    expect(next).toHaveLength(3)
    expect(next[2]).toMatchObject({ word: 'Poutou', meaning: 'Un bisou' })
  })

  it('refuse un mot sans libellé ou sans sens', () => {
    const setWords = vi.fn()
    render(<Dialect sx={s} words={WORDS} setWords={setWords} />)
    fireEvent.click(screen.getByTestId('dialect-toggle-manage'))
    fireEvent.click(screen.getByTestId('dialect-add'))
    fireEvent.change(screen.getByTestId('dialect-input-word'), { target: { value: '   ' } })
    fireEvent.click(screen.getByTestId('dialect-save'))
    expect(setWords).not.toHaveBeenCalled()
  })

  it('modifie un mot existant sans toucher aux autres', () => {
    const setWords = vi.fn()
    render(<Dialect sx={s} words={WORDS} setWords={setWords} />)
    fireEvent.click(screen.getByTestId('dialect-toggle-manage'))
    fireEvent.click(screen.getByTestId('dialect-edit-0'))
    fireEvent.change(screen.getByTestId('dialect-input-meaning'), { target: { value: 'La cheminée à bancs' } })
    fireEvent.click(screen.getByTestId('dialect-save'))
    const next = setWords.mock.calls[0][0]
    expect(next[0].meaning).toBe('La cheminée à bancs')
    expect(next[1]).toEqual(WORDS[1])
  })

  it('supprime un mot', () => {
    const setWords = vi.fn()
    render(<Dialect sx={s} words={WORDS} setWords={setWords} />)
    fireEvent.click(screen.getByTestId('dialect-toggle-manage'))
    fireEvent.click(screen.getByTestId('dialect-del-0'))
    expect(setWords.mock.calls[0][0]).toEqual([WORDS[1]])
  })

  it('affiche un état vide explicite', () => {
    render(<Dialect sx={s} words={[]} setWords={() => {}} />)
    expect(screen.getByText(/Lexique vide/)).toBeInTheDocument()
  })
})

describe('Migration v5 → v6 — lexique éditable', () => {
  it('sème le lexique de référence dans le store', () => {
    const out = applyMigrations({}, 5)
    expect(Array.isArray(out.dialectWords)).toBe(true)
    expect(out.dialectWords).toHaveLength(DIALECT_WORDS.length)
    expect(out.schemaVersion).toBe(LATEST_SCHEMA)
  })

  it('NE réécrit PAS un lexique déjà personnalisé', () => {
    const perso = [{ word: 'Mien', meaning: 'à moi' }]
    expect(applyMigrations({ dialectWords: perso }, 5).dialectWords).toEqual(perso)
  })

  it('respecte une liste volontairement vidée', () => {
    expect(applyMigrations({ dialectWords: [] }, 5).dialectWords).toEqual([])
  })
})
