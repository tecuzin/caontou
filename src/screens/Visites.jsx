const VCAT = { Nature: '#5b7042', Famille: '#cf7d3c', Patrimoine: '#9c6b4a', Baignade: '#4f8a86', Gourmand: '#b8503f', Marché: '#8a8b3d', Sport: '#4a6d9c' }
const FILTERS = ['Tous', 'Nature', 'Famille', 'Patrimoine', 'Baignade', 'Gourmand', 'Marché', 'Sport']

/** Écran Visites — liste des idées de sorties, filtrable et triable. */
export function Visites({
  sx, savedCount, filter, setFilter, visitSort, setVisitSort, filteredVisits, saved,
  setEditingVisitId, setNewVisitName, setNewVisitDist, setNewVisitDur, setNewVisitAge, setNewVisitCat, setShowVisitEdit,
  toggleSaved, editVisit, deleteVisit, openVote,
  ratings = {}, rateVisit, setVisitNote,
}) {
  return (
    <div data-testid="screen-visites">
      <div style={sx('padding:54px 18px 4px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;')}>
        <div>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:26px;')}>À faire</div>
          <div style={sx('font-size:13px;color:#6b6354;')}>Autour du Carladès · {savedCount} enregistrées ♥</div>
        </div>
        {openVote && <button data-testid="btn-open-vote" onClick={openVote} style={sx('flex:0 0 auto;margin-top:4px;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:9px 13px;cursor:pointer;')}>🗳️ Voter</button>}
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
          const stars = ratings[v.id]?.stars || 0
          const note = ratings[v.id]?.note || ''
          return (
            <div key={v.id} style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
              <div style={sx('display:flex;gap:12px;align-items:center;')}>
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
                  {sv ? <span style={sx('color:#b8503f;')}>♥</span> : <span style={sx('color:#cbc2ae;')}>♡</span>}
                </button>
                <button onClick={() => editVisit(v.id)} style={sx('flex:0 0 auto;border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;')}>✏️</button>
                <button onClick={() => deleteVisit(v.id)} style={sx('flex:0 0 auto;border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px;color:#b8503f;')}>🗑️</button>
              </div>
              {rateVisit && (
                <div data-testid={`visit-rating-${v.id}`} style={sx('display:flex;align-items:center;gap:4px;margin-top:10px;padding-top:10px;border-top:1px solid #f1e9da;')}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} aria-label={`Noter ${v.name} ${n} sur 5`} onClick={() => rateVisit(v.id, n === stars ? 0 : n)} style={sx(`border:none;background:transparent;cursor:pointer;font-size:19px;line-height:1;padding:0 1px;color:${n <= stars ? '#cf7d3c' : '#d8cbb0'};`)}>★</button>
                  ))}
                  <input data-testid={`visit-note-${v.id}`} value={note} onChange={(e) => setVisitNote(v.id, e.target.value)} placeholder="Un mot sur cette sortie…" style={sx('flex:1;min-width:0;margin-left:8px;border:none;background:transparent;font-size:13px;color:#6b6354;outline:none;')} />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={sx('height:16px;')} />
    </div>
  )
}
