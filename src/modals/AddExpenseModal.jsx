import { s } from '../utils.js'
import { ModalShell } from './ModalShell.jsx'

export function AddExpenseModal({ isOpen, onClose, newLabel, setNewLabel, newCat, setNewCat, newAmt, setNewAmt, cats, darkMode, onSubmit }) {
  if (!isOpen) return null
  const sx = css => s(css)
  return (
    <ModalShell onClose={onClose} z={200} fade={false}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s;')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:12px;')}>Ajouter une dépense</div>
        <div style={sx('margin-bottom:12px;')}>
          <label htmlFor="add-exp-label" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Libellé</label>
          <input id="add-exp-label" type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Musée, essence…" style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')} />
        </div>
        <div style={sx('margin-bottom:12px;')}>
          <label htmlFor="add-exp-cat" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Catégorie</label>
          <select id="add-exp-cat" value={newCat} onChange={e => setNewCat(e.target.value)} style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')}>
            {cats.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div style={sx('margin-bottom:14px;')}>
          <label htmlFor="add-exp-amt" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Montant (€)</label>
          <input id="add-exp-amt" type="number" step="0.01" value={newAmt} onChange={e => setNewAmt(e.target.value)} placeholder="0.00" style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')} />
        </div>
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>Annuler</button>
          <button onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>✓ Ajouter</button>
        </div>
      </div>
    </ModalShell>
  )
}
