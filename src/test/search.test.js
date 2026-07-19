import { describe, it, expect } from 'vitest'
import { normalize, searchStore, groupResults } from '../search.js'

const store = {
  visits: [{ id: 1, name: 'Pas de Cère — passerelles', cat: 'Nature', dist: '30 min', dur: '1 h 30' }],
  meals: [{ id: 1, day: 'Mer 5', dish: 'Aligot au buron' }],
  days: [{ dow: 'Mer', num: 5, title: 'Le grand départ', sub: 'Beauvais → Laschamps', items: [{ time: '09:00', title: 'Départ', note: 'Voiture chargée' }] }],
  logi: [{ key: 've', name: 'Valise enfants', items: ['K-way imperméable', 'Bottes'] }],
  courses: [{ key: 'co_frais', name: 'Frais', items: ['Cantal AOP', 'Lait'] }],
  shoppingItems: [{ id: 1, label: 'Piles AA' }],
  restos: [{ id: 1, name: 'Truffade au buron', place: 'Col de Curebourse' }],
  trajets: { aller: [{ time: '08:00', place: 'Départ Beauvais', note: '' }], retour: [] },
  journal: { 0: 'Belle journée au Pas de Cère' },
}

describe('normalize', () => {
  it('minuscule et sans accents', () => {
    expect(normalize('Pas de CÈRE — Été')).toBe('pas de cere — ete')
    expect(normalize(null)).toBe('')
  })
})

describe('searchStore', () => {
  it('ignore les requêtes trop courtes', () => {
    expect(searchStore(store, 'a')).toEqual([])
    expect(searchStore(store, '')).toEqual([])
  })

  it('trouve insensible à la casse et aux accents', () => {
    const r = searchStore(store, 'cere')
    expect(r.some((x) => x.label.includes('Pas de Cère'))).toBe(true)
    // « aligot » dans les repas
    const a = searchStore(store, 'ALIGOT')
    expect(a[0].group).toBe('Repas')
    expect(a[0].nav).toEqual({ tab: 'repas' })
  })

  it('matche tous les mots (ET) et pointe vers le bon écran', () => {
    const r = searchStore(store, 'valise kway')
    expect(r).toEqual([]) // « kway » ne matche pas « K-way » (tiret)
    const r2 = searchStore(store, 'k-way')
    expect(r2[0].group).toBe('Préparatifs')
    expect(r2[0].nav).toEqual({ sub: 'logistique' })
  })

  it('couvre plusieurs collections (planning, restos, trajet, journal, courses)', () => {
    expect(searchStore(store, 'départ').some((x) => x.group === 'Planning')).toBe(true)
    expect(searchStore(store, 'beauvais').some((x) => x.group === 'Trajet')).toBe(true)
    expect(searchStore(store, 'truffade')[0].nav).toEqual({ sub: 'restos' })
    expect(searchStore(store, 'cantal')[0].group).toBe('Courses')
    expect(searchStore(store, 'journée').some((x) => x.group === 'Journal')).toBe(true)
  })

  it('respecte la limite', () => {
    expect(searchStore(store, 'e', 3)).toHaveLength(0) // requête 1 car
    expect(searchStore(store, 'a', 3)).toHaveLength(0)
    const many = searchStore(store, 'a ', 2) // « a » seul < 2 → []
    expect(many.length).toBeLessThanOrEqual(2)
  })
})

describe('groupResults', () => {
  it('regroupe par group en conservant l\'ordre', () => {
    const g = groupResults(searchStore(store, 'buron'))
    expect(g.length).toBeGreaterThanOrEqual(1)
    expect(g[0]).toHaveProperty('items')
  })
})
