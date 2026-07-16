import { s } from '../utils.js'
import { ModalShell } from './ModalShell.jsx'

export function EditExpenseModal({ isOpen, onClose, editIdx, expenses, editLabel, setEditLabel, editCat, setEditCat, editAmt, setEditAmt, cats, darkMode, onSubmit, onDelete }) {
  if (!isOpen || editIdx === null) return null
  const sx = css => s(css)
  return (
    <ModalShell onClose={onClose} z={200} fade={false}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s;')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:12px;')}>Éditer dépense</div>
        <div style={sx('margin-bottom:12px;')}>
          <label htmlFor="edit-exp-label" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Libellé</label>
          <input id="edit-exp-label" type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)} style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')} />
        </div>
        <div style={sx('margin-bottom:12px;')}>
          <label htmlFor="edit-exp-cat" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Catégorie</label>
          <select id="edit-exp-cat" value={editCat} onChange={e => setEditCat(e.target.value)} style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')}>
            {cats.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div style={sx('margin-bottom:14px;')}>
          <label htmlFor="edit-exp-amt" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Montant (€)</label>
          <input id="edit-exp-amt" type="number" step="0.01" value={editAmt} onChange={e => setEditAmt(e.target.value)} style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')} />
        </div>
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>Annuler</button>
          <button onClick={() => { onSubmit(); onClose() }} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>✓ Modifier</button>
          <button onClick={onDelete} style={sx('flex:1;border:1px solid #b8503f;background:#f7e2dc;color:#b8503f;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>🗑️ Supprimer</button>
        </div>
      </div>
    </ModalShell>
  )
}
