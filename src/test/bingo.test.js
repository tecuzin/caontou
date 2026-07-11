import { describe, it, expect } from 'vitest'
import { BINGO_LINES, isLineComplete, countCompletedLines, isFullHouse } from '../bingo.js'

describe('Bingo — lignes gagnantes', () => {
  it('définit 10 lignes (4 rangées + 4 colonnes + 2 diagonales)', () => {
    expect(BINGO_LINES).toHaveLength(10)
    expect(BINGO_LINES.every((l) => l.length === 4)).toBe(true)
  })

  it('détecte une rangée complète', () => {
    const checked = { 4: true, 5: true, 6: true, 7: true }
    expect(isLineComplete([4, 5, 6, 7], checked)).toBe(true)
    expect(countCompletedLines(checked)).toBe(1)
  })

  it('détecte une diagonale complète', () => {
    const checked = { 0: true, 5: true, 10: true, 15: true }
    expect(countCompletedLines(checked)).toBe(1)
  })

  it('compte plusieurs lignes croisées', () => {
    // colonne 0 (0,4,8,12) + rangée 0 (0,1,2,3) partagent la case 0
    const checked = { 0: true, 4: true, 8: true, 12: true, 1: true, 2: true, 3: true }
    expect(countCompletedLines(checked)).toBe(2)
  })

  it('ne compte pas une ligne incomplète', () => {
    expect(countCompletedLines({ 0: true, 1: true, 2: true })).toBe(0)
  })

  it('détecte la grille pleine', () => {
    const full = {}
    for (let i = 0; i < 16; i++) full[i] = true
    expect(isFullHouse(full)).toBe(true)
    expect(isFullHouse({ 0: true })).toBe(false)
  })
})
