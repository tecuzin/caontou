import { useEffect, useRef, useState } from 'react'
import { drawPostcard, POSTCARD_W, POSTCARD_H } from '../postcard.js'

/**
 * Composeur de carte postale « Carladès » : cadre + légende + date sur une
 * photo, rendu sur un <canvas> (hors-ligne), partageable via la feuille système
 * (ou téléchargé en repli). Overlay plein écran.
 */
export function Postcard({ sx, src, place = 'Carladès · Cantal', date = '', defaultCaption = '', onClose }) {
  const canvasRef = useRef(null)
  const [caption, setCaption] = useState(defaultCaption)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext && canvas.getContext('2d')
    if (!ctx) return
    const render = (img) => drawPostcard(ctx, img, { width: POSTCARD_W, height: POSTCARD_H, caption, place, date })
    if (!src) { render(null); return }
    const img = new Image()
    img.onload = () => render(img)
    img.onerror = () => render(null)
    img.src = src
  }, [src, caption, place, date])

  const share = async () => {
    const canvas = canvasRef.current
    if (!canvas || !canvas.toBlob) return
    setBusy(true)
    canvas.toBlob(async (blob) => {
      try {
        if (!blob) return
        const file = new File([blob], 'carte-postale-carlades.png', { type: 'image/png' })
        if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Carte postale du Carladès' })
        } else {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = 'carte-postale-carlades.png'; a.click()
          URL.revokeObjectURL(url)
        }
      } catch { /* annulé par l'utilisateur */ } finally { setBusy(false) }
    }, 'image/png')
  }

  return (
    <div data-testid="postcard-composer" role="presentation" style={sx('position:fixed;inset:0;z-index:320;background:rgba(20,16,10,0.92);display:flex;flex-direction:column;padding:16px;')}>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;')}>
        <span style={sx('font-family:Quicksand;font-weight:700;font-size:19px;color:#fffaf0;')}>🖼️ Carte postale</span>
        <button data-testid="postcard-close" onClick={onClose} aria-label="Fermer" style={sx('width:36px;height:36px;border:none;background:rgba(255,255,255,0.18);border-radius:50%;color:#fffaf0;font-size:19px;cursor:pointer;')}>✕</button>
      </div>

      <div style={sx('flex:1;display:flex;align-items:center;justify-content:center;min-height:0;')}>
        <canvas data-testid="postcard-canvas" ref={canvasRef} width={POSTCARD_W} height={POSTCARD_H} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }} />
      </div>

      <input
        data-testid="postcard-caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Une légende pour ta carte…"
        style={sx('margin-top:12px;box-sizing:border-box;width:100%;border:none;border-radius:12px;padding:12px;font-size:14px;background:#fffdf8;')}
      />
      <button data-testid="postcard-share" onClick={share} disabled={busy} style={sx('margin-top:10px;border:none;background:#cf7d3c;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:14px;cursor:pointer;')}>{busy ? 'Préparation…' : '📤 Partager la carte postale'}</button>
    </div>
  )
}
