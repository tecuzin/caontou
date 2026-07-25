import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const native = { value: false }
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => native.value } }))
const shareNative = vi.fn()
vi.mock('@capacitor/share', () => ({ Share: { share: (...a) => shareNative(...a) } }))

import {
  appendEvent,
  buildTrackingExport,
  summarize,
  track,
  loadTrack,
  saveTrack,
  clearTrack,
  shareTracking,
  TRACK_KEY,
  TRACK_CAP,
} from '../tracking.js'

/* ------------------------------------------------------------------ *
 * Fonctions pures — branches de repli
 * ------------------------------------------------------------------ */

describe('appendEvent — entrées manquantes', () => {
  it('accepte un journal null/undefined comme journal vide', () => {
    expect(appendEvent(null, { t: 1, type: 'tab', key: 'a' })).toHaveLength(1)
    expect(appendEvent(undefined, { t: 1, type: 'tab', key: 'a' })).toHaveLength(1)
  })

  it('respecte un cap personnalisé', () => {
    let ev = []
    for (let i = 0; i < 10; i++) ev = appendEvent(ev, { t: i, type: 'tab', key: String(i) }, 3)
    expect(ev.map((e) => e.key)).toEqual(['7', '8', '9'])
  })

  it('ne coupe rien tant que le cap n’est pas dépassé', () => {
    const ev = appendEvent([{ t: 0 }], { t: 1 }, 2)
    expect(ev).toHaveLength(2)
  })

  it('est immuable (ne mute pas le journal source)', () => {
    const src = [{ t: 0 }]
    const out = appendEvent(src, { t: 1 })
    expect(src).toHaveLength(1)
    expect(out).not.toBe(src)
  })

  it('utilise TRACK_CAP par défaut', () => {
    expect(TRACK_CAP).toBe(300)
  })
})

