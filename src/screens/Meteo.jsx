import { Ridge } from '../Scenery.jsx'

/** Sous-écran Météo — prévisions du séjour, éditables. */
export function Meteo({ sx, meteo, trip, fmtDayShort, editMeteo, deleteMeteo, openAddMeteo }) {
  return (
    <div style={sx('padding:16px 18px 40px;')}>
      <div style={sx('background:#4a5d3a;border-radius:16px;padding:16px;color:#f3ecda;position:relative;overflow:hidden;')}>
        <Ridge opacity={0.14} />
        <div style={sx('position:relative;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:18px;')}>Carladès &amp; Cantal</div>
          <div style={sx('font-size:13px;color:#dbe2c9;margin-top:2px;')}>Prévisions du {fmtDayShort(trip.start)} au {fmtDayShort(trip.end)}</div>
        </div>
      </div>
      <div style={sx('margin-top:12px;background:#eee7d4;border-radius:14px;padding:12px;font-size:13px;line-height:1.5;color:#6b5a45;')}>🧥 En altitude (Plomb du Cantal, 1 855 m) il fait plus frais — prévoir une polaire même en été !</div>
      <div style={sx('margin-top:14px;display:flex;flex-direction:column;gap:8px;')}>
        {meteo.map((w, i) => (
          <div key={i} style={sx('display:flex;align-items:center;gap:6px;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:6px 8px 6px 16px;')}>
            <button onClick={() => editMeteo(i)} style={sx('flex:1;display:flex;align-items:center;gap:14px;border:none;background:transparent;cursor:pointer;text-align:left;padding:6px 0;')}>
              <div style={sx('width:64px;font-weight:700;font-size:14px;')}>{w.d} {w.n}</div>
              <div style={sx('font-size:24px;width:32px;text-align:center;')}>{w.icon}</div>
              <div style={sx('font-size:12px;color:#6f8fb0;flex:1;font-weight:600;')}>💧 {w.rain}</div>
              <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{w.hi}° <span style={sx('color:#6b6354;')}>{w.lo}°</span></div>
            </button>
            <button onClick={() => deleteMeteo(i)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 8px;color:#b8503f;flex:0 0 auto;')}>🗑️</button>
          </div>
        ))}
      </div>
      <button onClick={openAddMeteo} style={sx('width:100%;margin-top:10px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:14px;padding:10px;cursor:pointer;')}>+ Ajouter un jour</button>
    </div>
  )
}
