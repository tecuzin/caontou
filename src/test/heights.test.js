import { describe, it, expect } from 'vitest'
import {
  HEIGHT_MIN_CM, HEIGHT_MAX_CM,
  addHeight, removeHeight, groupByChild, growthSince,
  isValidHeightCm, isValidHeightDate, normalizeHeight, todayIso,
} from '../heights.js'

const D = (n) => `2026-08-0${n}`

describe('addHeight — validation', () => {
  it('ajoute une mesure valide sans muter la liste', () => {
    const list = []
    const out = addHeight(list, { name: 'Léa', cm: 118, date: D(1) })
    expect(list).toEqual([])
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ name: 'Léa', cm: 118, date: D(1) })
    expect(typeof out[0].id).toBe('number')
  })

  it('trime le prénom', () => {
    const out = addHeight([], { name: '  Tom  ', cm: 100, date: D(1) })
    expect(out[0].name).toBe('Tom')
  })

  it('accepte une taille en chaîne', () => {
    const out = addHeight([], { name: 'Tom', cm: '123.5', date: D(1) })
    expect(out[0].cm).toBe(123.5)
  })

  it('renvoie la liste inchangée si le prénom est vide', () => {
    const list = [{ id: 1, name: 'Tom', cm: 100, date: D(1) }]
    expect(addHeight(list, { name: '   ', cm: 100, date: D(1) })).toBe(list)
    expect(addHeight(list, { cm: 100, date: D(1) })).toBe(list)
  })

  it('refuse une taille hors bornes (30–250) et accepte les bornes', () => {
    const list = []
    expect(addHeight(list, { name: 'Tom', cm: 29.9, date: D(1) })).toBe(list)
    expect(addHeight(list, { name: 'Tom', cm: 250.1, date: D(1) })).toBe(list)
    expect(addHeight(list, { name: 'Tom', cm: 0, date: D(1) })).toBe(list)
    expect(addHeight(list, { name: 'Tom', cm: -50, date: D(1) })).toBe(list)
    expect(addHeight(list, { name: 'Tom', cm: HEIGHT_MIN_CM, date: D(1) })).toHaveLength(1)
    expect(addHeight(list, { name: 'Tom', cm: HEIGHT_MAX_CM, date: D(1) })).toHaveLength(1)
  })

  it('refuse une taille non numérique', () => {
    const list = []
    expect(addHeight(list, { name: 'Tom', cm: 'grand', date: D(1) })).toBe(list)
    expect(addHeight(list, { name: 'Tom', cm: NaN, date: D(1) })).toBe(list)
    expect(addHeight(list, { name: 'Tom', cm: Infinity, date: D(1) })).toBe(list)
  })

  it('refuse une date invalide', () => {
    const list = []
    expect(addHeight(list, { name: 'Tom', cm: 100, date: '' })).toBe(list)
    expect(addHeight(list, { name: 'Tom', cm: 100, date: '01/08/2026' })).toBe(list)
    expect(addHeight(list, { name: 'Tom', cm: 100, date: '2026-13-01' })).toBe(list)
    expect(addHeight(list, { name: 'Tom', cm: 100, date: '2026-02-30' })).toBe(list)
    expect(addHeight(list, { name: 'Tom', cm: 100 })).toBe(list)
  })

  it('tolère une liste absente', () => {
    expect(addHeight(undefined, { name: 'Tom', cm: 100, date: D(1) })).toHaveLength(1)
  })

  it('génère des identifiants uniques même en rafale', () => {
    let list = []
    for (let i = 0; i < 5; i++) list = addHeight(list, { name: 'Tom', cm: 100 + i, date: D(1) })
    expect(new Set(list.map((m) => m.id)).size).toBe(5)
  })
})

describe('removeHeight', () => {
  const list = [
    { id: 1, name: 'Tom', cm: 100, date: D(1) },
    { id: 2, name: 'Léa', cm: 118, date: D(2) },
  ]

  it('supprime par id', () => {
    expect(removeHeight(list, 1)).toEqual([list[1]])
    expect(list).toHaveLength(2)
  })

  it('ne casse pas sur un id inconnu ou une liste absente', () => {
    expect(removeHeight(list, 42)).toHaveLength(2)
    expect(removeHeight(undefined, 1)).toEqual([])
  })
})

