import { offlineChecks, networkDependentFeatures } from '../offline-check.js'

/**
 * Écran « Prêt hors-ligne ? » : rassure avant d'arriver dans une zone sans
 * réseau (fréquent en Carladès). Vérifie que tout le nécessaire est en local
 * et signale ce qui, au contraire, exige une connexion. 100 % local.
 */
export function OfflineCheck({ sx, storeData }) {
  const { ready, checks } = offlineChecks(storeData ? storeData() : {})
  const net = networkDependentFeatures()

  return (
    <div data-testid="screen-offline-check" style={sx('padding:0 18px 24px;')}>
      <div data-testid="offline-ready-banner" style={sx(`margin:8px 0 14px;border-radius:18px;padding:16px;border:2px solid ${ready ? '#4a5d3a' : '#9c6b4a'};background:#fffdf8;box-shadow:0 4px 14px rgba(74,93,58,0.12);`)}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>{ready ? '✅ Prêt pour le hors-ligne' : '⚠️ Presque prêt'}</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-top:4px;')}>
          {ready
            ? 'Tout le nécessaire est enregistré sur l\'appareil. L\'app fonctionne sans réseau.'
            : 'Certaines données sont absentes — ouvre les écrans concernés pour les charger.'}
        </div>
      </div>

      <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin:2px 2px 8px;')}>Vérifications</div>
      <div style={sx('display:flex;flex-direction:column;gap:8px;')}>
        {checks.map((c) => (
          <div key={c.key} data-testid={`offline-check-${c.key}`} style={sx('display:flex;gap:10px;align-items:flex-start;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px;box-shadow:0 2px 8px rgba(74,93,58,0.04);')}>
            <span style={sx('font-size:15px;flex:0 0 auto;')}>{c.ok ? '✅' : '⚠️'}</span>
            <div style={sx('flex:1;min-width:0;')}>
              <div style={sx('font-size:14px;font-weight:700;font-family:Quicksand;')}>{c.label}</div>
              <div style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>{c.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin:18px 2px 8px;')}>Nécessite du réseau</div>
      <div style={sx('display:flex;flex-direction:column;gap:8px;')}>
        {net.map((f) => (
          <div key={f.key} data-testid={`offline-net-${f.key}`} style={sx('display:flex;gap:10px;align-items:flex-start;background:#fbf4e6;border:1px solid #efe6d4;border-radius:14px;padding:12px;')}>
            <span style={sx('font-size:15px;flex:0 0 auto;')}>📶</span>
            <div style={sx('flex:1;min-width:0;')}>
              <div style={sx('font-size:14px;font-weight:700;font-family:Quicksand;color:#9c6b4a;')}>{f.label}</div>
              <div style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>{f.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
