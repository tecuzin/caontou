import { GITE_COORDS } from '../../data.js'
import { sunTimes, moonPhase } from '../../astro.js'

const fmt = (d) => (d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—')

/**
 * Carte « Ciel du jour » : lever/coucher du soleil et phase de lune calculés
 * 100 % hors-ligne depuis les coordonnées du gîte. Utile pour caler une rando,
 * l'heure dorée ou une soirée d'observation (ciel très sombre du Carladès).
 */
export function SkyCard({ sx, date = new Date() }) {
  const { sunrise, sunset } = sunTimes(date, GITE_COORDS.lat, GITE_COORDS.lng)
  const moon = moonPhase(date)
  const cell = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;'
  return (
    <>
      <div style={sx('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>🌙 Ciel du jour</div>
      <div style={sx('padding:0 18px 12px;')}>
        <div data-testid="sky-card" style={sx('display:flex;align-items:center;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          <div style={sx(cell)}>
            <div style={sx('font-size:22px;')}>🌅</div>
            <div style={sx('font-size:12px;color:#6b6354;')}>Lever</div>
            <div data-testid="sky-sunrise" style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{fmt(sunrise)}</div>
          </div>
          <div style={sx(cell)}>
            <div style={sx('font-size:22px;')}>🌇</div>
            <div style={sx('font-size:12px;color:#6b6354;')}>Coucher</div>
            <div data-testid="sky-sunset" style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{fmt(sunset)}</div>
          </div>
          <div style={sx(cell)}>
            <div style={sx('font-size:22px;')}>{moon.emoji}</div>
            <div style={sx('font-size:12px;color:#6b6354;')}>Lune</div>
            <div data-testid="sky-moon" style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{Math.round(moon.illumination * 100)}%</div>
          </div>
        </div>
        <div style={sx('font-size:12px;color:#6b6354;margin-top:6px;text-align:center;')}>{moon.name} · éclairée à {Math.round(moon.illumination * 100)} %</div>
      </div>
    </>
  )
}
