/** Écran Planning — jours du séjour + activités du jour sélectionné. */
export function Planning({
  sx, days, trip, fmtDayShort, day, setDay, setShowDayAdd,
  cur, editDay, editActivity, deleteActivity, startAddActivity,
  openJournal, shareActivity,
}) {
  return (
    <div data-testid="screen-planning">
      <div style={sx('padding:54px 18px 4px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:26px;')}>Planning</div>
        <div style={sx('font-size:13px;color:#6b6354;')}>{days.length} jours · {fmtDayShort(trip.start)} → {fmtDayShort(trip.end)}</div>
      </div>
      <div style={sx('display:flex;gap:8px;overflow-x:auto;padding:12px 18px 16px;')}>
        {days.map((d, i) => (
          <button key={i} onClick={() => setDay(i)} style={sx(`flex:0 0 auto;width:54px;border:1px solid ${i === day ? '#4a5d3a' : '#ece2cf'};background:${i === day ? '#4a5d3a' : '#fffdf8'};color:${i === day ? '#fffaf0' : '#6b6354'};border-radius:16px;padding:10px 0;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;`)}>
            <span style={sx('font-size:12px;font-weight:600;')}>{d.dow}</span>
            <span style={sx('font-family:Quicksand;font-weight:700;font-size:18px;')}>{d.num}</span>
          </button>
        ))}
        <button data-testid="btn-add-day" onClick={() => setShowDayAdd(true)} style={sx('flex:0 0 auto;width:54px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;border-radius:16px;padding:10px 0;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:20px;font-weight:700;')}>＋</button>
      </div>
      <div style={sx('padding:0 18px 8px;')}>
        <div style={sx('display:flex;align-items:center;justify-content:space-between;')}>
          <div>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:20px;')}>{cur.title}</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-bottom:16px;')}>{cur.sub}</div>
          </div>
          <div style={sx('display:flex;gap:4px;flex:0 0 auto;')}>
            <button data-testid="btn-journal" onClick={() => openJournal(day)} style={sx('border:none;background:transparent;cursor:pointer;font-size:16px;padding:4px;')}>📔</button>
            <button onClick={() => editDay(day)} style={sx('border:none;background:transparent;cursor:pointer;font-size:16px;padding:4px;')}>✏️</button>
          </div>
        </div>
        {cur.items.map((it, i) => (
          <div key={i} style={sx('display:flex;gap:12px;')}>
            <div style={sx('width:48px;flex:0 0 auto;font-size:13px;font-weight:700;color:#9a917f;padding-top:1px;')}>{it.time}</div>
            <div style={sx('display:flex;flex-direction:column;align-items:center;flex:0 0 auto;')}>
              <div style={sx(`width:13px;height:13px;border-radius:50%;background:${it.color};margin-top:3px;border:2px solid #f4ecdc;box-shadow:0 0 0 1px ${it.color};`)} />
              <div style={sx('flex:1;width:2px;background:#e3d8c2;margin:3px 0;')} />
            </div>
            <div style={sx('flex:1;padding-bottom:18px;')}>
              <div style={sx('display:flex;align-items:center;gap:8px;')}>
                <div style={sx('flex:1;')}>
                  <div style={sx('font-weight:700;font-size:15px;')}>{it.title}</div>
                  {it.note && <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>{it.note}</div>}
                </div>
                <button data-testid={`btn-share-activity-${i}`} onClick={() => shareActivity(day, i)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;flex:0 0 auto;')}>📅</button>
                <button onClick={() => editActivity(day, i)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;flex:0 0 auto;')}>✏️</button>
                <button onClick={() => deleteActivity(day, i)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;flex:0 0 auto;color:#b8503f;')}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => startAddActivity(day)} style={sx('margin-top:12px;width:100%;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:12px;padding:10px;cursor:pointer;')}>+ Ajouter activite</button>
      </div>
      <div style={sx('height:16px;')} />
    </div>
  )
}
