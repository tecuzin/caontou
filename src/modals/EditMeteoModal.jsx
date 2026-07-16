import { s } from '../utils.js'
import { ModalShell } from './ModalShell.jsx'

export function EditMeteoModal({ isOpen, onClose, editIdx, editMeteoDay, editMeteoTemp, setEditMeteoTemp, editMeteoIcon, setEditMeteoIcon, editMeteoDesc, setEditMeteoDesc, darkMode, onSubmit }) {
  if (!isOpen || editIdx === null) return null
  const sx = css => s(css)
  return (
    <ModalShell onClose={onClose} z={200} fade={false}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s;')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:12px;')}>Éditer météo</div>
        <div style={sx('margin-bottom:12px;')}>
          <label htmlFor="edit-meteo-temp" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Température (°C)</label>
          <input id="edit-meteo-temp" type="number" value={editMeteoTemp} onChange={e => setEditMeteoTemp(e.target.value)} style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')} />
        </div>
        <div style={sx('margin-bottom:12px;')}>
          <label htmlFor="edit-meteo-icon" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Icône</label>
          <input id="edit-meteo-icon" type="text" value={editMeteoIcon} onChange={e => setEditMeteoIcon(e.target.value)} placeholder="☀️, 🌧️, ☁️…" style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')} />
        </div>
        <div style={sx('margin-bottom:14px;')}>
          <label htmlFor="edit-meteo-desc" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Description</label>
          <input id="edit-meteo-desc" type="text" value={editMeteoDesc} onChange={e => setEditMeteoDesc(e.target.value)} placeholder="Couvert, dégagé…" style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')} />
        </div>
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>Annuler</button>
          <button onClick={() => { onSubmit(); onClose() }} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>✓ Modifier</button>
        </div>
      </div>
    </ModalShell>
  )
}
