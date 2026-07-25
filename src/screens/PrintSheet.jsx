import { mealsForDay } from '../day-schedule.js'

/** Sous-écran « Pense-bête imprimable » du jour : planning + repas + visites
 *  cochées, en une page sobre noir/blanc. Filet de sécurité si le téléphone
 *  lâche. Zéro dépendance : CSS `@media print` (voir index.html) + window.print.
 *  La classe `print-sheet` est la seule visible à l'impression. */
export function PrintSheet({ sx, cur, meals = [], visits = [], saved = {}, trip = {} }) {
  const dayMeals = mealsForDay(cur, meals)
  const plannedVisits = visits.filter((v) => saved[v.id])
  const print = () => { try { window.print() } catch { } }

  return (
    <div data-testid="screen-print" style={sx('padding:16px 18px 40px;')}>
      <button data-testid="btn-do-print" onClick={print} className="print-hide" style={sx('width:100%;margin-bottom:16px;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:14px;cursor:pointer;')}>🖨️ Imprimer / enregistrer en PDF</button>
      <div className="print-hide" style={sx('font-size:12px;color:#9a917f;margin-bottom:16px;text-align:center;')}>Un pense-bête d’une page, lisible même sans téléphone.</div>

      <div className="print-sheet" style={sx('background:#ffffff;border:1px solid #e3d8c2;border-radius:14px;padding:20px;color:#000;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>Pense-bête — {cur?.dow} {cur?.num}</div>
        <div style={sx('font-size:13px;color:#2f2a22;margin-bottom:2px;')}>{cur?.title}{cur?.sub ? ` · ${cur.sub}` : ''}</div>
        <div style={sx('font-size:12px;color:#6b6354;border-bottom:1px solid #000;padding-bottom:8px;margin-bottom:12px;')}>Séjour {trip?.dest || 'Cantal'}</div>

        <div style={sx('font-weight:700;font-size:14px;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;')}>Programme</div>
        {cur?.items?.length ? cur.items.map((it, i) => (
          <div key={i} style={sx('display:flex;gap:10px;font-size:14px;padding:3px 0;')}>
            <span style={sx('width:44px;flex:0 0 auto;font-weight:700;')}>{it.time}</span>
            <span>{it.title}{it.note ? ` — ${it.note}` : ''}</span>
          </div>
        )) : <div style={sx('font-size:13px;color:#6b6354;')}>—</div>}

        <div style={sx('font-weight:700;font-size:14px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:0.5px;')}>Repas</div>
        <div style={sx('font-size:14px;')}>{dayMeals.length ? dayMeals.map((m) => m.dish).join(' · ') : '—'}</div>

        <div style={sx('font-weight:700;font-size:14px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:0.5px;')}>Visites cochées ♥</div>
        {plannedVisits.length ? plannedVisits.map((v) => (
          <div key={v.id} style={sx('font-size:14px;padding:2px 0;')}>• {v.name} <span style={sx('color:#6b6354;')}>({v.dist})</span></div>
        )) : <div style={sx('font-size:13px;color:#6b6354;')}>—</div>}
      </div>
    </div>
  )
}
