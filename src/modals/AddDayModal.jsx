import { ModalShell } from './ModalShell.jsx'

/** Feuille « Ajouter un jour » au planning (jour abrégé, numéro, titre, sous-titre). */
export function AddDayModal({ sx, onClose, dow, setDow, num, setNum, title, setTitle, sub, setSub, onSubmit }) {
  return (
    <ModalShell onClose={onClose} z={200}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Ajouter un jour</div>
        <div style={sx('display:flex;gap:10px;')}>
          <div style={sx('flex:1;')}>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Jour (abrégé)</div>
            <input data-testid="input-day-dow" value={dow} onChange={(e) => setDow(e.target.value)} placeholder="Ex : Dim" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
          </div>
          <div style={sx('flex:1;')}>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Numéro</div>
            <input data-testid="input-day-num" value={num} onChange={(e) => setNum(e.target.value)} placeholder="Ex : 16" inputMode="numeric" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
          </div>
        </div>
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Titre</div>
        <input data-testid="input-day-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Journée détente" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Sous-titre</div>
        <input value={sub} onChange={(e) => setSub(e.target.value)} placeholder="Ex : Au gré de l'envie" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Annuler</button>
          <button data-testid="btn-save-day-add" onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Ajouter</button>
        </div>
      </div>
    </ModalShell>
  )
}
