import { describe, it, expect } from 'vitest'
import { filterAndSortVisits, CAT_ORDER } from '../visits.js'

const visits = [
  { name: 'A', cat: 'Nature', dist: '20 min' },
  { name: 'B', cat: 'Famille', dist: '5 min' },
  { name: 'C', cat: 'Nature', dist: '10 min' },
]

describe('filterAndSortVisits (extrait d\'App.jsx)', () => {
  it('« Tous » ne filtre rien, ordre conservé sans tri', () => {
    const r = filterAndSortVisits(visits, 'Tous', null)
    expect(r.map((v) => v.name)).toEqual(['A', 'B', 'C'])
  })

  it('filtre par catégorie', () => {
    expect(filterAndSortVisits(visits, 'Nature', null).map((v) => v.name)).toEqual(['A', 'C'])
  })

  it('trie par distance croissante', () => {
    expect(filterAndSortVisits(visits, 'Tous', 'dist').map((v) => v.name)).toEqual(['B', 'C', 'A'])
  })

  it('trie par ordre de catégorie (CAT_ORDER)', () => {
    // Nature (index 0) avant Famille (index 1)
    const r = filterAndSortVisits(visits, 'Tous', 'cat')
    expect(r[r.length - 1].cat).toBe('Famille')
    expect(CAT_ORDER.indexOf('Nature')).toBeLessThan(CAT_ORDER.indexOf('Famille'))
  })

  it('ne mute pas le tableau source', () => {
    const before = visits.map((v) => v.name)
    filterAndSortVisits(visits, 'Tous', 'dist')
    expect(visits.map((v) => v.name)).toEqual(before)
  })
})
