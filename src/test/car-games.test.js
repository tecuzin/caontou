import { describe, it, expect } from 'vitest'
import { ROUTE_DEPARTMENTS, ISPY_PROMPTS, pickISpy, plateProgress } from '../car-games.js'

describe('pickISpy', () => {
  it('déterministe selon la graine', () => {
    expect(pickISpy(0)).toBe(ISPY_PROMPTS[0])
    expect(pickISpy(3)).toBe(ISPY_PROMPTS[3])
    expect(pickISpy(ISPY_PROMPTS.length)).toBe(ISPY_PROMPTS[0]) // modulo
  })
  it('évite de répéter le prompt précédent', () => {
    const p = pickISpy(2)
    expect(pickISpy(2, p)).not.toBe(p)
  })
  it('gère une liste vide', () => {
    expect(pickISpy(0, null, [])).toBeNull()
  })
})

describe('plateProgress', () => {
  it('compte les départements repérés', () => {
    expect(plateProgress({})).toEqual({ done: 0, total: ROUTE_DEPARTMENTS.length })
    expect(plateProgress({ 15: true, 63: true })).toEqual({ done: 2, total: ROUTE_DEPARTMENTS.length })
  })
  it('ignore les codes hors liste', () => {
    expect(plateProgress({ 99: true }).done).toBe(0)
  })
})
