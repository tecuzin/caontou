import { s } from '../utils.js'

export function EditTripModal({ isOpen, onClose, tripFields, setTripFields, darkMode, onSubmit }) {
  if (!isOpen) return null
  const sx = css => s(css)

  const handleChange = (field, value) => {
    setTripFields(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div onClick={onClose} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
      <div onClick={e => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Paramètres du voyage</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;')}>Ces réglages pilotent le compte à rebours, les cartes et les notifications.</div>
        <div style={sx('display:flex;gap:10px;')}>
          <div style={sx('flex:1;')}>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Date de départ</div>
            <input data-testid="input-trip-start" type="date" value={tripFields.start || ''} onChange={e => handleChange('start', e.target.value)} style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
          </div>
          <div style={sx('flex:1;')}>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Date de retour</div>
            <input data-testid="input-trip-end" type="date" value={tripFields.end || ''} onChange={e => handleChange('end', e.target.value)} style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
          </div>
        </div>
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Ville de départ</div>
        <input data-testid="input-trip-origin" value={tripFields.origin || ''} onChange={e => handleChange('origin', e.target.value)} placeholder="Ex : Beauvais" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Étape (nuit) — optionnel</div>
        <input value={tripFields.etape || ''} onChange={e => handleChange('etape', e.target.value)} placeholder="Ex : Laschamps" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Destination</div>
        <input data-testid="input-trip-dest" value={tripFields.dest || ''} onChange={e => handleChange('dest', e.target.value)} placeholder="Ex : Vezels-Roussy (Cantal)" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
          <button data-testid="btn-save-trip" onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
