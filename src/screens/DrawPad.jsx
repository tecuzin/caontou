import { useCallback, useEffect, useRef, useState } from 'react'

/** Fond du dessin — même crème que les cartes de l'app (le JPEG n'a pas
 *  d'alpha : sans ce fond peint, l'export serait noir). */
const BG = '#fffdf8'

/** Palette enfant, strictement issue des couleurs déjà utilisées dans l'app. */
const COLORS = [
  { hex: '#4a5d3a', label: 'Vert forêt' },
  { hex: '#5b7042', label: 'Vert prairie' },
  { hex: '#8a8b3d', label: 'Vert olive' },
  { hex: '#4f8a86', label: 'Bleu lac' },
  { hex: '#b8503f', label: 'Rouge brique' },
  { hex: '#cf7d3c', label: 'Orange' },
  { hex: '#e8c07a', label: 'Jaune blé' },
  { hex: '#9c6b4a', label: 'Brun bois' },
]

const W = 360
const H = 420
const PEN = 6
const ERASER = 26

/**
 * Coin dessin libre — canvas tactile pour les enfants (jours de pluie).
 *
 * 100 % hors-ligne, sans dépendance : `<canvas>` natif piloté aux events
 * *pointer* (un seul jeu d'events pour le doigt et la souris). La gomme n'est
 * qu'un trait large peint avec la couleur de fond : pas de `globalCompositeOperation`
 * à gérer, et l'export JPEG reste correct.
 *
 * `onSave` reçoit la base64 **sans** le préfixe `data:image/jpeg;base64,` :
 * c'est le format qu'attend le pipeline photo (`usePhotos` / `Filesystem.writeFile`).
 * Sans `onSave`, le bouton d'enregistrement n'est pas rendu.
 */
export function DrawPad({ sx, onSave }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const [color, setColor] = useState(COLORS[0].hex)
  const [erasing, setErasing] = useState(false)
  const [saved, setSaved] = useState(false)

  const ctx2d = () => {
    const cv = canvasRef.current
    try { return (cv && cv.getContext) ? cv.getContext('2d') : null } catch { return null }
  }

  const clearAll = useCallback(() => {
    const c = ctx2d()
    if (!c) return
    c.fillStyle = BG
    c.fillRect(0, 0, W, H)
    setSaved(false)
  }, [])

  // Fond peint au montage (sinon le canvas est transparent → JPEG noir).
  useEffect(() => { clearAll() }, [clearAll])

  /** Coordonnées pointer → coordonnées canvas (le canvas est affiché en CSS
   *  fluide, sa résolution interne est fixe). */
  const point = (e) => {
    const cv = canvasRef.current
    const r = cv && cv.getBoundingClientRect ? cv.getBoundingClientRect() : null
    const rw = r && r.width ? r.width : W
    const rh = r && r.height ? r.height : H
    return {
      x: ((e.clientX || 0) - (r ? r.left : 0)) * (W / rw),
      y: ((e.clientY || 0) - (r ? r.top : 0)) * (H / rh),
    }
  }

  const start = (e) => {
    const c = ctx2d()
    if (!c) return
    drawing.current = true
    try { canvasRef.current.setPointerCapture?.(e.pointerId) } catch { }
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.strokeStyle = erasing ? BG : color
    c.lineWidth = erasing ? ERASER : PEN
    const p = point(e)
    c.beginPath()
    c.moveTo(p.x, p.y)
    // Un simple tap doit laisser un point, pas rien.
    c.lineTo(p.x, p.y)
    c.stroke()
    setSaved(false)
  }

  const move = (e) => {
    if (!drawing.current) return
    const c = ctx2d()
    if (!c) return
    const p = point(e)
    c.lineTo(p.x, p.y)
    c.stroke()
  }

  const end = () => { drawing.current = false }

  const save = () => {
    const cv = canvasRef.current
    if (!cv || !onSave) return
    let url = ''
    try { url = cv.toDataURL('image/jpeg', 0.8) || '' } catch { return }
    const i = url.indexOf(',')
    const b64 = i >= 0 ? url.slice(i + 1) : url
    if (!b64) return
    onSave(b64)
    setSaved(true)
  }

  const pick = (hex) => { setColor(hex); setErasing(false); }

  const swatch = (active) =>
    `width:38px;height:38px;border-radius:20px;cursor:pointer;padding:0;border:${active ? '4px solid #2f2a22' : '2px solid #efe6d4'};`

  return (
    <div data-testid="screen-drawpad" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>🎨 Coin dessin</div>
        <div style={sx('font-size:13px;font-weight:700;color:#6b6354;')}>Jour de pluie</div>
      </div>

      <canvas
        data-testid="drawpad-canvas"
        ref={canvasRef}
        width={W}
        height={H}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
        style={sx('width:100%;height:auto;display:block;border-radius:16px;border:2px solid #efe6d4;background:#fffdf8;touch-action:none;box-shadow:0 4px 14px rgba(74,93,58,0.08);')}
      />

      <div style={sx('display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;')}>
        {COLORS.map((c) => (
          <button
            key={c.hex}
            data-testid={`drawpad-color-${c.hex.slice(1)}`}
            aria-label={c.label}
            aria-pressed={!erasing && color === c.hex}
            onClick={() => pick(c.hex)}
            style={sx(`${swatch(!erasing && color === c.hex)}background:${c.hex};`)}
          />
        ))}
      </div>

      <div style={sx('display:flex;gap:10px;margin-top:16px;')}>
        <button
          data-testid="drawpad-eraser"
          aria-pressed={erasing}
          onClick={() => setErasing(true)}
          style={sx(`flex:1;border:${erasing ? '2px solid #4a5d3a' : '2px solid #d8cbb0'};background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;`)}
        >🧽 Gomme</button>
        <button
          data-testid="drawpad-clear"
          onClick={clearAll}
          style={sx('flex:1;border:2px solid #d8cbb0;background:#fffdf8;color:#b8503f;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}
        >🗑️ Effacer tout</button>
      </div>

      {onSave && (
        <button
          data-testid="drawpad-save"
          onClick={save}
          style={sx('width:100%;margin-top:12px;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:14px;cursor:pointer;')}
        >💾 Enregistrer dans les souvenirs</button>
      )}

      {saved && (
        <div data-testid="drawpad-saved" style={sx('margin-top:12px;text-align:center;font-size:13px;font-weight:700;color:#4a5d3a;')}>
          ✅ Dessin ajouté aux souvenirs
        </div>
      )}

      <div style={sx('margin-top:16px;font-size:12px;color:#9a917f;text-align:center;')}>
        Dessine avec le doigt · choisis une couleur, gomme, recommence.
      </div>
    </div>
  )
}
