import { describe, it, expect } from 'vitest'
import { buildAlbumHtml, albumHasContent, escapeHtml, albumFilename } from '../album.js'

const DAYS = [
  { dow: 'Mer', num: 5, title: 'Arrivée au gîte', sub: '', items: [] },
  { dow: 'Jeu', num: 6, title: 'Pas de Cère', sub: '', items: [] },
]
const TRIP = { start: '2026-08-05', end: '2026-08-15', destination: 'Vezels-Roussy (Cantal)' }

describe('escapeHtml()', () => {
  it('échappe les caractères dangereux', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
    expect(escapeHtml("a & b ' c")).toBe('a &amp; b &#39; c')
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
  })
})

describe('albumHasContent()', () => {
  it('faux sans journal ni photo', () => {
    expect(albumHasContent(DAYS, {}, [])).toBe(false)
  })
  it('vrai si une entrée de journal est remplie', () => {
    expect(albumHasContent(DAYS, { 'Mer 5': { best: 'la cascade' } }, [])).toBe(true)
  })
  it('vrai si un groupe de photos est non vide', () => {
    expect(albumHasContent(DAYS, {}, [{ key: 'Mer 5', label: 'x', photos: [{ id: '1' }] }])).toBe(true)
  })
  it('faux si le groupe de photos est vide', () => {
    expect(albumHasContent(DAYS, {}, [{ key: 'Mer 5', label: 'x', photos: [] }])).toBe(false)
  })
})

describe('buildAlbumHtml()', () => {
  it('produit un document HTML autonome avec couverture (destination + dates)', () => {
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, journal: { 'Mer 5': { text: 'Belle arrivée' } }, photosByDay: [], srcMap: {} })
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('<style>')
    expect(html).toContain('Vezels-Roussy (Cantal)')
    expect(html).toMatch(/5\s*–\s*15 août 2026/)
  })

  it('inclut le titre du jour et le texte du journal', () => {
    const journal = { 'Mer 5': { mood: '😍', text: 'On a pique-niqué', best: 'la cascade', quote: 'encore !' } }
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, journal, photosByDay: [], srcMap: {} })
    expect(html).toContain('Mer 5 — Arrivée au gîte')
    expect(html).toContain('On a pique-niqué')
    expect(html).toContain('la cascade')
    expect(html).toContain('encore !')
    expect(html).toContain('😍')
  })

  it('respecte l\'ordre du planning et ignore les jours vides', () => {
    const journal = { 'Jeu 6': { best: 'sommet' }, 'Mer 5': { best: 'cantou' } }
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, journal, photosByDay: [], srcMap: {} })
    expect(html.indexOf('Mer 5')).toBeLessThan(html.indexOf('Jeu 6'))
    const html2 = buildAlbumHtml({ trip: TRIP, days: DAYS, journal: { 'Mer 5': { best: 'x' } }, photosByDay: [], srcMap: {} })
    expect(html2).not.toContain('Pas de Cère')
  })

  it('échappe le texte utilisateur (pas d\'injection HTML)', () => {
    const journal = { 'Mer 5': { text: '<img src=x onerror=alert(1)>' } }
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, journal, photosByDay: [], srcMap: {} })
    expect(html).not.toContain('<img src=x onerror=alert(1)>')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('embarque une photo seulement si sa data-URL est disponible', () => {
    const photosByDay = [{ key: 'Mer 5', label: 'x', photos: [{ id: 'p1', file: 'a.jpg' }, { id: 'p2', file: 'b.jpg' }] }]
    const srcMap = { p1: 'data:image/jpeg;base64,AAAA', p2: 'file:///local/b.jpg' }
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, journal: {}, photosByDay, srcMap })
    expect(html).toContain('data:image/jpeg;base64,AAAA')
    expect(html).not.toContain('file:///local/b.jpg')
  })

  it('reste valide sans aucun contenu', () => {
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, journal: {}, photosByDay: [], srcMap: {} })
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('Aucun souvenir')
  })
})

describe('albumFilename()', () => {
  it('nom horodaté .html', () => {
    expect(albumFilename(new Date('2026-08-16T10:00:00Z'))).toBe('cantou-album-2026-08-16.html')
  })
})
