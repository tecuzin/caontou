import { eur } from '../utils.js'

/** Une tuile de statistique du bilan. */
function Tile({ sx, emoji, value, label, bg }) {
  return (
    <div style={sx(`background:${bg};border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:2px;`)}>
      <div style={sx('font-size:19px;')}>{emoji}</div>
      <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>{value}</div>
      <div style={sx('font-size:12px;color:#6b6354;font-weight:600;')}>{label}</div>
    </div>
  )
}

/** Sous-écran Bilan — synthèse du séjour + partage. */
export function Bilan({ sx, recap, onShare }) {
  return (
    <div data-testid="screen-bilan" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('background:#9c6b4a;border-radius:20px;padding:18px;color:#fffaf0;box-shadow:0 8px 20px rgba(156,107,74,0.2);')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>📊 Bilan du séjour</div>
        <div style={sx('font-size:13px;color:#ecd9c4;margin-top:4px;')}>Un petit récap de nos vacances dans le Cantal, à garder ou à envoyer aux proches.</div>
      </div>

      <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;')}>
        <Tile sx={sx} emoji="📅" value={recap.daysCount} label={`jour${recap.daysCount > 1 ? 's' : ''} sur place`} bg="#eee7d4" />
        <Tile sx={sx} emoji="❤️" value={recap.savedVisits} label="visites coup de cœur" bg="#f3e2d6" />
        <Tile sx={sx} emoji="💶" value={`${recap.spentPct} %`} label={`${eur(recap.spent)} / ${eur(recap.budgetTotal)}`} bg="#e6ece0" />
        <Tile sx={sx} emoji="🍽️" value={recap.mealsPlanned} label="repas planifiés" bg="#f1e4d4" />
        <Tile sx={sx} emoji="🧳" value={`${recap.packPct} %`} label="préparatifs cochés" bg="#e7ecdf" />
        <Tile sx={sx} emoji="🛒" value={`${recap.coursesPct} %`} label="courses cochées" bg="#dfeae6" />
      </div>

      {recap.topCategories?.length > 0 && (
        <div style={sx('margin-top:16px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin-bottom:10px;')}>Où est passé le budget</div>
          {recap.topCategories.slice(0, 3).map((c) => (
            <div key={c.name} style={sx('display:flex;justify-content:space-between;font-size:14px;padding:6px 0;')}>
              <span style={sx('color:#6b5a45;')}>{c.name}</span>
              <span style={sx('font-weight:700;')}>{eur(c.amt)}</span>
            </div>
          ))}
        </div>
      )}

      {recap.topRated?.length > 0 && (
        <div data-testid="recap-coups-de-coeur" style={sx('margin-top:16px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin-bottom:10px;')}>⭐ Nos coups de cœur</div>
          {recap.topRated.map((r) => (
            <div key={r.name} style={sx('display:flex;align-items:center;gap:8px;font-size:14px;padding:6px 0;')}>
              <span style={sx('font-size:15px;')}>{r.emoji}</span>
              <span style={sx('flex:1;min-width:0;color:#6b5a45;')}>{r.name}{r.note ? <span style={sx('color:#9a917f;')}> — « {r.note} »</span> : null}</span>
              <span style={sx('font-weight:700;color:#cf7d3c;flex:0 0 auto;')}>{'★'.repeat(r.stars)}</span>
            </div>
          ))}
        </div>
      )}

      {recap.toAvoid?.length > 0 && (
        <div data-testid="recap-a-eviter" style={sx('margin-top:12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin-bottom:10px;')}>À revoir la prochaine fois</div>
          {recap.toAvoid.map((r) => (
            <div key={r.name} style={sx('display:flex;align-items:center;gap:8px;font-size:14px;padding:6px 0;')}>
              <span style={sx('font-size:15px;')}>{r.emoji}</span>
              <span style={sx('flex:1;min-width:0;color:#6b5a45;')}>{r.name}</span>
              <span style={sx('font-weight:700;color:#9a917f;flex:0 0 auto;')}>{'★'.repeat(r.stars)}</span>
            </div>
          ))}
        </div>
      )}

      {recap.photosCount > 0 && (
        <div style={sx('margin-top:12px;text-align:center;font-size:13px;color:#6b6354;')}>📸 {recap.photosCount} photo{recap.photosCount > 1 ? 's' : ''} souvenir cette fois-ci</div>
      )}

      <button data-testid="btn-share-recap" onClick={onShare} style={sx('width:100%;margin-top:18px;border:none;background:#cf7d3c;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:14px;cursor:pointer;')}>📤 Partager le bilan</button>
    </div>
  )
}
