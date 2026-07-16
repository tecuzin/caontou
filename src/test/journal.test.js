import { describe, it, expect } from 'vitest'
import { buildJournalText, hasJournalEntry, journalSnippet } from '../journal.js'

const DAYS = [
  { dow: 'Mer', num: 5, title: 'Arrivée au gîte', sub: '', items: [] },
  { dow: 'Jeu', num: 6, title: 'Pas de Cère', sub: '', items: [] },
]

describe('Journal de bord', () => {
  it('détecte une entrée remplie', () => {
    expect(hasJournalEntry(undefined)).toBe(false)
    expect(hasJournalEntry({ best: '  ', quote: '' })).toBe(false)
    expect(hasJournalEntry({ best: 'la cascade' })).toBe(true)
    expect(hasJournalEntry({ mood: '😊' })).toBe(true)
    expect(hasJournalEntry({ text: 'Belle journée' })).toBe(true)
  })

  it('inclut le récit du jour (texte libre) dans le texte partageable', () => {
    const txt = buildJournalText(DAYS, { 'Mer 5': { text: 'On a pique-niqué au sommet.' } })
    expect(txt).toContain('On a pique-niqué au sommet.')
  })

  it('journalSnippet : extrait court, texte prioritaire, tronqué', () => {
    expect(journalSnippet({ text: 'Court récit', best: 'x' })).toBe('Court récit')
    expect(journalSnippet({})).toBe('')
    expect(journalSnippet({ text: 'a'.repeat(200) }).length).toBeLessThanOrEqual(90)
    expect(journalSnippet({ text: 'a'.repeat(200) }).endsWith('…')).toBe(true)
  })

  it('retourne une chaîne vide si aucun jour rempli', () => {
    expect(buildJournalText(DAYS, {})).toBe('')
  })

  it('compile les jours remplis dans l\'ordre du planning', () => {
    const journal = {
      'Jeu 6': { mood: '😍', best: 'la cascade', quote: 'encore !' },
      'Mer 5': { best: 'le cantou allumé' },
    }
    const text = buildJournalText(DAYS, journal)
    expect(text).toContain('📔 Journal de bord')
    expect(text.indexOf('Mer 5')).toBeLessThan(text.indexOf('Jeu 6'))
    expect(text).toContain('⭐ Moment préféré : la cascade')
    expect(text).toContain('💬 Phrase du jour : encore !')
    expect(text).toContain('Humeur : 😍')
  })

  it('ignore les jours sans entrée', () => {
    const text = buildJournalText(DAYS, { 'Mer 5': { best: 'x' } })
    expect(text).not.toContain('Jeu 6')
  })
})
