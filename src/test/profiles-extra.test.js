import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  PROFILES_KEY,
  addProfile,
  renameProfile,
  removeProfile,
  findProfile,
  loadProfiles,
  saveProfiles,
} from '../profiles.js'

afterEach(() => vi.restoreAllMocks())

const setStorage = (impl) =>
  Object.defineProperty(window, 'localStorage', { value: impl, configurable: true })

const memory = () => {
  const store = {}
  return {
    store,
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
  }
}

describe('PROFILES_KEY', () => {
  it('est une clé SÉPARÉE du store principal cantou.v1', () => {
    expect(PROFILES_KEY).toBe('cantou.profiles')
    expect(PROFILES_KEY).not.toBe('cantou.v1')
  })
})

describe('loadProfiles()', () => {
  it('renvoie [] quand rien n’est stocké', () => {
    setStorage(memory())
    expect(loadProfiles()).toEqual([])
  })

  it('relit un tableau de profils persisté', () => {
    const ls = memory()
    ls.store[PROFILES_KEY] = JSON.stringify([{ id: 1, name: 'A', savedAt: 'z', data: {} }])
    setStorage(ls)
    const list = loadProfiles()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('A')
  })

  it('renvoie [] si le JSON stocké n’est pas un tableau', () => {
    const ls = memory()
    ls.store[PROFILES_KEY] = JSON.stringify({ id: 1 })
    setStorage(ls)
    expect(loadProfiles()).toEqual([])
  })

  it('renvoie [] sur JSON corrompu', () => {
    const ls = memory()
    ls.store[PROFILES_KEY] = '[[[pas du json'
    setStorage(ls)
    expect(loadProfiles()).toEqual([])
  })

  it('renvoie [] si localStorage lève (mode privé)', () => {
    setStorage({ getItem: () => { throw new Error('SecurityError') } })
    expect(loadProfiles()).toEqual([])
  })
})

describe('saveProfiles()', () => {
  it('persiste sous cantou.profiles sans toucher cantou.v1', () => {
    const ls = memory()
    ls.store['cantou.v1'] = '{"garde":true}'
    setStorage(ls)
    saveProfiles([{ id: 1, name: 'A', savedAt: 'z', data: { x: 1 } }])
    expect(JSON.parse(ls.store[PROFILES_KEY])[0].name).toBe('A')
    expect(ls.store['cantou.v1']).toBe('{"garde":true}')
  })

  it('avale une erreur de quota sans planter', () => {
    setStorage({ setItem: () => { throw new Error('QuotaExceededError') } })
    expect(() => saveProfiles([{ id: 1 }])).not.toThrow()
  })

  it('fait un aller-retour fidèle avec loadProfiles()', () => {
    setStorage(memory())
    const list = addProfile([], { name: 'Cantal', data: { saved: { 1: true } } })
    saveProfiles(list)
    expect(loadProfiles()).toEqual(JSON.parse(JSON.stringify(list)))
  })
})

describe('addProfile() — cas limites supplémentaires', () => {
  it('accepte un nom non-string (converti puis trim)', () => {
    expect(addProfile([], { name: 42, data: {} })[0].name).toBe('42')
  })

  it('replie un nom null/false sur « Séjour sans nom »', () => {
    expect(addProfile([], { name: null, data: {} })[0].name).toBe('Séjour sans nom')
    expect(addProfile([], { name: false, data: {} })[0].name).toBe('Séjour sans nom')
  })

  it('accepte un instantané absent (data undefined)', () => {
    const p = addProfile([], { name: 'X' })[0]
    expect(p.data).toBeUndefined()
    expect(p.name).toBe('X')
  })

  it('conserve la référence de l’instantané fourni (pas de copie)', () => {
    const data = { saved: {} }
    expect(addProfile([], { name: 'X', data }).at(-1).data).toBe(data)
  })

  it('utilise Date.now() comme id et la même horloge pour savedAt', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
    vi.setSystemTime(new Date(1700000000000))
    const p = addProfile([], { name: 'X', data: {} })[0]
    expect(p.id).toBe(1700000000000)
    expect(p.savedAt).toBe(new Date(1700000000000).toISOString())
    vi.useRealTimers()
  })
})

describe('renameProfile() — cas limites supplémentaires', () => {
  const base = [{ id: 1, name: 'A', savedAt: 'z', data: {} }]

  it('ignore un nom null/undefined (liste inchangée par identité)', () => {
    expect(renameProfile(base, 1, null)).toBe(base)
    expect(renameProfile(base, 1, undefined)).toBe(base)
  })

  it('accepte un nom numérique', () => {
    expect(renameProfile(base, 1, 2027)[0].name).toBe('2027')
  })

  it('compare les id strictement (une chaîne ne matche pas un nombre)', () => {
    expect(renameProfile(base, '1', 'Z')[0].name).toBe('A')
  })

  it('préserve savedAt et data lors du renommage', () => {
    const out = renameProfile([{ id: 1, name: 'A', savedAt: 'z', data: { x: 1 } }], 1, 'B')[0]
    expect(out.savedAt).toBe('z')
    expect(out.data).toEqual({ x: 1 })
  })

  it('gère une liste vide', () => {
    expect(renameProfile([], 1, 'B')).toEqual([])
  })
})

describe('removeProfile() / findProfile() — cas limites supplémentaires', () => {
  const base = [
    { id: 1, name: 'A', savedAt: 'z', data: {} },
    { id: 2, name: 'B', savedAt: 'z', data: {} },
  ]

  it('removeProfile compare les id strictement', () => {
    expect(removeProfile(base, '1')).toHaveLength(2)
  })

  it('removeProfile gère une liste vide', () => {
    expect(removeProfile([], 1)).toEqual([])
  })

  it('findProfile compare les id strictement', () => {
    expect(findProfile(base, '2')).toBeUndefined()
  })

  it('findProfile renvoie la référence du profil (pas une copie)', () => {
    expect(findProfile(base, 1)).toBe(base[0])
  })

  it('findProfile sur liste vide renvoie undefined', () => {
    expect(findProfile([], 1)).toBeUndefined()
  })
})
