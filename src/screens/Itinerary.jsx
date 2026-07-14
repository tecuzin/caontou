import { useState } from 'react'
import { routePlan, fmtMinutes, mapsDirectionsUrl } from '../itinerary.js'

/**
 * Écran « Itinéraire du jour » — on coche les sorties d'une journée, l'app les
 * ordonne par proximité depuis le gîte et propose d'ouvrir l'itinéraire réel
 * dans Google Maps. Sélection éphémère (aide au planning), pré-remplie avec les
 * favoris ♥.
 */
export function Itinerary({ sx, visits = [], saved = {}, openMaps }) {
  const [selected, setSelected] = useState(() => new Set(visits.filter((v) => saved[v.id]).map((v) => v.id)))
  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const chosen = visits.filter((v) => selected.has(v.id))
  const { ordered, stops, roundTripMin } = routePlan(chosen)

  return (
    <div data-testid="screen-itinerary">
      <div style={sx('padding:54px 18px 6px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:26px;')}>Itinéraire du jour</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>Coche tes sorties : on les ordonne par proximité depuis le gîte.</div>
      </div>

      {stops > 0 && (
        <div data-testid="route-summary" style={sx('margin:8px 18px 14px;background:#4a5d3a;border-radius:20px;padding:16px;color:#f3ecda;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:16px;')}>{stops} arrêt{stops > 1 ? 's' : ''} · ~{fmtMinutes(roundTripMin)} de route</div>
          <div style={sx('font-size:12px;color:#dbe2c9;margin-top:2px;')}>Estimation aller-retour depuis Vezels-Roussy (indicative).</div>
          <ol style={sx('margin:12px 0 0;padding-left:20px;')}>
            {ordered.map((v) => (
              <li key={v.id} data-testid="route-stop" style={sx('font-size:14px;padding:3px 0;')}>
                <b>{v.name}</b> <span style={sx('color:#dbe2c9;')}>· {v.dist}</span>
              </li>
            ))}
          </ol>
          {openMaps && (
            <button data-testid="btn-open-maps" onClick={() => openMaps(mapsDirectionsUrl(chosen))} style={sx('width:100%;margin-top:14px;border:none;background:#e8c07a;color:#2f2a22;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>🗺️ Ouvrir dans Google Maps</button>
          )}
        </div>
      )}

      <div style={sx('padding:0 18px 6px;')}><div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>Choisir les sorties</div></div>
      <div style={sx('padding:0 18px 24px;display:flex;flex-direction:column;gap:8px;')}>
        {visits.map((v) => {
          const on = selected.has(v.id)
          return (
            <button
              key={v.id} data-testid={`pick-visit-${v.id}`} onClick={() => toggle(v.id)}
              style={sx(`display:flex;align-items:center;gap:12px;text-align:left;background:#fffdf8;border:1px solid ${on ? '#4a5d3a' : '#efe6d4'};border-radius:14px;padding:12px 14px;cursor:pointer;`)}
            >
              <span style={sx(`width:22px;height:22px;flex:0 0 auto;border-radius:8px;border:2px solid ${on ? '#4a5d3a' : '#d8cbb0'};background:${on ? '#4a5d3a' : '#fffdf8'};color:#fffaf0;font-size:13px;display:flex;align-items:center;justify-content:center;`)}>{on ? '✓' : ''}</span>
              <span style={sx('font-size:20px;flex:0 0 auto;')}>{v.emoji}</span>
              <span style={sx('flex:1;min-width:0;font-weight:600;font-size:14px;')}>{v.name}</span>
              <span style={sx('font-size:12px;color:#6b6354;flex:0 0 auto;')}>{v.dist}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