describe('groupByChild', () => {
  it('groupe par enfant, trie les mesures par date croissante', () => {
    const list = [
      { id: 3, name: 'Tom', cm: 104, date: D(5) },
      { id: 1, name: 'Tom', cm: 102, date: D(1) },
      { id: 2, name: 'Tom', cm: 103, date: D(3) },
    ]
    const [tom] = groupByChild(list)
    expect(tom.name).toBe('Tom')
    expect(tom.measures.map((m) => m.date)).toEqual([D(1), D(3), D(5)])
  })

  it('trie les enfants par prénom', () => {
    const list = [
      { id: 1, name: 'Zoé', cm: 130, date: D(1) },
      { id: 2, name: 'Alice', cm: 120, date: D(1) },
      { id: 3, name: 'Marin', cm: 125, date: D(1) },
    ]
    expect(groupByChild(list).map((c) => c.name)).toEqual(['Alice', 'Marin', 'Zoé'])
  })

  it('regroupe en ignorant la casse et les espaces', () => {
    const list = [
      { id: 1, name: 'Tom', cm: 100, date: D(1) },
      { id: 2, name: ' tom ', cm: 102, date: D(2) },
    ]
    const groups = groupByChild(list)
    expect(groups).toHaveLength(1)
    expect(groups[0].name).toBe('Tom')
    expect(groups[0].measures).toHaveLength(2)
  })

  it('ignore les entrées sans prénom et tolère une liste absente', () => {
    expect(groupByChild([{ id: 1, cm: 100, date: D(1) }, null])).toEqual([])
    expect(groupByChild(undefined)).toEqual([])
  })

  it('ne mute pas la liste d\'entrée', () => {
    const list = [
      { id: 2, name: 'Tom', cm: 104, date: D(5) },
      { id: 1, name: 'Tom', cm: 102, date: D(1) },
    ]
    groupByChild(list)
    expect(list.map((m) => m.id)).toEqual([2, 1])
  })
})

describe('growthSince', () => {
  it('calcule la croissance entre la 1re et la dernière mesure', () => {
    expect(growthSince([
      { cm: 102, date: D(1) },
      { cm: 104.5, date: D(5) },
    ])).toBe(2.5)
  })

  it('reste correct quel que soit l\'ordre d\'entrée', () => {
    expect(growthSince([
      { cm: 104, date: D(5) },
      { cm: 100, date: D(1) },
      { cm: 102, date: D(3) },
    ])).toBe(4)
  })

  it('renvoie 0 avec moins de deux mesures', () => {
    expect(growthSince([])).toBe(0)
    expect(growthSince([{ cm: 100, date: D(1) }])).toBe(0)
    expect(growthSince(undefined)).toBe(0)
  })

  it('peut être négative (mesure moins précise)', () => {
    expect(growthSince([{ cm: 104, date: D(1) }, { cm: 103, date: D(2) }])).toBe(-1)
  })
})

describe('helpers', () => {
  it('isValidHeightCm', () => {
    expect(isValidHeightCm(100)).toBe(true)
    expect(isValidHeightCm('100')).toBe(true)
    expect(isValidHeightCm(20)).toBe(false)
    expect(isValidHeightCm(null)).toBe(false)
  })

  it('isValidHeightDate', () => {
    expect(isValidHeightDate('2026-08-01')).toBe(true)
    expect(isValidHeightDate('2024-02-29')).toBe(true)
    expect(isValidHeightDate('2026-02-29')).toBe(false)
    expect(isValidHeightDate(null)).toBe(false)
  })

  it('normalizeHeight arrondit au millimètre', () => {
    expect(normalizeHeight({ name: 'Tom', cm: 100.049, date: D(1) })).toEqual({ name: 'Tom', cm: 100, date: D(1) })
    expect(normalizeHeight({ name: '', cm: 100, date: D(1) })).toBeNull()
  })

  it('todayIso rend une date locale YYYY-MM-DD', () => {
    expect(todayIso(new Date(2026, 7, 3))).toBe('2026-08-03')
    expect(isValidHeightDate(todayIso())).toBe(true)
  })
})
