const VCAT = { Nature: '#5b7042', Famille: '#cf7d3c', Patrimoine: '#9c6b4a', Baignade: '#4f8a86', Gourmand: '#b8503f', Marché: '#8a8b3d' }
const FILTERS = ['Tous', 'Nature', 'Famille', 'Patrimoine', 'Baignade', 'Gourmand', 'Marché']

/** Écran Visites — liste des idées de sorties, filtrable et triable. */
export function Visites({
  sx, savedCount, filter, setFilter, visitSort, setVisitSort, filteredVisits, saved,
  setEditingVisitId, setNewVisitName, setNewVisitDist, setNewVisitDur, setNewVisitAge, setNewVisitCat, setShowVisitEdit,
  toggleSaved, editVisit, deleteVisit,
}) {
  return (
    <div data-testid="screen-visites">
      <div style={sx('padding:54px 18px 4px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:26px;')}>À faire</div>
        <div style={sx('font-size:13px;color:#6b6354;')}>Autour du Puy Mary · {savedCount} enregistrées ♥</div>
      </div>
      <div style={sx('display:flex;gap:8px;overflow-x:auto;padding:12px 18px 14px;')}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={sx(`flex:0 0 auto;border:1px solid ${filter === f ? '#4a5d3a' : '#ece2cf'};background:${filter === f ? '#4a5d3a' : '#fffdf8'};color:${filter === f ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:8px 15px;font-weight:700;font-size:13px;cursor:pointer;`)}>{f}</button>
        ))}
      </div>
      <div style={sx('display:flex;gap:8px;padding:0 18px 14px;')}>
        {[['dist', '📍 Distance'], ['cat', '🏷️ Catégorie']].map(([k, label]) => (
          <button key={k} onClick={() => setVisitSort(visitSort === k ? null : k)} style={sx(`flex:0 0 auto;border:1px solid ${visitSort === k ? '#4a5d3a' : '#ece2cf'};background:${visitSort === k ? '#4a5d3a' : '#fffdf8'};color:${visitSort === k ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:6px 13px;font-weight:700;font-size:12px;cursor:pointer;`)}>{label}</button>
        ))}
      </div>
      <div style={sx('padding:0 18px 8px;display:flex;justify-content:flex-end;')}>
        <button onClick={() => { setEditingVisitId(null); setNewVisitName(''); setNewVisitDist(''); setNewVisitDur(''); setNewVisitAge(''); setNewVisitCat('Nature'); setShowVisitEdit(true) }} style={sx('border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:7px 14px;cursor:pointer;')}>+ Ajouter visite</button>
      </div>
      <div style={sx('padding:0 18px;display:flex;flex-direction:column;gap:12px;')}>
        {filteredVisits.map((v) => {
          const sv = !!saved[v.id]
          return (
            <div key={v.id} style={sx('display:flex;gap:12px;align-items:center;background:#fffdf8;border:1px solid #efe6d4;border-radius:18px;padding:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
              <div style={sx('width:52px;height:52px;flex:0 0 auto;border-radius:14px;background:#f3ece0;display:flex;align-items:center;justify-content:center;font-size:26px;')}>{v.emoji}</div>
              <div style={sx('flex:1;min-width:0;')}>
                <div style={sx('display:flex;align-items:center;gap:6px;')}>
                  <span style={sx(`width:8px;height:8px;border-radius:50%;background:${VCAT[v.cat]};flex:0 0 auto;`)} />
                  <span style={sx(`font-size:11px;font-weight:700;color:${VCAT[v.cat]};text-transform:uppercase;letter-spacing:0.5px;`)}>{v.cat}</span>
                </div>
                <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;margin-top:2px;')}>{v.name}</div>
                <div style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>{v.dist}  ·  {v.dur}</div>
                <div style={sx('display:inline-block;margin-top:7px;font-size:11px;font-weight:700;color:#6b6354;background:#f1e9da;border-radius:8px;padding:3px 8px;')}>👶 {v.age}</div>
              </div>
              <button onClick={() => toggleSaved(v.id)} style={sx('flex:0 0 auto;width:40px;height:40px;border:none;background:transparent;cursor:pointer;font-size:24px;line-height:1;')}>
                {sv ? <span style={sx('color:#b8503f;')}>♥</span> : <span style={sx('color:#cabfa6;')}>♡</span>}
              </button>
              <button onClick={() => editVisit(v.id)} style={sx('flex:0 0 auto;border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;')}>✏️</button>
              <button onClick={() => deleteVisit(v.id)} style={sx('flex:0 0 auto;border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;color:#b8503f;')}>🗑️</button>
            </div>
          )
        })}
      </div>
      <div style={sx('height:16px;')} />
    </div>
  )
}
