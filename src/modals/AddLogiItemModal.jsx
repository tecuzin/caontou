import { useRef } from 'react'
import { s } from '../utils.js'
import { ModalShell } from './ModalShell.jsx'

export function AddLogiItemModal({ isOpen, onClose, selectedLogiKey, newLogiItem, setNewLogiItem, logiLists, darkMode, onSubmit, onSubmitAndNew }) {
  const inputRef = useRef(null)
  if (!isOpen || !selectedLogiKey) return null
  const sx = css => s(css)
  const list = logiLists.find(l => l.key === selectedLogiKey)
  const saveAndNew = () => { onSubmitAndNew(); inputRef.current?.focus() }
  return (
    <ModalShell onClose={onClose} z={200} fade={false}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s;')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Ajouter à {list?.name}</div>
        <div style={sx('font-size:12px;color:#6b6354;margin-bottom:14px;')}>Nouvelle chose à préparer</div>
        <input ref={inputRef} type="text" value={newLogiItem} onChange={e => setNewLogiItem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && onSubmitAndNew) saveAndNew() }} placeholder="Ex: Trousse de secours…" style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;margin-bottom:14px;')} />
        {onSubmitAndNew && (
          <button data-testid="btn-add-logi-item-new" onClick={saveAndNew} style={sx('width:100%;border:1px solid #4a5d3a;background:#fffdf8;color:#4a5d3a;font-weight:700;font-family:Quicksand;border-radius:8px;padding:12px;margin-bottom:10px;cursor:pointer;')}>＋ Enregistrer & nouveau</button>
        )}
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>Annuler</button>
          <button onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>✓ Ajouter</button>
        </div>
      </div>
    </ModalShell>
  )
}
