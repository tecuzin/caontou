import { describe, it, expect } from 'vitest'
import { tallyVotes, pickWinner } from '../vote.js'

describe('Vote familial — dépouillement', () => {
  it('compte les voix et désigne le gagnant net', () => {
    const { counts, winners } = tallyVotes(['a', 'b', 'a', 'a'])
    expect(counts).toEqual({ a: 3, b: 1 })
    expect(winners).toEqual(['a'])
  })

  it('remonte tous les ex æquo', () => {
    const { winners } = tallyVotes(['a', 'b', 'a', 'b'])
    expect(winners.sort()).toEqual(['a', 'b'])
  })

  it('ignore les votes nuls/blancs', () => {
    const { counts } = tallyVotes(['a', null, undefined, 'a'])
    expect(counts).toEqual({ a: 2 })
  })

  it('pickWinner tranche une égalité via le rng injecté', () => {
    // rng=0 → premier ex æquo, rng proche de 1 → dernier
    expect(pickWinner(['a', 'b'], () => 0)).toBe('a')
    expect(pickWinner(['a', 'b'], () => 0.99)).toBe('b')
  })

  it('pickWinner rend le gagnant net quel que soit le rng', () => {
    expect(pickWinner(['x', 'x', 'y'], () => 0.9)).toBe('x')
  })

  it('préserve le TYPE des votes numériques (régression : id 1 ≠ "1")', () => {
    // Les ids de visite sont des nombres ; le gagnant doit rester un nombre
    // pour que visits.find(v => v.id === winner) fonctionne.
    const w = pickWinner([1, 5, 1])
    expect(w).toBe(1)
    expect(typeof w).toBe('number')
    // égalité numérique tranchée : renvoie bien un des nombres d'origine
    const tie = pickWinner([1, 5], () => 0.99)
    expect(typeof tie).toBe('number')
    expect([1, 5]).toContain(tie)
  })

  it('pickWinner rend null sans vote', () => {
    expect(pickWinner([])).toBeNull()
  })
})
