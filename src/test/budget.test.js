import { describe, it, expect } from 'vitest'
import { budgetByCategory, donutArcs } from '../budget.js'

const CATS = [
  { name: 'Hébergement', color: '#9c6b4a' },
  { name: 'Transport', color: '#4f8a86' },
  { name: 'Nourriture', color: '#cf7d3c' },
  { name: 'Visites', color: '#5b7042' },
  { name: 'Extra', color: '#b8503f' },
]

describe('budgetByCategory()', () => {
  it('agrège les montants par catégorie et calcule la part du total', () => {
    const expenses = [
      { label: 'Gîte', cat: 'Hébergement', amt: 300 },
      { label: 'Essence', cat: 'Transport', amt: 50 },
      { label: 'Péage', cat: 'Transport', amt: 50 },
      { label: 'Courses', cat: 'Nourriture', amt: 100 },
    ]
    const res = budgetByCategory(expenses, CATS)
    // total = 500 → parts : Hébergement 60, Transport 20, Nourriture 20
    expect(res.map((c) => [c.name, c.amt, c.pct])).toEqual([
      ['Hébergement', 300, 60],
      ['Transport', 100, 20],
      ['Nourriture', 100, 20],
    ])
    expect(res[0].color).toBe('#9c6b4a')
  })

  it('exclut les catégories sans dépense et trie par montant décroissant', () => {
    const res = budgetByCategory([{ cat: 'Extra', amt: 10 }, { cat: 'Visites', amt: 40 }], CATS)
    expect(res.map((c) => c.name)).toEqual(['Visites', 'Extra'])
  })

  it('renvoie un tableau vide sans dépense (pas de division par zéro)', () => {
    expect(budgetByCategory([], CATS)).toEqual([])
  })
})

describe('donutArcs()', () => {
  it('produit des segments dont la longueur totale referme l’anneau', () => {
    const cats = [{ name: 'A', color: '#111', amt: 3 }, { name: 'B', color: '#222', amt: 1 }]
    const arcs = donutArcs(cats, 50)
    const circ = 2 * Math.PI * 50
    // A = 3/4 du cercle, B = 1/4, chacun décalé du cumul précédent
    expect(arcs[0].len).toBeCloseTo(circ * 0.75)
    expect(arcs[0].offset).toBe(0)
    expect(arcs[1].len).toBeCloseTo(circ * 0.25)
    expect(arcs[1].offset).toBeCloseTo(circ * 0.75)
    // la somme des longueurs couvre exactement la circonférence
    expect(arcs.reduce((a, s) => a + s.len, 0)).toBeCloseTo(circ)
  })

  it('ne divise pas par zéro quand tout est à zéro', () => {
    const arcs = donutArcs([{ name: 'A', color: '#111', amt: 0 }], 50)
    expect(arcs[0].len).toBe(0)
  })
})
