import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DrawPad } from '../screens/DrawPad.jsx'
import { s } from '../utils.js'

/*
 * jsdom n'implémente pas le canvas 2D : on remplace `getContext` par un faux
 * contexte instrumenté et `toDataURL` par une data-URL fixe (même approche que
 * `image-resize.test.js`). On teste ainsi les ORDRES donnés au contexte
 * (couleur, épaisseur, fillRect) plutôt que des pixels.
 */
function stubCanvas({ dataUrl = 'data:image/jpeg;base64,DESSIN123', noContext = false, toDataURLThrows = false } = {}) {
  const ctx = {
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
  }
  const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(() => (noContext ? null : ctx))
  const toDataURL = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL')
    .mockImplementation(() => {
      if (toDataURLThrows) throw new Error('tainted canvas')
      return dataUrl
    })
  return { ctx, getContext, toDataURL }
}

const draw = (from = { clientX: 10, clientY: 12 }, to = { clientX: 60, clientY: 80 }) => {
  const cv = screen.getByTestId('drawpad-canvas')
  fireEvent.pointerDown(cv, { pointerId: 1, ...from })
  fireEvent.pointerMove(cv, { pointerId: 1, ...to })
  fireEvent.pointerUp(cv, { pointerId: 1, ...to })
}

afterEach(() => { vi.restoreAllMocks() })

describe('Coin dessin (UI)', () => {
  it('rend le canvas, la palette et les actions', () => {
    stubCanvas()
    render(<DrawPad sx={s} onSave={vi.fn()} />)

    expect(screen.getByTestId('screen-drawpad')).toBeInTheDocument()
    const cv = screen.getByTestId('drawpad-canvas')
    expect(cv.tagName).toBe('CANVAS')
    expect(cv.width).toBe(360)
    expect(cv.height).toBe(420)
    expect(screen.getAllByTestId(/^drawpad-color-/)).toHaveLength(8)
    expect(screen.getByTestId('drawpad-eraser')).toBeInTheDocument()
    expect(screen.getByTestId('drawpad-clear')).toBeInTheDocument()
  })

  it('peint le fond crème au montage (le JPEG n\'a pas de transparence)', () => {
    const { ctx } = stubCanvas()
    render(<DrawPad sx={s} />)

    expect(ctx.fillStyle).toBe('#fffdf8')
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 360, 420)
  })

  it('dessine un trait au pointeur avec la couleur par défaut', () => {
    const { ctx } = stubCanvas()
    render(<DrawPad sx={s} />)

    draw()

    expect(ctx.strokeStyle).toBe('#4a5d3a')
    expect(ctx.lineWidth).toBe(6)
    expect(ctx.beginPath).toHaveBeenCalled()
    expect(ctx.lineTo).toHaveBeenCalledTimes(2) // point du tap + segment du déplacement
    expect(ctx.stroke).toHaveBeenCalledTimes(2)
  })

  it('ignore un déplacement sans appui préalable', () => {
    const { ctx } = stubCanvas()
    render(<DrawPad sx={s} />)

    fireEvent.pointerMove(screen.getByTestId('drawpad-canvas'), { pointerId: 1, clientX: 5, clientY: 5 })

    expect(ctx.stroke).not.toHaveBeenCalled()
  })

  it('change de couleur quand on touche une pastille', async () => {
    const user = userEvent.setup()
    const { ctx } = stubCanvas()
    render(<DrawPad sx={s} />)

    await user.click(screen.getByTestId('drawpad-color-b8503f'))
    expect(screen.getByTestId('drawpad-color-b8503f')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('drawpad-color-4a5d3a')).toHaveAttribute('aria-pressed', 'false')

    draw()
    expect(ctx.strokeStyle).toBe('#b8503f')
  })

  it('la gomme peint large avec la couleur de fond, puis une pastille la désactive', async () => {
    const user = userEvent.setup()
    const { ctx } = stubCanvas()
    render(<DrawPad sx={s} />)

    await user.click(screen.getByTestId('drawpad-eraser'))
    expect(screen.getByTestId('drawpad-eraser')).toHaveAttribute('aria-pressed', 'true')
    draw()
    expect(ctx.strokeStyle).toBe('#fffdf8')
    expect(ctx.lineWidth).toBe(26)

    await user.click(screen.getByTestId('drawpad-color-cf7d3c'))
    expect(screen.getByTestId('drawpad-eraser')).toHaveAttribute('aria-pressed', 'false')
    draw()
    expect(ctx.strokeStyle).toBe('#cf7d3c')
    expect(ctx.lineWidth).toBe(6)
  })

  it('« Effacer tout » repeint tout le fond', async () => {
    const user = userEvent.setup()
    const { ctx } = stubCanvas()
    render(<DrawPad sx={s} />)
    ctx.fillRect.mockClear()

    await user.click(screen.getByTestId('drawpad-clear'))

    expect(ctx.fillStyle).toBe('#fffdf8')
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 360, 420)
  })

  it('appelle onSave avec une base64 JPEG SANS le préfixe data:', async () => {
    const user = userEvent.setup()
    const { toDataURL } = stubCanvas({ dataUrl: 'data:image/jpeg;base64,DESSIN123' })
    const onSave = vi.fn()
    render(<DrawPad sx={s} onSave={onSave} />)

    draw()
    await user.click(screen.getByTestId('drawpad-save'))

    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8)
    expect(onSave).toHaveBeenCalledTimes(1)
    const arg = onSave.mock.calls[0][0]
    expect(arg).toBe('DESSIN123')
    expect(arg.startsWith('data:')).toBe(false)
    expect(screen.getByTestId('drawpad-saved')).toBeInTheDocument()
  })

  it('n\'appelle pas onSave si l\'export du canvas échoue', async () => {
    const user = userEvent.setup()
    stubCanvas({ toDataURLThrows: true })
    const onSave = vi.fn()
    render(<DrawPad sx={s} onSave={onSave} />)

    await user.click(screen.getByTestId('drawpad-save'))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.queryByTestId('drawpad-saved')).toBeNull()
  })

  it('masque le bouton d\'enregistrement quand onSave est absent', () => {
    stubCanvas()
    render(<DrawPad sx={s} />)

    expect(screen.queryByTestId('drawpad-save')).toBeNull()
    expect(screen.getByTestId('drawpad-clear')).toBeInTheDocument()
  })

  it('ne casse pas si le contexte 2D est indisponible', () => {
    stubCanvas({ noContext: true })
    expect(() => {
      render(<DrawPad sx={s} onSave={vi.fn()} />)
      draw()
    }).not.toThrow()
  })
})
