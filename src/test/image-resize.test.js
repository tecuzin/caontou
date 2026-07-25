import { describe, it, expect, vi, afterEach } from 'vitest'
import { resizeBase64Jpeg } from '../image.js'

/*
 * jsdom n'a pas de vrai canvas : on simule `Image` + `document.createElement('canvas')`
 * pour couvrir le chemin nominal de redimensionnement ET tous les replis
 * (« on ne perd jamais une photo »).
 */

const BIG = 'A'.repeat(4000) // base64 « original » volumineux

/** Fabrique un faux constructeur Image qui charge (ou échoue) de façon asynchrone. */
function stubImage({ width = 4000, height = 3000, natural = true, fail = false } = {}) {
  const instances = []
  class FakeImage {
    constructor() {
      this.onload = null
      this.onerror = null
      this.naturalWidth = natural ? width : 0
      this.naturalHeight = natural ? height : 0
      this.width = width
      this.height = height
      instances.push(this)
    }
    set src(v) {
      this._src = v
      queueMicrotask(() => {
        if (fail) this.onerror?.(new Error('decode failed'))
        else this.onload?.()
      })
    }
    get src() { return this._src }
  }
  vi.stubGlobal('Image', FakeImage)
  return instances
}

/** Remplace `document.createElement('canvas')` par un faux canvas instrumenté. */
function stubCanvas({ ctx = {}, dataUrl = 'data:image/jpeg;base64,SHORT', toDataURLThrows = false, noContext = false, noGetContext = false } = {}) {
  const drawImage = vi.fn()
  const toDataURL = vi.fn(() => {
    if (toDataURLThrows) throw new Error('tainted canvas')
    return dataUrl
  })
  const canvas = {
    width: 0,
    height: 0,
    drawImage,
    toDataURL,
    getContext: vi.fn(() => (noContext ? null : { drawImage, ...ctx })),
  }
  if (noGetContext) delete canvas.getContext
  const real = document.createElement.bind(document)
  const spy = vi.spyOn(document, 'createElement').mockImplementation((tag, ...rest) =>
    (tag === 'canvas' ? canvas : real(tag, ...rest)))
  return { canvas, drawImage, toDataURL, spy }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('resizeBase64Jpeg() — chemin nominal', () => {
  it('redimensionne, ré-encode en JPEG et garde la version réduite', async () => {
    stubImage({ width: 4000, height: 3000 })
    const { canvas, drawImage, toDataURL } = stubCanvas({ dataUrl: 'data:image/jpeg;base64,PETIT' })

    const out = await resizeBase64Jpeg(BIG)

    expect(out).toBe('PETIT')
    expect(canvas.width).toBe(1600)
    expect(canvas.height).toBe(1200)
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1600, 1200)
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8)
  })

  it('respecte les options maxEdge et quality', async () => {
    stubImage({ width: 2000, height: 1000 })
    const { canvas, toDataURL } = stubCanvas({ dataUrl: 'data:image/jpeg;base64,X' })

    await resizeBase64Jpeg(BIG, { maxEdge: 400, quality: 0.5 })

    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(200)
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.5)
  })

  it('utilise width/height quand naturalWidth vaut 0 (image non décodée)', async () => {
    stubImage({ width: 3200, height: 800, natural: false })
    const { canvas } = stubCanvas({ dataUrl: 'data:image/jpeg;base64,Y' })

    await resizeBase64Jpeg(BIG, { maxEdge: 1600 })

    expect(canvas.width).toBe(1600)
    expect(canvas.height).toBe(400)
  })

  it('charge bien une data-URL JPEG construite depuis la base64', async () => {
    const instances = stubImage({ width: 100, height: 100 })
    stubCanvas({ dataUrl: 'data:image/jpeg;base64,Z' })

    await resizeBase64Jpeg('ABCD')

    expect(instances[0].src).toBe('data:image/jpeg;base64,ABCD')
  })
})

describe('resizeBase64Jpeg() — repli sur l\'original (on ne perd jamais une photo)', () => {
  it('renvoie l\'original si le canvas n\'a pas de contexte 2D', async () => {
    stubImage()
    const { toDataURL } = stubCanvas({ noContext: true })

    await expect(resizeBase64Jpeg(BIG)).resolves.toBe(BIG)
    expect(toDataURL).not.toHaveBeenCalled()
  })

  it('renvoie l\'original si le canvas n\'expose même pas getContext', async () => {
    stubImage()
    stubCanvas({ noGetContext: true })

    await expect(resizeBase64Jpeg(BIG)).resolves.toBe(BIG)
  })

  it('renvoie l\'original si toDataURL lève une exception', async () => {
    stubImage()
    stubCanvas({ toDataURLThrows: true })

    await expect(resizeBase64Jpeg(BIG)).resolves.toBe(BIG)
  })

  it('renvoie l\'original si l\'image ne charge pas (onerror)', async () => {
    stubImage({ fail: true })
    const { spy } = stubCanvas()

    await expect(resizeBase64Jpeg(BIG)).resolves.toBe(BIG)
    expect(spy).not.toHaveBeenCalledWith('canvas')
  })

  it('renvoie l\'original si les dimensions décodées sont invalides', async () => {
    stubImage({ width: 0, height: 0, natural: false })
    const { spy } = stubCanvas()

    await expect(resizeBase64Jpeg(BIG)).resolves.toBe(BIG)
    expect(spy).not.toHaveBeenCalledWith('canvas')
  })

  it('renvoie l\'original si toDataURL ne renvoie pas une data-URL (pas de virgule)', async () => {
    stubImage()
    stubCanvas({ dataUrl: 'pas-une-data-url' })

    await expect(resizeBase64Jpeg(BIG)).resolves.toBe(BIG)
  })

  it('renvoie l\'original si le résultat est vide', async () => {
    stubImage()
    stubCanvas({ dataUrl: 'data:image/jpeg;base64,' })

    await expect(resizeBase64Jpeg(BIG)).resolves.toBe(BIG)
  })

  it('garde l\'original si le « redimensionné » est plus lourd', async () => {
    stubImage({ width: 200, height: 100 })
    stubCanvas({ dataUrl: `data:image/jpeg;base64,${'B'.repeat(9000)}` })

    await expect(resizeBase64Jpeg(BIG)).resolves.toBe(BIG)
  })

  it('renvoie l\'original hors DOM (document indisponible)', async () => {
    vi.stubGlobal('document', undefined)
    await expect(resizeBase64Jpeg(BIG)).resolves.toBe(BIG)
  })

  it('renvoie l\'original si le constructeur Image est absent', async () => {
    vi.stubGlobal('Image', undefined)
    await expect(resizeBase64Jpeg(BIG)).resolves.toBe(BIG)
  })
})
