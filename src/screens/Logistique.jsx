/** Sous-écran Logistique — listes de valises/préparatifs personnalisables. */
export function Logistique({
  sx, logi, logiSorted, setLogiSorted, checks, buildList, toggleCheck,
  deleteLogiList, deleteLogiItem, setEditingLogiKey, setShowAddLogiItem, setShowAddLogiList,
}) {
  return (
    <div style={sx('padding:16px 18px 40px;')}>
      <div style={sx('display:flex;justify-content:flex-end;margin-bottom:12px;')}>
        <button onClick={() => setLogiSorted(!logiSorted)} style={sx(`border:1px solid ${logiSorted ? '#4a5d3a' : '#ece2cf'};background:${logiSorted ? '#4a5d3a' : '#fffdf8'};color:${logiSorted ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:6px 12px;font-weight:700;font-size:12px;cursor:pointer;`)}>↑ Non cochés en premier</button>
      </div>
      {logi.map((L) => {
        const b = buildList(checks, L.key, L.items)
        const displayItems = logiSorted ? [...b.items].sort((a, b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0)) : b.items
        return (
          <div key={L.key} style={sx('margin-bottom:18px;')}>
            <div style={sx('display:flex;align-items:center;gap:10px;margin-bottom:8px;')}>
              <span style={sx('font-size:19px;')}>{L.emoji}</span>
              <span style={sx('font-family:Quicksand;font-weight:700;font-size:15px;flex:1;')}>{L.name}</span>
              <span style={sx('font-size:12px;color:#6b6354;font-weight:700;')}>{b.done}/{b.total}</span>
              <button onClick={() => deleteLogiList(L.key)} style={sx('border:none;background:transparent;cursor:pointer;font-size:13px;padding:2px 4px;color:#b8503f;')}>🗑️</button>
            </div>
            <div style={sx('height:7px;border-radius:8px;background:#efe6d4;overflow:hidden;margin-bottom:8px;')}><div style={sx(`height:100%;background:#cf7d3c;width:${b.pct}%;`)} /></div>
            <div style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;overflow:hidden;')}>
              {displayItems.map((it) => (
                <div key={it.label} style={sx('display:flex;align-items:center;width:100%;border-bottom:1px solid #f1e9da;')}>
                  <button onClick={() => toggleCheck(L.key, it.label)} style={sx('flex:1;text-align:left;border:none;background:transparent;display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;')}>
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
                  <button onClick={() => deleteLogiItem(L.key, it.label)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 8px;color:#b8503f;flex:0 0 auto;')}>🗑️</button>
                </div>
              ))}
            </div>
            <button onClick={() => { setEditingLogiKey(L.key); setShowAddLogiItem(true) }} style={sx('width:100%;margin-top:8px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:8px;cursor:pointer;')}>+ Ajouter article</button>
          </div>
        )
      })}
      <button data-testid="btn-add-logi-list" onClick={() => setShowAddLogiList(true)} style={sx('width:100%;margin-top:4px;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px;cursor:pointer;')}>+ Nouvelle liste</button>
    </div>
  )
}
