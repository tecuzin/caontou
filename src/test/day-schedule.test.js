import { describe, it, expect } from 'vitest'
import { dayKeyOf, mealsForDay } from '../day-schedule.js'

const MEALS = [
  { id: 1, day: 'Ven 7', dish: 'Truffade maison' },
  { id: 2, day: 'Ven 7', dish: 'Dessert : myrtilles' },
  { id: 3, day: 'Sam 8', dish: 'Aligot' },
]

describe('dayKeyOf()', () => {
  it('construit la clé "dow num"', () => {
    expect(dayKeyOf({ dow: 'Ven', num: 7 })).toBe('Ven 7')
  })
  it('renvoie "" pour un jour incomplet', () => {
    expect(dayKeyOf(null)).toBe('')
    expect(dayKeyOf({ dow: 'Ven' })).toBe('')
  })
})

describe('mealsForDay()', () => {
  it('renvoie les repas dont la date correspond au jour', () => {
    const res = mealsForDay({ dow: 'Ven', num: 7 }, MEALS)
    expect(res.map((m) => m.dish)).toEqual(['Truffade maison', 'Dessert : myrtilles'])
  })
  it('renvoie [] si aucun repas ce jour ou jour invalide', () => {
    expect(mealsForDay({ dow: 'Dim', num: 9 }, MEALS)).toEqual([])
    expect(mealsForDay(null, MEALS)).toEqual([])
    expect(mealsForDay({ dow: 'Ven', num: 7 }, [])).toEqual([])
  })
})
