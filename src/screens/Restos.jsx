import { TelLink, MapLink } from '../components/Links.jsx'

/** Sous-écran Restos — carnet d'adresses + réservations, liens cliquables. */
export function Restos({ sx, restos, openAddResto, openEditResto, deleteResto }) {
  return (
    <div data-testid="screen-restos" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('background:#cf7d3c;border-radius:20px;padding:18px;color:#fff8ef;box-shadow:0 8px 20px rgba(207,125,60,0.22);')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>🍴 Nos restos</div>
        <div style={sx('font-size:13px;color:#f6e6d4;margin-top:4px;')}>Bonnes adresses & réservations. Touchez le 📞 pour appeler, le 📍 pour ouvrir Google Maps.</div>
      </div>

      {restos.length === 0 && (
        <div style={sx('margin-top:22px;text-align:center;color:#9a917f;font-size:14px;')}>Aucune adresse pour l'instant.</div>
      )}

      {restos.map((r) => (
        <div key={r.id} data-testid={`resto-${r.id}`} style={sx('margin-top:12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          <div style={sx('display:flex;align-items:flex-start;gap:8px;')}>
            <div style={sx('flex:1;')}>
              <div style={sx('font-family:Quicksand;font-weight:700;font-size:16px;')}>{r.name}</div>
              {r.place && <div style={sx('margin-top:3px;')}><MapLink sx={sx} place={r.place} style={'color:#4f8a86;font-weight:600;text-decoration:none;font-size:13px;'}>📍 {r.place}</MapLink></div>}
              {r.tel && <div style={sx('margin-top:4px;')}><TelLink sx={sx} num={r.tel} style={'color:#9c6b4a;font-weight:700;text-decoration:none;font-size:14px;'}>📞 {r.tel}</TelLink></div>}
            </div>
            <div style={sx('display:flex;gap:2px;flex:0 0 auto;')}>
              <button data-testid={`resto-edit-${r.id}`} onClick={() => openEditResto(r.id)} style={sx('border:none;background:transparent;cursor:pointer;font-size:15px;padding:4px;')}>✏️</button>
              <button data-testid={`resto-del-${r.id}`} onClick={() => deleteResto(r.id)} style={sx('border:none;background:transparent;cursor:pointer;font-size:15px;padding:4px;color:#b8503f;')}>🗑️</button>
            </div>
          </div>
          <div style={sx('display:flex;align-items:center;gap:8px;margin-top:10px;')}>
            <span data-testid={`resto-status-${r.id}`} style={sx(`font-size:12px;font-weight:700;border-radius:999px;padding:4px 10px;${r.reserved ? 'background:#e7ecdf;color:#4a5d3a;' : 'background:#f7e2dc;color:#b8503f;'}`)}>{r.reserved ? '✓ Réservé' : 'À réserver'}</span>
            {r.resa && <span style={sx('font-size:12px;color:#6b6354;')}>{r.resa}</span>}
          </div>
        </div>
      ))}

      <button data-testid="btn-add-resto" onClick={openAddResto} style={sx('width:100%;margin-top:14px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px;cursor:pointer;')}>+ Ajouter une adresse</button>
    </div>
  )
}
