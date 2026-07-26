import { describe, it, expect } from 'vitest'
import {
  makeRng, shuffle, buildBoard, isPair, countMatchedPairs, isBoardComplete,
  memoryRating, MEMORY_DEFAULT_PAIRS, MEMORY_MAX_PAIRS,
} from '../memory.js'

describe('makeRng() / shuffle() — aléatoire DÉTERMINISTE', () => {
  it('même graine → même suite', () => {
    const a = Array.from({ length: 5 }, makeRng(42))
    const b = Array.from({ length: 5 }, makeRng(42))
    expect(a).toEqual(b)
  })
  it('graines différentes → suites différentes', () => {
    expect(Array.from({ length: 5 }, makeRng(1))).not.toEqual(Array.from({ length: 5 }, makeRng(2)))
  })
  it('shuffle ne mute pas l’entrée et conserve les éléments', () => {
    const src = [1, 2, 3, 4, 5]
    const out = shuffle(src, 7)
    expect(src).toEqual([1, 2, 3, 4, 5])
    expect(out.slice().sort()).toEqual(src)
  })
})

describe('buildBoard()', () => {
  it('produit 2 cartes par paire, chacune avec un id unique', () => {
    const board = buildBoard(6, 1)
    expect(board).toHaveLength(12)
    expect(new Set(board.map((c) => c.id)).size).toBe(12)
  })

  it('chaque pairId apparaît exactement deux fois', () => {
    const counts = {}
    buildBoard(6, 3).forEach((c) => { counts[c.pairId] = (counts[c.pairId] || 0) + 1 })
    expect(Object.values(counts).every((n) => n === 2)).toBe(true)
    expect(Object.keys(counts)).toHaveLength(6)
  })

  it('est reproductible à graine égale, différent sinon', () => {
    expect(buildBoard(6, 9)).toEqual(buildBoard(6, 9))
    expect(buildBoard(6, 9)).not.toEqual(buildBoard(6, 10))
  })

  it('borne le nombre de paires à la banque d’emojis disponible', () => {
    expect(buildBoard(999, 1)).toHaveLength(MEMORY_MAX_PAIRS * 2)
    expect(buildBoard(0, 1)).toHaveLength(2)   // au moins une paire
    expect(buildBoard(-5, 1)).toHaveLength(2)
  })

  it('chaque carte porte un emoji et un libellé', () => {
    buildBoard(MEMORY_DEFAULT_PAIRS, 1).forEach((c) => {
      expect(c.emoji).toBeTruthy()
      expect(c.label).toBeTruthy()
    })
  })
})

describe('isPair()', () => {
  const [a, b] = buildBoard(4, 1)
  it('deux cartes distinctes de même motif forment une paire', () => {
    const board = buildBoard(4, 1)
    const first = board[0]
    const twin = board.find((c) => c.pairId === first.pairId && c.id !== first.id)
    expect(isPair(first, twin)).toBe(true)
  })
  it('la même carte ne s’apparie pas avec elle-même', () => {
    expect(isPair(a, a)).toBe(false)
  })
  it('refuse les entrées manquantes', () => {
    expect(isPair(a, null)).toBe(false)
    expect(isPair(undefined, b)).toBe(false)
  })
})

describe('countMatchedPairs() / isBoardComplete()', () => {
  it('compte une paire pour deux cartes appariées', () => {
    expect(countMatchedPairs([])).toBe(0)
    expect(countMatchedPairs([1, 2])).toBe(1)
    expect(countMatchedPairs([1, 2, 3, 4])).toBe(2)
  })
  it('le plateau est complet quand toutes les cartes sont appariées', () => {
    const board = buildBoard(3, 1) // 6 cartes
    expect(isBoardComplete(board, [1, 2, 3, 4])).toBe(false)
    expect(isBoardComplete(board, [1, 2, 3, 4, 5, 6])).toBe(true)
    expect(isBoardComplete([], [])).toBe(false)
  })
})

describe('memoryRating()', () => {
  it('récompense les parties courtes', () => {
    expect(memoryRating(6, 6)).toContain('éléphant')
    expect(memoryRating(12, 6)).toContain('Très fort')
    expect(memoryRating(18, 6)).toContain('Bien joué')
    expect(memoryRating(40, 6)).toContain('Terminé')
  })
  it('renvoie un tiret sans partie jouée', () => {
    expect(memoryRating(0, 6)).toBe('—')
  })
})
