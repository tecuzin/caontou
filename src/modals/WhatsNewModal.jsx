/**
 * « Quoi de neuf ? » — feuille affichée au premier lancement d'un nouveau
 * build, listant les nouveautés livrées depuis la dernière version vue.
 */
export function WhatsNewModal({ isOpen, onClose, sx, entries }) {
  if (!isOpen || !entries.length) return null
  return (
    <div onClick={onClose} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:210;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
      <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:82vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:21px;margin-bottom:2px;')}>🆕 Quoi de neuf ?</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-bottom:16px;')}>Les nouveautés de l'app des vacances depuis ta dernière ouverture.</div>
        {entries.map((e) => (
          <div key={e.build} style={sx('margin-bottom:14px;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;color:#9c6b4a;margin-bottom:6px;')}>Version {e.version} · build {e.build}</div>
            {e.items.map((it, i) => (
              <div key={i} style={sx('display:flex;gap:8px;font-size:14px;padding:3px 0;')}><span>{it}</span></div>
            ))}
          </div>
        ))}
        <button data-testid="btn-whatsnew-ok" onClick={onClose} style={sx('width:100%;margin-top:8px;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:14px;cursor:pointer;')}>Super, merci !</button>
      </div>
    </div>
  )
}
