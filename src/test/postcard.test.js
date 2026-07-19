import { describe, it, expect } from 'vitest'
import { postcardLayout, truncate, drawPostcard, POSTCARD_W, POSTCARD_H } from '../postcard.js'

describe('postcardLayout', () => {
  it('photo + légende tiennent dans le cadre', () => {
    const L = postcardLayout(1200, 900)
    expect(L.photo.x).toBe(L.border)
    expect(L.photo.w).toBe(1200 - 2 * L.border)
    expect(L.photo.y + L.photo.h).toBeLessThan(900)
    expect(L.caption.y).toBeGreaterThan(L.photo.y + L.photo.h)
  })
})

describe('truncate', () => {
  it('coupe et ajoute … au-delà de la limite', () => {
    expect(truncate('abc', 10)).toBe('abc')
    expect(truncate('abcdefghij', 5)).toBe('abcd…')
    expect(truncate(null)).toBe('')
  })
})

describe('drawPostcard', () => {
  /** Contexte 2D factice qui enregistre les appels. */
  function mockCtx() {
    const calls = []
    return {
      calls, set fillStyle(v) { calls.push(['fillStyle', v]) }, set font(v) { calls.push(['font', v]) },
      set textBaseline(v) {}, fillRect: (...a) => calls.push(['fillRect', ...a]),
      drawImage: (...a) => calls.push(['drawImage', a[1], a[2], a[3], a[4]]),
      fillText: (...a) => calls.push(['fillText', a[0]]),
    }
  }

  it('dessine fond, photo et textes (lieu, légende, date)', () => {
    const ctx = mockCtx()
    const img = { width: 100, height: 100 }
    const L = drawPostcard(ctx, img, { caption: 'Belle journée', date: '5 août 2026', place: 'Carladès · Cantal' })
    const ops = ctx.calls.map((c) => c[0])
    expect(ops).toContain('fillRect')  // fond
    const draw = ctx.calls.find((c) => c[0] === 'drawImage')
    expect(draw.slice(1)).toEqual([L.photo.x, L.photo.y, L.photo.w, L.photo.h])
    const texts = ctx.calls.filter((c) => c[0] === 'fillText').map((c) => c[1])
    expect(texts).toContain('Carladès · Cantal')
    expect(texts).toContain('Belle journée')
    expect(texts).toContain('5 août 2026')
  })

  it('omet la date si absente et gère img null', () => {
    const ctx = mockCtx()
    drawPostcard(ctx, null, { caption: 'Sans photo' })
    expect(ctx.calls.find((c) => c[0] === 'drawImage')).toBeUndefined()
    const texts = ctx.calls.filter((c) => c[0] === 'fillText').map((c) => c[1])
    expect(texts).toContain('Sans photo')
    expect(texts).toHaveLength(2) // lieu + légende, pas de date
  })

  it('exporte des dimensions par défaut', () => {
    expect(POSTCARD_W).toBeGreaterThan(0)
    expect(POSTCARD_H).toBeGreaterThan(0)
  })
})
