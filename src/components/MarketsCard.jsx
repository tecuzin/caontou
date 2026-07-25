import { MARKETS, MARKETS_DISCLAIMER } from '../markets.js'
import { DriveLink } from './Links.jsx'

/** Fiche « Marchés du Carladès » — où/quand trouver des produits locaux
 *  (contenu statique hors-ligne). Rendu en tête de l'onglet Courses. */
export function MarketsCard({ sx }) {
  return (
    <div data-testid="markets-card" style={sx('margin-bottom:16px;background:#f1e4d4;border-radius:16px;padding:14px;')}>
      <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;color:#6b5a45;margin-bottom:10px;')}>🧺 Marchés du Carladès</div>
      <div style={sx('display:flex;flex-direction:column;gap:10px;')}>
        {MARKETS.map((m) => (
          <div key={m.town} data-testid={`market-${m.town}`} style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:12px;padding:10px 12px;')}>
            <div style={sx('display:flex;align-items:center;gap:8px;flex-wrap:wrap;')}>
              <span style={sx('font-weight:700;font-size:14px;flex:1;min-width:0;')}>{m.town}</span>
              <span style={sx('font-size:12px;color:#6b6354;')}>{m.dist}</span>
              <DriveLink sx={sx} place={m} style={'display:inline-flex;align-items:center;gap:5px;background:#e8c07a;color:#2f2a22;font-weight:700;font-family:Quicksand;text-decoration:none;border-radius:8px;padding:4px 9px;font-size:12px;'} />
            </div>
            <div style={sx('font-size:13px;color:#6b5a45;margin-top:4px;')}>🗓️ {m.days} · {m.hours}</div>
            <div style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>{m.note}</div>
          </div>
        ))}
      </div>
      <div style={sx('font-size:12px;color:#9a917f;margin-top:10px;')}>ℹ️ {MARKETS_DISCLAIMER}</div>
    </div>
  )
}
