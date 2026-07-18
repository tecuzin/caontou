import { ModalShell } from './ModalShell.jsx'

/** Feuille « Auto-diagnostic » — résultats des vérifications rapides embarquées. */
export function SelftestModal({ sx, onClose, results = [] }) {
  const okCount = results.filter((r) => r.pass).length
  return (
    <ModalShell onClose={onClose} z={200}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Auto-diagnostic</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;')}>Vérifications rapides exécutées directement sur ce téléphone (pas la suite de tests complète du build — voir le skill « release »).</div>
        <div data-testid="selftest-summary" style={sx(`font-family:Quicksand;font-weight:700;font-size:15px;margin-bottom:10px;color:${results.every((r) => r.pass) ? '#4a5d3a' : '#b8503f'};`)}>
          {okCount} / {results.length} vérifications OK
        </div>
        <div data-testid="selftest-results">
          {results.map((r, i) => (
            <div key={i} style={sx(`display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #ece2cf;font-size:13px;color:${r.pass ? '#4a5d3a' : '#b8503f'};`)}>
              <span>{r.pass ? '✅' : '❌'}</span>
              <div>
                <div style={sx('font-weight:600;')}>{r.name}</div>
                {!r.pass && <div style={sx('font-size:12px;color:#6b6354;')}>{r.detail}</div>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={sx('width:100%;margin-top:14px;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Fermer</button>
      </div>
    </ModalShell>
  )
}
