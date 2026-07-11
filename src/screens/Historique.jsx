import { CHANGELOG } from '../changelog.js'

/** Sous-écran Historique des versions — journal complet des mises à jour. */
export function Historique({ sx, currentBuild }) {
  return (
    <div data-testid="screen-historique" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('background:#4a5d3a;border-radius:20px;padding:18px;color:#f3ecda;box-shadow:0 8px 20px rgba(74,93,58,0.2);')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>🗂️ Historique des versions</div>
        <div style={sx('font-size:13px;color:#dce6c9;margin-top:4px;')}>Tout ce qui a été ajouté à l'app, build après build.{currentBuild ? ` Version actuelle : build ${currentBuild}.` : ''}</div>
      </div>
      <div style={sx('margin-top:16px;')}>
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
      </div>
    </div>
  )
}
