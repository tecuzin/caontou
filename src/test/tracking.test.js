import { describe, it, expect, beforeEach } from 'vitest'
import { appendEvent, buildTrackingExport, summarize, track, loadTrack, clearTrack, TRACK_KEY, TRACK_CAP } from '../tracking.js'

describe('appendEvent (journal en anneau)', () => {
  it('ajoute un évènement', () => {
    const r = appendEvent([], { t: 1, type: 'tab', key: 'accueil' })
    expect(r).toHaveLength(1)
    expect(r[0].key).toBe('accueil')
  })
  it('borne aux `cap` derniers', () => {
    let ev = []
    for (let i = 0; i < TRACK_CAP + 50; i++) ev = appendEvent(ev, { t: i, type: 'tab', key: String(i) })
    expect(ev).toHaveLength(TRACK_CAP)
    expect(ev[0].key).toBe('50') // les 50 premiers sont tombés
    expect(ev[ev.length - 1].key).toBe(String(TRACK_CAP + 49))
  })
})

describe('buildTrackingExport', () => {
  it('enveloppe { app, build, exportedAt, count, events }', () => {
    const events = [{ t: 1, type: 'tab', key: 'budget' }]
    const out = buildTrackingExport(events, { build: 99, now: 0 })
    expect(out.app).toBe('cantou-ux')
    expect(out.build).toBe(99)
    expect(out.count).toBe(1)
    expect(out.events).toBe(events)
    expect(out.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

describe('summarize', () => {
  it('compte par type et par écran', () => {
    const s = summarize([
      { type: 'tab', key: 'accueil' }, { type: 'tab', key: 'budget' },
      { type: 'screen', key: 'carte' }, { type: 'screen', key: 'carte' },
    ])
    expect(s.total).toBe(4)
    expect(s.byType).toEqual({ tab: 2, screen: 2 })
    expect(s.byKey.carte).toBe(2)
  })
})

describe('track / persistance (clé séparée)', () => {
  const store = {}
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k]
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] } },
      configurable: true,
    })
  })
  it('track() écrit sous cantou.track sans toucher cantou.v1', () => {
    track('tab', 'accueil'); track('screen', 'carte')
    expect(loadTrack()).toHaveLength(2)
    expect(store['cantou.v1']).toBeUndefined()
    expect(JSON.parse(store[TRACK_KEY])).toHaveLength(2)
  })
  it('clearTrack() vide le journal', () => {
    track('tab', 'x'); clearTrack()
    expect(loadTrack()).toEqual([])
  })
})
