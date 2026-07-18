import { useState } from 'react'
import { parseSharePayload, applySharedConfig } from '../share-config.js'
import { qrMatrix } from '../qr.js'

/**
 * Partage de configuration entre téléphones, hors-ligne : on **envoie** un
 * QR code + un texte copiable (voyage, favoris, budget, fonctions), l'autre
 * appareil **reçoit** en scannant/collant puis en appliquant. Ne partage pas
 * les photos ni les dépenses.
 */
export function PartageConfig({ sx, payloadText, onShare, setters }) {
  const [received, setReceived] = useState('')
  const [feedback, setFeedback] = useState(null) // { ok, msg }

  const apply = () => {
    const { data, error } = parseSharePayload(received)
    if (error || !data) { setFeedback({ ok: false, msg: error || 'Rien à appliquer.' }); return }
    applySharedConfig(data, setters)
    const n = data.savedIds.length
    setFeedback({ ok: true, msg: `Config appliquée${data.trip ? ' (voyage' : ''}${n ? `${data.trip ? ', ' : ' ('}${n} favori${n > 1 ? 's' : ''}` : ''}${data.trip || n ? ')' : ''}.` })
  }

  const copy = () => { try { navigator.clipboard?.writeText(payloadText) } catch { /* pas de presse-papier */ } }
  const matrix = qrMatrix(payloadText)

  return (
    <div data-testid="screen-partage-config" style={sx('padding:0 18px 24px;')}>
      <div style={sx('font-size:13px;color:#6b6354;margin:2px 0 14px;')}>
        Transfère le voyage, les favoris, le budget et les réglages vers un autre téléphone. Sans réseau — les photos et dépenses ne sont pas partagées.
      </div>

      <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin-bottom:8px;')}>Envoyer</div>
      <div style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:16px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
        {matrix && (
          <div data-testid="qr-code" style={sx('display:flex;justify-content:center;margin-bottom:14px;')}>
            <svg viewBox={`0 0 ${matrix.length} ${matrix.length}`} width="200" height="200" role="img" aria-label="QR code de configuration" shapeRendering="crispEdges" style={{ background: '#ffffff', borderRadius: '8px', padding: '8px', boxSizing: 'content-box' }}>
              {matrix.flatMap((row, y) => row.map((on, x) => on
                ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000000" />
                : null))}
            </svg>
          </div>
        )}
        <textarea data-testid="share-payload" readOnly value={payloadText} rows={3} style={sx('width:100%;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:10px 12px;font-size:12px;font-family:monospace;resize:vertical;color:#6b6354;')} />
        <div style={sx('display:flex;gap:10px;margin-top:10px;')}>
          <button data-testid="btn-copy-config" onClick={copy} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:12px;padding:11px;cursor:pointer;')}>📋 Copier</button>
          {onShare && <button data-testid="btn-share-config" onClick={() => onShare(payloadText)} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:12px;padding:11px;cursor:pointer;')}>📤 Partager</button>}
        </div>
      </div>

      <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin:18px 0 8px;')}>Recevoir</div>
      <div style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:16px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
        <textarea data-testid="receive-payload" value={received} onChange={(e) => { setReceived(e.target.value); setFeedback(null) }} rows={3} placeholder="Colle ici la config reçue de l'autre téléphone…" style={sx('width:100%;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:10px 12px;font-size:13px;font-family:monospace;resize:vertical;')} />
        <button data-testid="btn-apply-config" onClick={apply} disabled={!received.trim()} style={sx(`width:100%;margin-top:10px;border:none;background:${received.trim() ? '#cf7d3c' : '#d8cbb0'};color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:12px;padding:11px;cursor:${received.trim() ? 'pointer' : 'default'};`)}>Appliquer la config reçue</button>
        {feedback && (
          <div data-testid="receive-feedback" style={sx(`margin-top:10px;font-size:13px;font-weight:700;color:${feedback.ok ? '#4a5d3a' : '#b8503f'};`)}>{feedback.ok ? '✅ ' : '⚠️ '}{feedback.msg}</div>
        )}
      </div>
    </div>
  )
}
