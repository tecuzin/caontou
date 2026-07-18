import { ModalShell } from './ModalShell.jsx'

/**
 * Feuille dépense (ajout/édition) : montant, libellé, catégorie, payeur
 * (si famille définie) et reçu photo optionnel.
 */
export function ExpenseSheet({
  sx, onClose, isEdit, cats = [],
  amount, setAmount, label, setLabel, cat, setCat,
  familyMembers = [], paidBy, setPaidBy,
  receiptId, setReceiptId, onCaptureReceipt, onSubmit,
}) {
  return (
    <ModalShell onClose={onClose} z={200}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{isEdit ? 'Editer dépense' : 'Nouvelle dépense'}</div>
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Montant</div>
        <input data-testid="input-montant" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00 €" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:19px;font-family:Quicksand;font-weight:700;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Libellé</div>
        <input data-testid="input-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex : Glaces à Dienne" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Catégorie</div>
        <div style={sx('display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;margin-bottom:20px;')}>
          {cats.map((c) => (
            <button key={c.name} onClick={() => setCat(c.name)} style={sx(`border:none;border-radius:999px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;background:${cat === c.name ? c.color : '#f3ece0'};color:${cat === c.name ? '#fffaf0' : '#6b6354'};`)}>{c.name}</button>
          ))}
        </div>
        {familyMembers.length > 0 && (
          <>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Payé par</div>
            <div data-testid="paidby-chips" style={sx('display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;margin-bottom:20px;')}>
              {familyMembers.map((m) => {
                const sel = (paidBy || familyMembers[0]) === m
                return <button key={m} onClick={() => setPaidBy(m)} style={sx(`border:none;border-radius:999px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;background:${sel ? '#4a5d3a' : '#f3ece0'};color:${sel ? '#fffaf0' : '#6b6354'};`)}>{m}</button>
              })}
            </div>
          </>
        )}
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Reçu (photo du ticket)</div>
        <div style={sx('display:flex;align-items:center;gap:10px;margin-top:6px;margin-bottom:20px;')}>
          {receiptId ? (
            <>
              <span style={sx('display:inline-flex;align-items:center;gap:6px;background:#e7ecdf;color:#4a5d3a;border-radius:12px;padding:8px 12px;font-size:13px;font-weight:700;')}>🧾 Reçu attaché</span>
              <button data-testid="btn-remove-receipt" onClick={() => setReceiptId('')} style={sx('border:none;background:transparent;color:#b8503f;cursor:pointer;font-size:13px;font-weight:700;')}>Retirer</button>
            </>
          ) : (
            <>
              <button data-testid="btn-receipt-camera" onClick={() => onCaptureReceipt('camera')} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px;cursor:pointer;')}>📷 Photographier</button>
              <button data-testid="btn-receipt-gallery" onClick={() => onCaptureReceipt('photos')} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px;cursor:pointer;')}>🖼️ Importer</button>
            </>
          )}
        </div>
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Annuler</button>
          <button data-testid="btn-submit-depense" onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>{isEdit ? 'Enregistrer' : 'Ajouter'}</button>
        </div>
      </div>
    </ModalShell>
  )
}
