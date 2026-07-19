/** Carte « Aujourd'hui » de l'Accueil (jour courant : météo, planning, repas). */
export function TodayCard({ sx, today, setTab, setDay }) {
  return (
    <div data-testid="today-card" style={sx('margin:0 18px 14px;background:#fffdf8;border:2px solid #cf7d3c;border-radius:20px;padding:16px;box-shadow:0 4px 14px rgba(207,125,60,0.18);')}>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;')}>
        <div style={sx('font-size:12px;letter-spacing:1px;font-weight:700;color:#cf7d3c;')}>🗓️ AUJOURD'HUI · {today.d.dow} {today.d.num}</div>
        {today.w && <div style={sx('font-family:Quicksand;font-weight:700;font-size:14px;')}>{today.w.icon} {today.w.hi}° <span style={sx('color:#6b6354;')}>{today.w.lo}°</span></div>}
      </div>
      <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-top:6px;')}>{today.d.title}</div>
      <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>{today.d.sub}</div>
      {today.d.items.length > 0 && (
        <div style={sx('margin-top:12px;display:flex;flex-direction:column;gap:8px;')}>
          {today.d.items.map((it, i) => (
            <div key={i} style={sx('display:flex;align-items:center;gap:10px;')}>
              <span style={sx(`width:8px;height:8px;border-radius:50%;background:${it.color};flex:0 0 auto;`)} />
              <span style={sx('font-size:13px;font-weight:700;color:#9a917f;width:44px;flex:0 0 auto;')}>{it.time}</span>
              <span style={sx('font-size:14px;flex:1;')}>{it.title}</span>
            </div>
          ))}
        </div>
      )}
      {today.meal && (
        <div style={sx('margin-top:12px;background:#f1e4d4;border-radius:12px;padding:10px 12px;font-size:13px;color:#6b5a45;')}>🍽️ Ce soir : <b>{today.meal.dish}</b></div>
      )}
      <button onClick={() => { setTab('planning'); setDay(today.dayIdx) }} style={sx('margin-top:12px;width:100%;border:none;background:#cf7d3c;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Voir le planning du jour →</button>
    </div>
  )
}