describe('buildTrackingExport — valeurs par défaut', () => {
  it('sans meta : build null, date courante, compte 0', () => {
    const out = buildTrackingExport([])
    expect(out.app).toBe('cantou-ux')
    expect(out.schema).toBe(1)
    expect(out.build).toBeNull()
    expect(out.count).toBe(0)
    expect(out.events).toEqual([])
    expect(out.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('accepte un journal null (repli sur tableau vide)', () => {
    const out = buildTrackingExport(null, { build: 7 })
    expect(out.count).toBe(0)
    expect(out.events).toEqual([])
    expect(out.build).toBe(7)
  })

  it('accepte build = 0 sans le confondre avec « absent »', () => {
    expect(buildTrackingExport([], { build: 0 }).build).toBe(0)
  })

  it('formate `now` en ISO', () => {
    expect(buildTrackingExport([], { now: 1700000000000 }).exportedAt)
      .toBe('2023-11-14T22:13:20.000Z')
  })

  it('honore now = 0 (epoch) au lieu de le confondre avec « non fourni »', () => {
    // Garde `!= null` : un horodatage 0 est une valeur valide. Un test de
    // véracité (`meta.now ?`) l'aurait silencieusement remplacé par l'heure
    // courante — c'était le cas avant correction.
    const out = buildTrackingExport([], { now: 0 })
    expect(out.exportedAt).toBe('1970-01-01T00:00:00.000Z')
  })

  it('retombe sur l’heure courante quand now est absent', () => {
    const out = buildTrackingExport([], {})
    expect(Date.parse(out.exportedAt)).toBeGreaterThan(0)
  })

  it('sérialise en JSON sans erreur (contrat de partage)', () => {
    const json = JSON.stringify(buildTrackingExport([{ t: 1, type: 'tab', key: 'x' }], { build: 1 }))
    expect(JSON.parse(json).events[0].key).toBe('x')
  })
})

describe('summarize — cas limites', () => {
  it('accepte null/undefined', () => {
    expect(summarize(null)).toEqual({ total: 0, byType: {}, byKey: {} })
    expect(summarize(undefined).total).toBe(0)
  })

  it('ignore les évènements sans clé dans byKey mais les compte dans byType', () => {
    const s = summarize([{ type: 'tab' }, { type: 'tab', key: '' }, { type: 'tab', key: 'a' }])
    expect(s.total).toBe(3)
    expect(s.byType.tab).toBe(3)
    expect(s.byKey).toEqual({ a: 1 })
  })

  it('regroupe un type undefined sous la clé « undefined »', () => {
    const s = summarize([{ key: 'a' }])
    expect(s.byType).toEqual({ undefined: 1 })
  })
})

/* ------------------------------------------------------------------ *
 * Persistance — chemins d'erreur
 * ------------------------------------------------------------------ */

describe('persistance — chemins d’erreur', () => {
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

  it('loadTrack() renvoie [] quand rien n’est stocké', () => {
    setStorage(memory())
    expect(loadTrack()).toEqual([])
  })

  it('loadTrack() renvoie [] sur JSON corrompu', () => {
    const ls = memory()
    ls.store[TRACK_KEY] = '{pas du json'
    setStorage(ls)
    expect(loadTrack()).toEqual([])
  })

  it('loadTrack() renvoie [] si localStorage lève (mode privé)', () => {
    setStorage({ getItem: () => { throw new Error('SecurityError') } })
    expect(loadTrack()).toEqual([])
  })

  it('saveTrack() avale une erreur de quota sans planter', () => {
    setStorage({ setItem: () => { throw new Error('QuotaExceededError') } })
    expect(() => saveTrack([{ t: 1 }])).not.toThrow()
  })

  it('clearTrack() avale une erreur de suppression sans planter', () => {
    setStorage({ removeItem: () => { throw new Error('nope') } })
    expect(() => clearTrack()).not.toThrow()
  })

  it('track() normalise une clé absente en chaîne vide et horodate', () => {
    const ls = memory()
    setStorage(ls)
    track('tab')
    const [ev] = JSON.parse(ls.store[TRACK_KEY])
    expect(ev.key).toBe('')
    expect(ev.type).toBe('tab')
    expect(typeof ev.t).toBe('number')
  })

  it('track() convertit une clé numérique en chaîne', () => {
    const ls = memory()
    setStorage(ls)
    track('screen', 3)
    expect(JSON.parse(ls.store[TRACK_KEY])[0].key).toBe('3')
  })

  it('track() ne plante pas si localStorage est indisponible', () => {
    setStorage({
      getItem: () => { throw new Error('x') },
      setItem: () => { throw new Error('x') },
    })
    expect(() => track('tab', 'accueil')).not.toThrow()
  })
})

/* ------------------------------------------------------------------ *
 * shareTracking — branches de partage
 * ------------------------------------------------------------------ */

describe('shareTracking', () => {
  beforeEach(() => {
    native.value = false
    shareNative.mockReset().mockResolvedValue(undefined)
  })

  afterEach(() => {
    delete navigator.share
    delete navigator.clipboard
  })

  const setNav = (key, value) =>
    Object.defineProperty(navigator, key, { value, configurable: true, writable: true })

  it('ne fait rien sans texte', async () => {
    setNav('share', vi.fn())
    await shareTracking('')
    await shareTracking(null)
    expect(navigator.share).not.toHaveBeenCalled()
  })

  it('utilise la feuille native Capacitor sur mobile', async () => {
    native.value = true
    setNav('share', vi.fn())
    await shareTracking('{"app":"cantou-ux"}')
    expect(shareNative).toHaveBeenCalledWith({
      title: 'Parcours Cantou (UX)',
      text: '{"app":"cantou-ux"}',
    })
    expect(navigator.share).not.toHaveBeenCalled()
  })

  it('utilise navigator.share sur le web quand disponible', async () => {
    const webShare = vi.fn().mockResolvedValue(undefined)
    setNav('share', webShare)
    await shareTracking('payload')
    expect(webShare).toHaveBeenCalledWith({ title: 'Parcours Cantou (UX)', text: 'payload' })
    expect(shareNative).not.toHaveBeenCalled()
  })

  it('se rabat sur le presse-papiers sans navigator.share', async () => {
    setNav('share', undefined)
    const writeText = vi.fn().mockResolvedValue(undefined)
    setNav('clipboard', { writeText })
    await shareTracking('payload')
    expect(writeText).toHaveBeenCalledWith('payload')
  })

  it('ne plante pas quand aucun canal de partage n’existe', async () => {
    setNav('share', undefined)
    setNav('clipboard', undefined)
    await expect(shareTracking('payload')).resolves.toBeUndefined()
  })

  it('avale un partage annulé par l’utilisateur', async () => {
    setNav('share', vi.fn().mockRejectedValue(new Error('AbortError')))
    await expect(shareTracking('payload')).resolves.toBeUndefined()
  })

  it('avale une erreur du partage natif', async () => {
    native.value = true
    shareNative.mockRejectedValue(new Error('indispo'))
    await expect(shareTracking('payload')).resolves.toBeUndefined()
  })
})
