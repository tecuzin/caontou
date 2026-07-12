import { CHANGELOG } from '../changelog.js'

/**
 * Modale « Historique des versions » — liste tous les builds et leurs
 * nouveautés (feuille depuis le bas), déclenchée par un bouton.
 */
export function ChangelogModal({ isOpen, onClose, sx, currentBuild }) {
  if (!isOpen) return null
  return (
    <div onClick={onClose} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:210;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
      <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:84vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:21px;margin-bottom:2px;')}>🗂️ Historique des versions</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-bottom:16px;')}>Tout ce qui a été ajouté à l'app, build après build.{currentBuild ? ` Version actuelle : build ${currentBuild}.` : ''}</div>
        {CHANGELOG.map((e) => (
          <div key={e.build} data-testid={`changelog-${e.build}`} style={sx('margin-bottom:14px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
            <div style={sx('display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px;')}>
              <span style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>Build {e.build}{e.build === currentBuild ? ' · actuel' : ''}</span>
              <span style={sx('font-size:12px;color:#9a917f;')}>{e.date}</span>
            </div>
            {e.items.map((it, i) => (
              <div key={i} style={sx('font-size:14px;padding:3px 0;color:#3a352b;')}>{it}</div>
            ))}
          </div>
        ))}
        <button data-testid="btn-changelog-close" onClick={onClose} style={sx('width:100%;margin-top:4px;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Fermer</button>
      </div>
    </div>
  )
}
