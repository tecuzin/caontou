import { FEATURE_GROUPS } from '../features.js'

/** Interrupteur on/off simple (style pilule), piloté par `on`. */
function Toggle({ sx, on, onClick, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      style={sx(`flex:0 0 auto;width:46px;height:28px;border-radius:16px;border:none;cursor:pointer;padding:3px;display:flex;justify-content:${on ? 'flex-end' : 'flex-start'};background:${on ? '#5b7042' : '#d8cbb0'};transition:background 0.15s;`)}
    >
      <span style={sx('width:22px;height:22px;border-radius:50%;background:#fffdf8;box-shadow:0 1px 3px rgba(0,0,0,0.2);display:block;')} />
    </button>
  )
}

/**
 * Écran Réglages — active ou masque chaque fonctionnalité de l'app. Les
 * fonctions coupées disparaissent des onglets, des tuiles et des cartes ;
 * les données restent intactes (rien n'est supprimé). Tout est exporté dans
 * le JSON de sauvegarde.
 */
export function Reglages({ sx, isOn, toggleFeature, relaunchOnboarding }) {
  return (
    <div data-testid="screen-reglages" style={sx('padding:0 18px 24px;')}>
      <div style={sx('font-size:13px;color:#6b6354;margin:2px 0 16px;')}>
        Masque ce que tu n'utilises pas. Rien n'est supprimé — tout revient en réactivant.
      </div>

      {FEATURE_GROUPS.map((g) => (
        <div key={g.group} style={sx('margin-bottom:18px;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin-bottom:8px;')}>{g.group}</div>
          <div style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;overflow:hidden;')}>
            {g.items.map((it, i) => (
              <div key={it.key} data-testid={`reglage-row-${it.key}`} style={sx(`display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 16px;${i > 0 ? 'border-top:1px solid #f1e9da;' : ''}`)}>
                <span style={sx('font-size:15px;')}>{it.label}</span>
                <Toggle sx={sx} on={isOn(it.key)} onClick={() => toggleFeature(it.key)} label={it.label} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {relaunchOnboarding && (
        <div style={sx('margin-top:6px;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin-bottom:8px;')}>Assistant</div>
          <button data-testid="btn-relaunch-onboarding" onClick={relaunchOnboarding} style={sx('width:100%;border:1px solid #cf7d3c;background:#fffdf8;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px;cursor:pointer;')}>🔁 Relancer l'assistant de configuration</button>
          <div style={sx('font-size:12px;color:#6b6354;margin-top:6px;')}>Rejoue les étapes de dates, trajet et budget (utile pour reconfigurer un séjour).</div>
        </div>
      )}
    </div>
  )
}
