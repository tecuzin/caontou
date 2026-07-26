import { describe, it, expect, vi } from 'vitest'
import {
  stringBytes, formatBytes, storeStatus, photosBytes, measureStorage,
  STORE_BUDGET_BYTES, WARN_RATIO,
} from '../storage-usage.js'

describe('stringBytes()', () => {
  it('compte 2 octets par unité de code (localStorage stocke en UTF-16)', () => {
    expect(stringBytes('abc')).toBe(6)
    expect(stringBytes('')).toBe(0)
  })
  it('renvoie 0 pour une entrée non-chaîne', () => {
    expect(stringBytes(null)).toBe(0)
    expect(stringBytes(42)).toBe(0)
  })
})

describe('formatBytes()', () => {
  it('choisit l’unité lisible', () => {
    expect(formatBytes(512)).toBe('512 o')
    expect(formatBytes(2048)).toBe('2 Ko')
    expect(formatBytes(1024 * 1024 * 1.5)).toBe('1,5 Mo')
  })
  it('renvoie un tiret pour une valeur invalide', () => {
    expect(formatBytes(-1)).toBe('—')
    expect(formatBytes('x')).toBe('—')
  })
})

describe('storeStatus() — alerter AVANT la panne', () => {
  it('reste « ok » sous le seuil', () => {
    const s = storeStatus(STORE_BUDGET_BYTES * 0.5)
    expect(s.level).toBe('ok')
    expect(s.pct).toBe(50)
  })
  it('alerte dès 80 %', () => {
    expect(storeStatus(STORE_BUDGET_BYTES * WARN_RATIO).level).toBe('warn')
    expect(storeStatus(STORE_BUDGET_BYTES * 0.79).level).toBe('ok')
  })
  it('passe en « full » à 100 %', () => {
    expect(storeStatus(STORE_BUDGET_BYTES).level).toBe('full')
  })
  it('borne le pourcentage à 100 et donne toujours un conseil', () => {
    const s = storeStatus(STORE_BUDGET_BYTES * 3)
    expect(s.pct).toBe(100)
    expect(s.advice.length).toBeGreaterThan(0)
  })
  it('ne divise pas par zéro si le budget est absurde', () => {
    expect(storeStatus(1000, 0).pct).toBeGreaterThanOrEqual(0)
  })
})

describe('photosBytes()', () => {
  it('additionne en ignorant les tailles invalides', () => {
    expect(photosBytes([100, 200, NaN, -5, undefined])).toBe(300)
    expect(photosBytes([])).toBe(0)
  })
})

describe('measureStorage() — dégrade sans jamais jeter', () => {
  it('mesure le store et les photos', async () => {
    vi.stubGlobal('localStorage', { getItem: () => 'x'.repeat(50) })
    const out = await measureStorage({
      photos: [{ file: 'a.jpeg' }, { file: 'b.jpeg' }],
      statFile: async () => 1000,
    })
    expect(out.storeBytes).toBe(100)
    expect(out.photosBytes).toBe(2000)
    expect(out.photosCount).toBe(2)
    expect(out.level).toBe('ok')
    vi.unstubAllGlobals()
  })

  it('ignore les photos illisibles au lieu d’échouer', async () => {
    vi.stubGlobal('localStorage', { getItem: () => '' })
    const out = await measureStorage({
      photos: [{ file: 'ok.jpeg' }, { file: 'ko.jpeg' }],
      statFile: async (p) => { if (p === 'ko.jpeg') throw new Error('absent'); return 500 },
    })
    expect(out.photosBytes).toBe(500)
    vi.unstubAllGlobals()
  })

  it('renvoie des valeurs neutres si localStorage jette', async () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('bloqué') } })
    const out = await measureStorage({})
    expect(out.storeBytes).toBe(0)
    expect(out.photosBytes).toBe(0)
    vi.unstubAllGlobals()
  })

  it('fonctionne sans statFile (pas de mesure photo)', async () => {
    vi.stubGlobal('localStorage', { getItem: () => 'abc' })
    const out = await measureStorage({ photos: [{ file: 'a.jpeg' }] })
    expect(out.photosBytes).toBe(0)
    expect(out.photosCount).toBe(1)
    vi.unstubAllGlobals()
  })
})
