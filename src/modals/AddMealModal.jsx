import { s } from '../utils.js'
import { ModalShell } from './ModalShell.jsx'

export function AddMealModal({ isOpen, onClose, newMealDay, setNewMealDay, newMealType, setNewMealType, newMealLabel, setNewMealLabel, days, darkMode, onSubmit }) {
  if (!isOpen) return null
  const sx = css => s(css)
  return (
    <ModalShell onClose={onClose} z={200} fade={false}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s;')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:12px;')}>Ajouter un repas</div>
        <div style={sx('margin-bottom:12px;')}>
          <label htmlFor="add-meal-day" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Jour</label>
          <select id="add-meal-day" value={newMealDay} onChange={e => setNewMealDay(Number(e.target.value))} style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')}>
            {days.map((d, i) => <option key={i} value={i}>J{i} — {d.title}</option>)}
          </select>
        </div>
        <div style={sx('margin-bottom:12px;')}>
          <label htmlFor="add-meal-type" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Type</label>
          <select id="add-meal-type" value={newMealType} onChange={e => setNewMealType(e.target.value)} style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')}>
            <option value="petit-dej">Petit-déj</option>
            <option value="dejeuner">Déjeuner</option>
            <option value="gouter">Goûter</option>
            <option value="diner">Dîner</option>
          </select>
        </div>
        <div style={sx('margin-bottom:14px;')}>
          <label htmlFor="add-meal-label" style={sx('display:block;font-size:12px;font-weight:600;color:#6b6354;margin-bottom:6px;')}>Plat</label>
          <input id="add-meal-label" type="text" value={newMealLabel} onChange={e => setNewMealLabel(e.target.value)} placeholder="Croque-monsieur…" style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;')} />
        </div>
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>Annuler</button>
          <button onClick={onSubmit} style={sx('flex:1;border:none;background:#9c6b4a;color:#fffaf0;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>✓ Ajouter</button>
        </div>
      </div>
    </ModalShell>
  )
}
