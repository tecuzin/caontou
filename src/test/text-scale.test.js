import { describe, it, expect } from 'vitest'
import { applyTextScale, scaleFactor, TEXT_SCALES } from '../text-scale.js'

describe('applyTextScale()', () => {
  it('agrandit les tailles de police', () => {
    expect(applyTextScale('font-size:15px;', 1.2)).toBe('font-size:18px;')
    expect(applyTextScale('font-size:12px;font-size:26px;', 1.5)).toBe('font-size:18px;font-size:39px;')
  })

  it('facteur 1 → identité (aucune transformation)', () => {
    const css = 'font-size:15px;color:#2f2a22;'
    expect(applyTextScale(css, 1)).toBe(css)
  })

  it('NE touche PAS aux rayons, paddings et largeurs', () => {
    // C'est le point critique : agrandir le texte ne doit pas déformer la mise en page.
    const css = 'border-radius:14px;padding:12px 14px;width:54px;height:28px;font-size:13px;'
    expect(applyTextScale(css, 1.3)).toBe('border-radius:14px;padding:12px 14px;width:54px;height:28px;font-size:17px;')
  })

  it('laisse une chaîne sans font-size inchangée', () => {
    const css = 'background:#fffdf8;border-radius:16px;'
    expect(applyTextScale(css, 1.3)).toBe(css)
  })

  it('ignore les facteurs aberrants', () => {
    const css = 'font-size:15px;'
    expect(applyTextScale(css, 0)).toBe(css)
    expect(applyTextScale(css, -2)).toBe(css)
    expect(applyTextScale(css, NaN)).toBe(css)
    expect(applyTextScale(css, undefined)).toBe(css)
  })

  it('tolère une entrée non-chaîne', () => {
    expect(applyTextScale(null, 1.2)).toBe(null)
    expect(applyTextScale(42, 1.2)).toBe(42)
  })

  it('est stable (même entrée → même sortie, cache)', () => {
    const css = 'font-size:14px;'
    expect(applyTextScale(css, 1.15)).toBe(applyTextScale(css, 1.15))
  })

  it('ne descend jamais sous 1px', () => {
    expect(applyTextScale('font-size:1px;', 0.01)).toBe('font-size:1px;')
  })

  it('gère les tailles décimales', () => {
    expect(applyTextScale('font-size:12.5px;', 2)).toBe('font-size:25px;')
  })
})

describe('scaleFactor()', () => {
  it('renvoie le facteur du palier', () => {
    expect(scaleFactor('normal')).toBe(1)
    expect(scaleFactor('grand')).toBe(1.15)
    expect(scaleFactor('tresGrand')).toBe(1.3)
  })
  it('retombe sur « normal » si la clé est inconnue', () => {
    expect(scaleFactor('nawak')).toBe(1)
    expect(scaleFactor(undefined)).toBe(1)
  })
  it('expose des paliers bien formés', () => {
    TEXT_SCALES.forEach((s) => {
      expect(s.key).toBeTruthy(); expect(s.label).toBeTruthy()
      expect(s.factor).toBeGreaterThan(0)
    })
  })
})
