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

  it('pickWinner rend null sans vote', () => {
    expect(pickWinner([])).toBeNull()
  })
})
