import { s } from '../utils.js'

export function EditTrajetStepModal({ isOpen, onClose, editingTrajetIdx, newTrajetTime, setNewTrajetTime, newTrajetPlace, setNewTrajetPlace, newTrajetNote, setNewTrajetNote, newTrajetColor, setNewTrajetColor, darkMode, onSubmit }) {
  if (!isOpen || editingTrajetIdx === null) return null
  const sx = css => s(css)
  return (
    <div onClick={onClose} style={sx('position:fixed;inset:0;z-index:200;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
      <div onClick={e => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Editer etape</div>
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Horaire</div>
        <input value={newTrajetTime} onChange={e => setNewTrajetTime(e.target.value)} placeholder="Ex : 08:30" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Lieu</div>
        <input value={newTrajetPlace} onChange={e => setNewTrajetPlace(e.target.value)} placeholder="Ex : Lyon" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Note</div>
        <input value={newTrajetNote} onChange={e => setNewTrajetNote(e.target.value)} placeholder="Ex : Pause cafe" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Couleur</div>
        <div style={sx('display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;margin-bottom:20px;')}>
          {['#5b7042', '#cf7d3c', '#4f8a86', '#9c6b4a', '#8a8b3d', '#b8503f'].map((c) => (
            <button key={c} onClick={() => setNewTrajetColor(c)} style={sx(`width:32px;height:32px;border-radius:50%;background:${c};border:${newTrajetColor === c ? '3px solid #2f2a22' : '2px solid #d8cbb0'};cursor:pointer;`)} />
          ))}
        </div>
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
          <button onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
