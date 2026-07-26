import { describe, it, expect } from 'vitest'
import { DIALECT_WORDS, pickRound, makeRng } from '../dialect.js'

describe('dialect — lexique auvergnat', () => {
  it('contient au moins 10 entrées', () => {
    expect(DIALECT_WORDS.length).toBeGreaterThanOrEqual(10)
  })

  it('chaque entrée a word / meaning / source non vides', () => {
    for (const w of DIALECT_WORDS) {
      expect(typeof w.word).toBe('string'); expect(w.word.trim().length).toBeGreaterThan(0)
      expect(typeof w.meaning).toBe('string'); expect(w.meaning.trim().length).toBeGreaterThan(0)
      expect(typeof w.source).toBe('string'); expect(w.source.trim().length).toBeGreaterThan(0)
    }
  })

  it('chaque entrée est sourcée par deux URL http(s) distinctes (recoupement)', () => {
    for (const w of DIALECT_WORDS) {
      expect(w.source).toMatch(/^https?:\/\//)
      expect(w.source2).toMatch(/^https?:\/\//)
      expect(w.source2).not.toBe(w.source)
    }
  })

  it('la note, quand elle existe, est une chaîne non vide', () => {
    for (const w of DIALECT_WORDS) {
      if ('note' in w) {
        expect(typeof w.note).toBe('string')
        expect(w.note.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('aucun doublon de mot (insensible à la casse)', () => {
    const keys = DIALECT_WORDS.map(w => w.word.toLowerCase().trim())
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('aucun doublon de définition', () => {
    const keys = DIALECT_WORDS.map(w => w.meaning.toLowerCase().trim())
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('makeRng()', () => {
  it('est déterministe pour une graine donnée', () => {
    const a = makeRng(42), b = makeRng(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('produit des flottants dans [0,1)', () => {
    const r = makeRng(7)
    for (let i = 0; i < 50; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('pickRound()', () => {
  it('tire exactement n mots', () => {
    expect(pickRound(DIALECT_WORDS, 5, 1)).toHaveLength(5)
    expect(pickRound(DIALECT_WORDS, 0, 1)).toHaveLength(0)
  })

  it('est déterministe : même graine → même tirage', () => {
    const a = pickRound(DIALECT_WORDS, 6, 123)
    const b = pickRound(DIALECT_WORDS, 6, 123)
    expect(a.map(w => w.word)).toEqual(b.map(w => w.word))
  })

  it('des graines différentes donnent des ordres différents', () => {
    const a = pickRound(DIALECT_WORDS, DIALECT_WORDS.length, 1).map(w => w.word)
    const b = pickRound(DIALECT_WORDS, DIALECT_WORDS.length, 2).map(w => w.word)
    expect(a).not.toEqual(b)
  })

  it('ne rend que des mots distincts issus du lexique', () => {
    const r = pickRound(DIALECT_WORDS, DIALECT_WORDS.length, 9)
    expect(new Set(r.map(w => w.word)).size).toBe(DIALECT_WORDS.length)
    for (const w of r) expect(DIALECT_WORDS).toContain(w)
  })

  it('borne n à la taille du lexique et gère les entrées aberrantes', () => {
    expect(pickRound(DIALECT_WORDS, 999, 1)).toHaveLength(DIALECT_WORDS.length)
    expect(pickRound(DIALECT_WORDS, -4, 1)).toHaveLength(0)
    expect(pickRound([], 3, 1)).toHaveLength(0)
    expect(pickRound(null, 3, 1)).toHaveLength(0)
  })

  it('ne mute pas le tableau source', () => {
    const before = DIALECT_WORDS.map(w => w.word)
    pickRound(DIALECT_WORDS, DIALECT_WORDS.length, 55)
    expect(DIALECT_WORDS.map(w => w.word)).toEqual(before)
  })
})
