import { ModalShell } from './ModalShell.jsx'

/** Feuille repas (ajout/édition) — jour + plat. */
export function MealSheet({ sx, onClose, isEdit, day, setDay, dish, setDish, onSubmit }) {
  return (
    <ModalShell onClose={onClose} z={200}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{isEdit ? `Repas du ${day}` : 'Ajouter un repas'}</div>
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Jour</div>
        <input value={day} onChange={(e) => setDay(e.target.value)} placeholder="Ex : Sam 11" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Plat</div>
        <input value={dish} onChange={(e) => setDish(e.target.value)} placeholder="Ex : Truffade maison" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Annuler</button>
          <button onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Enregistrer</button>
        </div>
      </div>
    </ModalShell>
  )
}
