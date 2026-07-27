import { sheetRows, isSourced } from '../place-sheets.js'
import { DriveLink } from '../components/Links.jsx'

/**
 * Sous-écran « fiche de visite » — infos pratiques d'une sortie, consultables
 * hors réseau. Les champs non renseignés ne s'affichent pas (voir
 * `place-sheets.js` : on préfère un trou à une invention).
 */
export function PlaceSheet({ sx, sheet }) {
  if (!sheet) {
    return (
      <div data-testid="screen-place-sheet" style={sx('padding:16px 18px 40px;text-align:center;color:#9a917f;font-size:14px;')}>
        Fiche introuvable.
      </div>
    )
  }

  const rows = sheetRows(sheet)

  return (
    <div data-testid="screen-place-sheet" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('background:#5b7042;border-radius:20px;padding:18px;color:#f3ecda;box-shadow:0 8px 20px rgba(91,112,66,0.22);')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>{sheet.emoji} {sheet.name}</div>
        {sheet.town && <div style={sx('font-size:13px;color:#dbe2c9;margin-top:4px;')}>📍 {sheet.town}</div>}
        {sheet.summary && <div style={sx('font-size:13px;color:#dbe2c9;margin-top:8px;line-height:1.4;')}>{sheet.summary}</div>}
        {(sheet.coords || sheet.town) && (
          <div style={sx('margin-top:12px;')}>
            <DriveLink sx={sx} place={sheet.coords || `${sheet.name}, Cantal`} label="Y aller" />
          </div>
        )}
      </div>

      <div style={sx('display:flex;flex-direction:column;gap:8px;margin-top:16px;')}>
        {rows.map(([icon, label, value]) => (
          <div key={label} data-testid={`sheet-row-${label}`} style={sx('display:flex;gap:12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px 14px;')}>
            <span style={sx('font-size:19px;flex:0 0 auto;')}>{icon}</span>
            <div style={sx('flex:1;min-width:0;')}>
              <div style={sx('font-size:12px;font-weight:700;color:#6b6354;text-transform:uppercase;letter-spacing:0.5px;')}>{label}</div>
              <div style={sx('font-size:14px;margin-top:2px;line-height:1.4;')}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {isSourced(sheet) && (
        <div data-testid="sheet-sources" style={sx('margin-top:16px;background:#f3ece0;border-radius:14px;padding:12px 14px;')}>
          <div style={sx('font-size:12px;font-weight:700;color:#6b6354;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;')}>📚 Sources</div>
          {sheet.sources.map((src) => (
            <div key={src} style={sx('font-size:12px;color:#6b6354;word-break:break-all;padding:2px 0;')}>{src}</div>
          ))}
          <div style={sx('font-size:12px;color:#9a917f;margin-top:6px;')}>Infos vérifiées à la rédaction — à reconfirmer sur place en saison.</div>
        </div>
      )}
    </div>
  )
}
