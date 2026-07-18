import { useState } from 'react'

/** Écran « Départ du gîte » — checklist pour ne rien oublier avant de rendre les clés. */
export function Departure({ sx, departure, toggleDeparture, addDepartureItem, removeDepartureItem }) {
  const [newItem, setNewItem] = useState('')
  const done = departure.filter((i) => i.done).length
  const pct = departure.length ? Math.round((done / departure.length) * 100) : 0
  const submit = () => { const v = newItem.trim(); if (v) { addDepartureItem(v); setNewItem('') } }

  return (
    <div data-testid="screen-departure">
      <div style={sx('padding:54px 18px 6px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:26px;')}>Départ du gîte</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>Avant de rendre les clés, on coche tout.</div>
      </div>

      <div style={sx('margin:8px 18px 14px;background:#4a5d3a;border-radius:20px;padding:16px;color:#f3ecda;')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:baseline;')}>
          <span style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{done}/{departure.length} fait{done > 1 ? 's' : ''}</span>
          <span data-testid="departure-pct" style={sx('font-size:13px;color:#dbe2c9;')}>{pct} %</span>
        </div>
        <div style={sx('margin-top:12px;height:8px;border-radius:8px;background:rgba(255,255,255,0.18);overflow:hidden;')}><div style={sx(`height:100%;background:#e8c07a;width:${pct}%;`)} /></div>
      </div>

      <div style={sx('padding:0 18px;display:flex;flex-direction:column;gap:8px;')}>
        {departure.map((it) => (
          <div key={it.id} data-testid="departure-item" style={sx(`display:flex;align-items:center;gap:12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px 14px;${it.done ? 'opacity:0.6;' : ''}`)}>
            <button aria-label={`Cocher ${it.label}`} onClick={() => toggleDeparture(it.id)} style={sx(`width:24px;height:24px;flex:0 0 auto;border-radius:8px;border:2px solid ${it.done ? '#4a5d3a' : '#d8cbb0'};background:${it.done ? '#4a5d3a' : '#fffdf8'};color:#fffaf0;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;`)}>{it.done ? '✓' : ''}</button>
            <span style={sx('font-size:19px;flex:0 0 auto;')}>{it.emoji}</span>
            <span style={sx(`flex:1;min-width:0;font-size:14px;font-weight:600;${it.done ? 'text-decoration:line-through;color:#9a917f;' : ''}`)}>{it.label}</span>
            <button aria-label={`Supprimer ${it.label}`} onClick={() => removeDepartureItem(it.id)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;color:#b8503f;')}>🗑️</button>
          </div>
        ))}
      </div>

      <div style={sx('padding:14px 18px 24px;display:flex;gap:8px;')}>
        <input
          data-testid="departure-new" value={newItem} onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          placeholder="Ajouter un point à vérifier…"
          style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:14px;')}
        />
        <button data-testid="departure-add" onClick={submit} style={sx('border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:12px;padding:12px 18px;cursor:pointer;')}>+</button>
      </div>
    </div>
  )
}
