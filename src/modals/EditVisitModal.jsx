import { s } from '../utils.js'

export function EditVisitModal({ isOpen, onClose, editIdx, editVisitName, setEditVisitName, editVisitDist, setEditVisitDist, editVisitCat, setEditVisitCat, editVisitNote, setEditVisitNote, darkMode, onSubmit, onDelete }) {
  if (!isOpen) return null
  const sx = css => s(css)
  return (
    <div onClick={onClose} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
      <div onClick={e => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{editIdx === null ? 'Ajouter une visite' : 'Editer visite'}</div>
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Nom</div>
        <input value={editVisitName} onChange={e => setEditVisitName(e.target.value)} placeholder="Ex : Pas de Cère" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Categorie</div>
        <select value={editVisitCat} onChange={e => setEditVisitCat(e.target.value)} style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')}>
          <option>Nature</option>
          <option>Famille</option>
          <option>Patrimoine</option>
          <option>Baignade</option>
          <option>Gourmand</option>
          <option>Marche</option>
        </select>
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Distance</div>
        <input value={editVisitDist} onChange={e => setEditVisitDist(e.target.value)} placeholder="Ex : 25 min" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Age recommande</div>
        <input value={editVisitNote} onChange={e => setEditVisitNote(e.target.value)} placeholder="Ex : Des 3 ans" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
          <button onClick={() => { onSubmit(); onClose() }} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
