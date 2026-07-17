import { describe, it, expect, vi, afterEach } from 'vitest'
import { addProfile, renameProfile, removeProfile, findProfile } from '../profiles.js'

afterEach(() => vi.restoreAllMocks())

describe('addProfile()', () => {
  it('ajoute un profil avec id, name, savedAt ISO et data', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1710000000000)
    const list = addProfile([], { name: 'Cantal 2026', data: { saved: { 1: true } } })
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(1710000000000)
    expect(list[0].name).toBe('Cantal 2026')
    expect(list[0].savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(list[0].data).toEqual({ saved: { 1: true } })
  })

  it('est immuable (ne mute pas le tableau source)', () => {
    const src = []
    const out = addProfile(src, { name: 'A', data: {} })
    expect(src).toHaveLength(0)
    expect(out).not.toBe(src)
  })

  it('trim le nom et applique un repli si vide', () => {
    expect(addProfile([], { name: '  Été  ', data: {} })[0].name).toBe('Été')
    expect(addProfile([], { name: '   ', data: {} })[0].name).toBe('Séjour sans nom')
    expect(addProfile([], { data: {} })[0].name).toBe('Séjour sans nom')
  })

  it('conserve les profils existants', () => {
    const list = addProfile([{ id: 1, name: 'X', savedAt: 'z', data: {} }], { name: 'Y', data: {} })
    expect(list).toHaveLength(2)
    expect(list[0].name).toBe('X')
  })
})

describe('renameProfile()', () => {
  const base = [
    { id: 1, name: 'A', savedAt: 'z', data: {} },
    { id: 2, name: 'B', savedAt: 'z', data: {} },
  ]

  it('renomme le profil ciblé, trim inclus', () => {
    const out = renameProfile(base, 2, '  Nouveau  ')
    expect(out[1].name).toBe('Nouveau')
    expect(out[0].name).toBe('A')
  })

  it('ignore un nom vide (retourne la liste inchangée)', () => {
    expect(renameProfile(base, 1, '   ')).toBe(base)
  })

  it('ne change rien si l\'id est absent', () => {
    const out = renameProfile(base, 99, 'Z')
    expect(out.map((p) => p.name)).toEqual(['A', 'B'])
  })

  it('est immuable', () => {
    const out = renameProfile(base, 1, 'C')
    expect(base[0].name).toBe('A')
    expect(out).not.toBe(base)
  })
})

describe('removeProfile()', () => {
  const base = [
    { id: 1, name: 'A', savedAt: 'z', data: {} },
    { id: 2, name: 'B', savedAt: 'z', data: {} },
  ]

  it('supprime le profil ciblé', () => {
    const out = removeProfile(base, 1)
    expect(out).toHaveLength(1)
    expect(out[0].id).toBe(2)
  })

  it('ne change rien si l\'id est absent', () => {
    expect(removeProfile(base, 99)).toHaveLength(2)
  })

  it('est immuable', () => {
    removeProfile(base, 1)
    expect(base).toHaveLength(2)
  })
})

describe('findProfile()', () => {
  const base = [
    { id: 1, name: 'A', savedAt: 'z', data: { x: 1 } },
    { id: 2, name: 'B', savedAt: 'z', data: { x: 2 } },
  ]

  it('retrouve un profil par id', () => {
    expect(findProfile(base, 2).name).toBe('B')
  })

  it('retourne undefined si absent', () => {
    expect(findProfile(base, 99)).toBeUndefined()
  })
})
