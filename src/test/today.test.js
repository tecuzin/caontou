import { describe, it, expect } from 'vitest'
import { computeToday } from '../today.js'

const trip = { start: '2026-08-05', end: '2026-08-12' }
const days = [
  { dow: 'Mer', num: 5, title: 'Arrivée' },
  { dow: 'Jeu', num: 6, title: 'Rando' },
]
const meteo = [{ n: 5, icon: '☀️', hi: 26 }]
const meals = [{ day: 'Mer 5', dish: 'Aligot' }]

describe('computeToday (extrait d\'App.jsx)', () => {
  it('renvoie le jour + météo + repas quand la date tombe dans le séjour', () => {
    const r = computeToday(trip, days, meteo, meals, new Date(2026, 7, 5, 12))
    expect(r).not.toBeNull()
    expect(r.dayIdx).toBe(0)
    expect(r.d.title).toBe('Arrivée')
    expect(r.w).toEqual(meteo[0])
    expect(r.meal).toEqual(meals[0])
  })

  it('météo/repas à null si absents pour ce jour', () => {
    const r = computeToday(trip, days, [], [], new Date(2026, 7, 6, 9))
    expect(r.dayIdx).toBe(1)
    expect(r.w).toBeNull()
    expect(r.meal).toBeNull()
  })

  it('null avant le début du séjour', () => {
    expect(computeToday(trip, days, meteo, meals, new Date(2026, 6, 1))).toBeNull()
  })

  it('null après la fin du séjour', () => {
    expect(computeToday(trip, days, meteo, meals, new Date(2026, 7, 20))).toBeNull()
  })

  it('null si la date est dans le séjour mais hors des jours planifiés', () => {
    // 8 août : dans la fenêtre 5→12 mais aucun jour num=8 dans days
    expect(computeToday(trip, days, meteo, meals, new Date(2026, 7, 8, 12))).toBeNull()
  })
})
