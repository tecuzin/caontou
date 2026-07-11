/** Ajout/édition d'un resto (nom, lieu, téléphone, note de réservation, statut). */
export function RestoModal({ isOpen, onClose, sx, editing, fields, setField, onSubmit, onDelete }) {
  if (!isOpen) return null
  return (
    <div onClick={onClose} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
      <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:82vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{editing ? 'Modifier le resto' : 'Ajouter un resto'}</div>

        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Nom</div>
        <input data-testid="resto-name" value={fields.name} onChange={(e) => setField('name', e.target.value)} placeholder="Ex : Auberge du Carladès" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />

        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Lieu / adresse (→ Google Maps)</div>
        <input data-testid="resto-place" value={fields.place} onChange={(e) => setField('place', e.target.value)} placeholder="Ex : Vic-sur-Cère" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />

        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Téléphone (→ appel)</div>
        <input data-testid="resto-tel" type="tel" value={fields.tel} onChange={(e) => setField('tel', e.target.value)} placeholder="Ex : 04 71 47 50 00" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />

        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Réservation (date, heure, couverts)</div>
        <input data-testid="resto-resa" value={fields.resa} onChange={(e) => setField('resa', e.target.value)} placeholder="Ex : Sam 8 · 20 h · 4 couverts" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />

        <button data-testid="resto-reserved" onClick={() => setField('reserved', !fields.reserved)} style={sx(`width:100%;margin-bottom:18px;border:${fields.reserved ? '2px solid #4a5d3a' : '1px solid #d8cbb0'};background:${fields.reserved ? '#e7ecdf' : '#fffdf8'};color:#3a352b;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:12px;padding:12px;cursor:pointer;`)}>{fields.reserved ? '✓ Réservé' : 'Marquer comme réservé'}</button>

        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
          {editing && <button data-testid="resto-delete" onClick={onDelete} style={sx('flex:0 0 auto;border:1px solid #b8503f;background:#f7e2dc;color:#b8503f;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px 16px;cursor:pointer;')}>🗑️</button>}
          <button data-testid="resto-save" onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
