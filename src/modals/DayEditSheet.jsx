import { ModalShell } from './ModalShell.jsx'

/** Feuille « Éditer jour » du planning — titre + sous-titre (+ suppression). */
export function DayEditSheet({ sx, onClose, title, setTitle, sub, setSub, onSubmit, onDelete, canDelete }) {
  return (
    <ModalShell onClose={onClose} z={200}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Editer jour</div>
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Titre</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Le grand depart" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Sous-titre</div>
        <input value={sub} onChange={(e) => setSub(e.target.value)} placeholder="Ex : Laschamps -> Vezels-Roussy" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Annuler</button>
          <button onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Enregistrer</button>
          {canDelete && <button onClick={onDelete} style={sx('flex:0 0 auto;border:none;background:#b8503f;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Supprimer</button>}
        </div>
      </div>
    </ModalShell>
  )
}
