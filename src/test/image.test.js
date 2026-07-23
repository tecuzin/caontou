import { describe, it, expect } from 'vitest'
import { fitDimensions, resizeBase64Jpeg } from '../image.js'

describe('fitDimensions()', () => {
  it('borne le plus grand côté à maxEdge en conservant le ratio', () => {
    expect(fitDimensions(4000, 3000, 1600)).toEqual({ w: 1600, h: 1200 })
    expect(fitDimensions(3000, 4000, 1600)).toEqual({ w: 1200, h: 1600 })
  })
  it('n\'agrandit jamais une image déjà plus petite', () => {
    expect(fitDimensions(800, 600, 1600)).toEqual({ w: 800, h: 600 })
  })
  it('renvoie {0,0} pour des dimensions invalides', () => {
    expect(fitDimensions(0, 100, 1600)).toEqual({ w: 0, h: 0 })
    expect(fitDimensions(-1, 100, 1600)).toEqual({ w: 0, h: 0 })
  })
  it('garde au moins 1px sur le petit côté', () => {
    const r = fitDimensions(16000, 100, 1600)
    expect(r.w).toBe(1600)
    expect(r.h).toBeGreaterThanOrEqual(1)
  })
})

describe('resizeBase64Jpeg() — gardes (repli sûr)', () => {
  it('renvoie l\'entrée vide/nulle telle quelle sans toucher au canvas', async () => {
    await expect(resizeBase64Jpeg('', {})).resolves.toBe('')
    await expect(resizeBase64Jpeg(null, {})).resolves.toBe(null)
    await expect(resizeBase64Jpeg(undefined)).resolves.toBe(undefined)
  })
})
