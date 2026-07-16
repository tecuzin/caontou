import { s } from '../utils.js'
import { ModalShell } from './ModalShell.jsx'

export function EditBudgetModal({ isOpen, onClose, newBudgetTotal, setNewBudgetTotal, budgetTotal, darkMode, onSubmit }) {
  if (!isOpen) return null
  const sx = css => s(css)
  return (
    <ModalShell onClose={onClose} z={200} fade={true}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Budget total</div>
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Montant (€)</div>
        <input type="number" value={newBudgetTotal} onChange={e => setNewBudgetTotal(e.target.value)} placeholder={String(budgetTotal)} style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} onKeyDown={e => e.key === 'Enter' && onSubmit()} />
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Annuler</button>
          <button onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Enregistrer</button>
        </div>
      </div>
    </ModalShell>
  )
}
