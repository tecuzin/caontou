import { useState } from 'react'
import { hasCoords, makeProjector } from '../geo.js'
import { formatParkedAt } from '../carspot.js'
import { visitedIdSet, visitProgress } from '../visits-progress.js'

const VB_W = 340
const VB_H = 430

/**
 * Carte schématique du séjour, 100 % hors-ligne (SVG). Place le gîte, les
 * visites qui ont des coordonnées et — si mémorisée — la voiture, projetés à
 * leurs positions relatives réelles. Un tap sur un marqueur affiche son détail.
 * La carte topographique détaillée (OpenTopoMap, en ligne) est un écran séparé.
 */
export function Carte({ sx, visits = [], gite, carSpot, savedIds = [], findCar, openDetailed, ratings = {} }) {
  const [selected, setSelected] = useState(null) // { kind, id, name, meta }
  const [filter, setFilter] = useState('all')     // all | todo | done

  const allPlaced = visits.filter(hasCoords)
  const visited = visitedIdSet(allPlaced, ratings)
  const progress = visitProgress(allPlaced, ratings)
  const placedVisits = allPlaced.filter((v) => filter === 'all' || (filter === 'done') === visited.has(v.id))
  const saved = new Set(savedIds)
  const points = [
    ...(hasCoords(gite) ? [gite] : []),
    ...placedVisits,
    ...(hasCoords(carSpot) ? [carSpot] : []),
  ]
  const { project } = makeProjector(points, { width: VB_W, height: VB_H, pad: 40 })

  const giteXY = hasCoords(gite) ? project(gite) : null
  const carXY = hasCoords(carSpot) ? project(carSpot) : null

  return (
    <div data-testid="screen-carte" style={sx('padding:0 18px 24px;')}>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 10px;')}>
        <div style={sx('font-size:13px;color:#6b6354;')}>
          Le séjour d'un coup d'œil, sans réseau.
        </div>
        <div data-testid="visit-progress" style={sx('flex:0 0 auto;font-family:Quicksand;font-weight:700;font-size:13px;color:#4a5d3a;background:#e7ecdf;border-radius:12px;padding:4px 10px;')}>✓ {progress.done}/{progress.total} visités</div>
      </div>

      <div data-testid="carte-filter" style={sx('display:flex;gap:8px;margin-bottom:12px;')}>
        {[['all', 'Tout'], ['todo', 'À faire'], ['done', 'Faites']].map(([key, label]) => (
          <button key={key} data-testid={`carte-filter-${key}`} onClick={() => setFilter(key)} style={sx(`flex:1;border:1px solid ${filter === key ? '#4a5d3a' : '#efe6d4'};background:${filter === key ? '#e7ecdf' : '#fffdf8'};color:${filter === key ? '#4a5d3a' : '#6b6354'};font-weight:${filter === key ? '700' : '600'};font-family:Quicksand;font-size:13px;border-radius:12px;padding:8px;cursor:pointer;`)}>{label}</button>
        ))}
      </div>

      {openDetailed && (typeof navigator === 'undefined' || navigator.onLine) && (
        <button data-testid="btn-carte-detaillee" onClick={openDetailed} style={sx('width:100%;margin-bottom:12px;border:1px solid #4f8a86;background:#fffdf8;color:#4f8a86;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:11px;cursor:pointer;')}>🌍 Carte détaillée (OpenTopoMap)</button>
      )}

      <div style={sx('background:#e7ecdf;border:1px solid #dbe2c9;border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(74,93,58,0.06);')}>
        <svg data-testid="map-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" role="img" aria-label="Carte schématique du séjour" style={{ display: 'block' }}>
          {/* Reliefs stylisés en fond (décor, non géographique). Une seule teinte
              verte du palette (#dbe2c9) à opacités variées pour l'effet de profondeur. */}
          <rect x="0" y="0" width={VB_W} height={VB_H} fill="#e7ecdf" />
          <path d={`M0 ${VB_H} L70 ${VB_H - 90} L140 ${VB_H} Z`} fill="#dbe2c9" opacity="0.55" />
          <path d={`M120 ${VB_H} L210 ${VB_H - 130} L300 ${VB_H} Z`} fill="#dbe2c9" opacity="0.85" />
          <path d={`M240 ${VB_H} L320 ${VB_H - 80} L${VB_W} ${VB_H} Z`} fill="#dbe2c9" opacity="0.55" />

          {/* Traits fins gîte → visites (relation de proximité) */}
          {giteXY && placedVisits.map((v) => {
            const p = project(v)
            return <line key={`l-${v.id}`} x1={giteXY.x} y1={giteXY.y} x2={p.x} y2={p.y} stroke="#4f8a86" strokeWidth="1" strokeDasharray="2 3" opacity="0.3" />
          })}

          {/* Marqueurs visites */}
          {placedVisits.map((v) => {
            const p = project(v)
            const isSel = selected?.kind === 'visit' && selected.id === v.id
            const isSaved = saved.has(v.id)
            const isDone = visited.has(v.id)
            return (
              <g key={v.id} data-testid={`map-visit-${v.id}`} data-visited={isDone ? '1' : '0'} onClick={() => setSelected({ kind: 'visit', id: v.id, name: v.name, meta: `${isDone ? '✓ Visité · ' : ''}${v.dist} · ${v.dur}` })} style={{ cursor: 'pointer' }}>
                <circle cx={p.x} cy={p.y} r={isSel ? 15 : 12} fill={isDone ? '#dbe2c9' : '#fffdf8'} stroke={isSaved ? '#cf7d3c' : '#4f8a86'} strokeWidth={isSel ? 3 : 2} />
                <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="13">{v.emoji}</text>
                {isDone && (
                  <g>
                    <circle cx={p.x + 9} cy={p.y - 9} r="6" fill="#4a5d3a" stroke="#fffaf0" strokeWidth="1.5" />
                    <text x={p.x + 9} y={p.y - 9} textAnchor="middle" dominantBaseline="central" fontSize="7" fill="#fffaf0" fontWeight="700">✓</text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Marqueur voiture */}
          {carXY && (
            <g data-testid="map-car" onClick={() => setSelected({ kind: 'car', name: 'Voiture', meta: carSpot.at ? formatParkedAt(carSpot.at) : 'Position mémorisée' })} style={{ cursor: 'pointer' }}>
              <circle cx={carXY.x} cy={carXY.y} r="13" fill="#2f2a22" stroke="#fffaf0" strokeWidth="2" />
              <text x={carXY.x} y={carXY.y} textAnchor="middle" dominantBaseline="central" fontSize="13">🚗</text>
            </g>
          )}

          {/* Marqueur gîte (au-dessus) */}
          {giteXY && (
            <g data-testid="map-gite" onClick={() => setSelected({ kind: 'gite', name: gite.name || 'Notre gîte', meta: 'Vezels-Roussy (Carladès)' })} style={{ cursor: 'pointer' }}>
              <circle cx={giteXY.x} cy={giteXY.y} r="17" fill="#4a5d3a" stroke="#fffaf0" strokeWidth="3" />
              <text x={giteXY.x} y={giteXY.y} textAnchor="middle" dominantBaseline="central" fontSize="16">🏠</text>
            </g>
          )}
        </svg>
      </div>

      {/* Légende */}
      <div style={sx('display:flex;gap:14px;flex-wrap:wrap;margin-top:12px;font-size:12px;color:#6b6354;')}>
        <span>🏠 Gîte</span>
        <span style={sx('display:flex;align-items:center;gap:4px;')}><span style={sx('width:10px;height:10px;border-radius:50%;border:2px solid #cf7d3c;display:inline-block;')} /> Favori</span>
        <span style={sx('display:flex;align-items:center;gap:4px;')}><span style={sx('width:10px;height:10px;border-radius:50%;border:2px solid #4f8a86;display:inline-block;')} /> À faire</span>
        {carXY && <span>🚗 Voiture</span>}
      </div>

      {/* Détail du marqueur sélectionné */}
      {selected && (
        <div data-testid="map-selected" style={sx('margin-top:14px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px 16px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{selected.name}</div>
          <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>{selected.meta}</div>
          {selected.kind === 'car' && findCar && (
            <button data-testid="map-find-car" onClick={findCar} style={sx('margin-top:10px;border:none;background:#4f8a86;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:12px;padding:9px 14px;cursor:pointer;')}>🧭 M'y guider</button>
          )}
        </div>
      )}
    </div>
  )
}
