import { describe, it, expect } from 'vitest'
import { isRainyDay, isIndoorVisit, weatherSuggestion } from '../weather.js'

describe('isRainyDay', () => {
  it('vrai si icône pluie', () => {
    expect(isRainyDay({ icon: '🌧️', rain: '10 %' })).toBe(true)
  })
  it('vrai si probabilité ≥ seuil', () => {
    expect(isRainyDay({ icon: '⛅', rain: '70 %' })).toBe(true)
    expect(isRainyDay({ icon: '⛅', rain: '30 %' })).toBe(false)
  })
  it('faux si pas de données', () => {
    expect(isRainyDay(null)).toBe(false)
    expect(isRainyDay({ icon: '☀️', rain: '5 %' })).toBe(false)
  })
})

describe('isIndoorVisit', () => {
  it('respecte le champ indoor explicite', () => {
    expect(isIndoorVisit({ cat: 'Nature', name: 'X', indoor: true })).toBe(true)
    expect(isIndoorVisit({ cat: 'Patrimoine', name: 'X', indoor: false })).toBe(false)
  })
  it('heuristique par catégorie / nom quand indoor absent', () => {
    expect(isIndoorVisit({ cat: 'Gourmand', name: 'Buronnerie & degustation' })).toBe(true)
    expect(isIndoorVisit({ cat: 'Patrimoine', name: 'Maison des Volcans' })).toBe(true)
    expect(isIndoorVisit({ cat: 'Nature', name: 'Cascade de la Conche' })).toBe(false)
  })
})

describe('weatherSuggestion', () => {
  const visits = [
    { id: 1, cat: 'Nature', name: 'Pas de Cère' },
    { id: 11, cat: 'Patrimoine', name: 'Maison des Volcans, Aurillac' },
    { id: 14, cat: 'Gourmand', name: 'Buronnerie & degustation', indoor: true },
  ]
  it('jour sec : message positif, rainy=false', () => {
    const s = weatherSuggestion({ icon: '☀️', rain: '5 %' }, visits)
    expect(s.rainy).toBe(false)
    expect(s.message).toMatch(/plein air/)
  })
  it('jour de pluie : propose des activités abritées', () => {
    const s = weatherSuggestion({ icon: '🌧️', rain: '70 %' }, visits)
    expect(s.rainy).toBe(true)
    expect(s.indoor.map((v) => v.id)).toEqual([11, 14])
    expect(s.message).toMatch(/au sec/)
  })
  it('jour de pluie sans activité abritée : message de repli', () => {
    const s = weatherSuggestion({ icon: '🌧️', rain: '80 %' }, [{ id: 1, cat: 'Nature', name: 'Rando' }])
    expect(s.indoor).toHaveLength(0)
    expect(s.message).toMatch(/plus clément/)
  })
})
