import { Ridge } from '../Scenery.jsx'

/** Sous-écran Trajet — étapes aller/retour + checklist avant départ. */
export function Trajet({
  sx, trajetDir, setTrajetDir, trip, fmtDayShort, trajets,
  editTrajetStep, deleteTrajetStep,
  setEditingTrajetIdx, setNewTrajetTime, setNewTrajetPlace, setNewTrajetNote, setNewTrajetColor, setShowTrajetEdit,
  tr, setShowAddTrajetCheck, toggleCheck, deleteTrajetCheckItem,
}) {
  return (
    <div style={sx('padding:16px 18px 40px;')}>
      <div style={sx('background:#4a5d3a;border-radius:20px;padding:18px;color:#f3ecda;box-shadow:0 8px 20px rgba(74,93,58,0.2);position:relative;overflow:hidden;')}>
        <Ridge />
        <div style={sx('position:relative;')}>
          <div style={sx('display:flex;align-items:center;gap:10px;font-family:Quicksand;font-weight:700;font-size:19px;flex-wrap:wrap;')}>
            <span>{trajetDir === 'aller' ? trip.origin : trip.destination}</span>
            <span style={sx('color:#c9d2b6;')}>→</span>
            <span>{trajetDir === 'aller' ? trip.destination : trip.origin}</span>
          </div>
          <div style={sx('display:flex;gap:20px;margin-top:14px;flex-wrap:wrap;')}>
            <div><div style={sx('font-size:12px;color:#c9d2b6;')}>{trajetDir === 'aller' ? 'Départ' : 'Retour'}</div><div style={sx('font-family:Quicksand;font-weight:700;font-size:16px;')}>{fmtDayShort(trajetDir === 'aller' ? trip.start : trip.end)}</div></div>
            {trip.etape && <div><div style={sx('font-size:12px;color:#c9d2b6;')}>Étape (nuit)</div><div style={sx('font-family:Quicksand;font-weight:700;font-size:16px;')}>{trip.etape}</div></div>}
          </div>
        </div>
      </div>
      <div style={sx('margin-top:14px;display:flex;background:#ece2cf;border-radius:14px;padding:4px;')}>
        <button data-testid="btn-trajet-aller" onClick={() => setTrajetDir('aller')} style={sx(`flex:1;border:none;border-radius:10px;padding:9px;font-weight:700;font-family:Quicksand;font-size:15px;cursor:pointer;background:${trajetDir === 'aller' ? '#4a5d3a' : 'transparent'};color:${trajetDir === 'aller' ? '#fffaf0' : '#6b6354'};`)}>Aller</button>
        <button data-testid="btn-trajet-retour" onClick={() => setTrajetDir('retour')} style={sx(`flex:1;border:none;border-radius:10px;padding:9px;font-weight:700;font-family:Quicksand;font-size:15px;cursor:pointer;background:${trajetDir === 'retour' ? '#4a5d3a' : 'transparent'};color:${trajetDir === 'retour' ? '#fffaf0' : '#6b6354'};`)}>Retour</button>
      </div>
      <div style={sx('margin-top:14px;background:#f1e4d4;border-radius:16px;padding:14px;font-size:13px;line-height:1.5;color:#6b5a45;')}>👶 Avec les enfants : une pause toutes les 1 h 30, et la playlist d’histoires audio prête pour la route.</div>
      <div style={sx('margin:20px 0 12px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>Les etapes · {trajetDir}</div>
      {trajets[trajetDir].map((st, i) => (
        <div key={i} style={sx('display:flex;gap:12px;')}>
          <div style={sx('width:48px;flex:0 0 auto;font-size:13px;font-weight:700;color:#9a917f;padding-top:1px;')}>{st.time}</div>
          <div style={sx('display:flex;flex-direction:column;align-items:center;flex:0 0 auto;')}>
            <div style={sx(`width:13px;height:13px;border-radius:50%;background:${st.color};margin-top:3px;border:2px solid #f4ecdc;box-shadow:0 0 0 1px ${st.color};`)} />
            <div style={sx('flex:1;width:2px;background:#e3d8c2;margin:3px 0;')} />
          </div>
          <div style={sx('flex:1;padding-bottom:18px;')}>
            <div style={sx('display:flex;align-items:center;gap:8px;')}>
              <div style={sx('flex:1;')}>
                <div style={sx('font-weight:700;font-size:15px;')}>{st.place}</div>
                <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>{st.note}</div>
              </div>
              <button onClick={() => editTrajetStep(i)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;flex:0 0 auto;')}>✏️</button>
              <button onClick={() => deleteTrajetStep(i)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;flex:0 0 auto;color:#b8503f;')}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => { setEditingTrajetIdx(null); setNewTrajetTime(''); setNewTrajetPlace(''); setNewTrajetNote(''); setNewTrajetColor('#5b7042'); setShowTrajetEdit(true) }} style={sx('width:100%;margin:4px 0 16px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:8px;cursor:pointer;')}>+ Ajouter une étape</button>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>Avant de partir · {tr.done}/{tr.total}</div>
        <button onClick={() => setShowAddTrajetCheck(true)} style={sx('border:none;background:transparent;cursor:pointer;font-size:18px;padding:2px 4px;color:#9c6b4a;')}>＋</button>
      </div>
      <div style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;overflow:hidden;')}>
        {tr.items.map((it) => (
          <div key={it.label} style={sx('display:flex;align-items:center;border-bottom:1px solid #f1e9da;')}>
            <button onClick={() => toggleCheck('tr_dep', it.label)} style={sx('flex:1;text-align:left;border:none;background:transparent;display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;')}>
              {it.checked ? (
                <>
                  <span style={sx('width:24px;height:24px;flex:0 0 auto;border-radius:8px;background:#5b7042;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;')}>✓</span>
                  <span style={sx('font-size:14px;color:#6b6354;text-decoration:line-through;')}>{it.label}</span>
                </>
              ) : (
                <>
                  <span style={sx('width:24px;height:24px;flex:0 0 auto;border-radius:8px;border:2px solid #d8cbb0;background:#fff;')} />
                  <span style={sx('font-size:14px;color:#2f2a22;')}>{it.label}</span>
                </>
              )}
            </button>
            <button onClick={() => deleteTrajetCheckItem(it.label)} style={sx('border:none;background:transparent;cursor:pointer;font-size:13px;padding:4px 10px;color:#b8503f;flex:0 0 auto;')}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  )
}
