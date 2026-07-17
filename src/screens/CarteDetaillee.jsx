import { useEffect, useState } from 'react'
import { hasCoords } from '../geo.js'
import { buildTileMap, chooseZoom, tileUrl } from '../osm.js'
import { formatParkedAt } from '../carspot.js'
import { Carte } from './Carte.jsx'

const VB_W = 340
const VB_H = 430

/** True si le réseau est disponible (repli hors-ligne sinon). */
function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])
  return online
}

/**
 * Carte détaillée topographique OpenTopoMap (tuiles en ligne, sans dépendance
 * ni clé API — voir src/osm.js). Repli automatique sur la carte simplifiée
 * hors-ligne si pas de réseau. Marqueurs : 🏠 gîte, emoji visite, 🚗 voiture.
 */
export function CarteDetaillee(props) {
  const { sx, visits = [], gite, carSpot, savedIds = [] } = props
  const online = useOnline()
  const [selected, setSelected] = useState(null)
  const [zoom, setZoom] = useState(null) // null = auto-fit

  const placedVisits = visits.filter(hasCoords)
  const saved = new Set(savedIds)
  const points = [
    ...(hasCoords(gite) ? [gite] : []),
    ...placedVisits,
    ...(hasCoords(carSpot) ? [carSpot] : []),
  ]

  // Hors-ligne : on rend la carte simplifiée (déjà 100 % offline) + un bandeau.
  if (!online) {
    return (
      <div data-testid="screen-carte-detaillee">
        <div data-testid="carte-offline-banner" style={sx('margin:0 18px 12px;background:#fbf4e6;border:1px solid #eee7d4;border-radius:14px;padding:10px 14px;font-size:13px;color:#9c6b4a;')}>
          Hors-ligne — carte simplifiée. La carte topographique détaillée reviendra avec le réseau.
        </div>
        <Carte {...props} />
      </div>
    )
  }

  const autoZoom = points.length ? chooseZoom(
    points.reduce((b, p) => ({
      minLat: Math.min(b.minLat, p.lat), maxLat: Math.max(b.maxLat, p.lat),
      minLng: Math.min(b.minLng, p.lng), maxLng: Math.max(b.maxLng, p.lng),
    }), { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }),
    VB_W, VB_H,
  ) : 12
  const z = zoom ?? autoZoom
  const map = buildTileMap(points, { width: VB_W, height: VB_H, zoom: z })

  const giteXY = map && hasCoords(gite) ? map.project(gite) : null
  const carXY = map && hasCoords(carSpot) ? map.project(carSpot) : null

  return (
    <div data-testid="screen-carte-detaillee" style={sx('padding:0 18px 24px;')}>
      <div style={sx('font-size:13px;color:#6b6354;margin:2px 0 12px;')}>
        Carte topographique OpenTopoMap — reliefs, sentiers et cols du Cantal.
      </div>

      <div style={sx('position:relative;border:1px solid #dbe2c9;border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(74,93,58,0.06);background:#e7ecdf;')}>
        <div style={{ position: 'relative', width: `${VB_W}px`, height: `${VB_H}px`, maxWidth: '100%' }}>
          {/* Tuiles OpenTopoMap */}
          {map && map.tiles.map((t) => (
            <img
              key={`${t.z}-${t.x}-${t.y}`}
              src={tileUrl(t.x, t.y, t.z)}
              alt=""
              loading="lazy"
              draggable={false}
              style={{ position: 'absolute', left: `${t.left}px`, top: `${t.top}px`, width: `${256}px`, height: `${256}px`, userSelect: 'none' }}
            />
          ))}

          {/* Marqueurs (superposés) */}
          {map && placedVisits.map((v) => {
            const p = map.project(v)
            const isSel = selected?.kind === 'visit' && selected.id === v.id
            return (
              <button
                key={v.id}
                data-testid={`detmap-visit-${v.id}`}
                onClick={() => setSelected({ kind: 'visit', id: v.id, name: v.name, meta: `${v.dist} · ${v.dur}` })}
                style={{ position: 'absolute', left: `${p.x}px`, top: `${p.y}px`, transform: 'translate(-50%,-50%)', width: isSel ? '30px' : '26px', height: isSel ? '30px' : '26px', borderRadius: '50%', background: '#fffdf8', border: `${isSel ? 3 : 2}px solid ${saved.has(v.id) ? '#cf7d3c' : '#4f8a86'}`, cursor: 'pointer', fontSize: '13px', lineHeight: '1', padding: 0 }}
              >{v.emoji}</button>
            )
          })}
          {carXY && (
            <button data-testid="detmap-car" onClick={() => setSelected({ kind: 'car', name: 'Voiture', meta: carSpot.at ? formatParkedAt(carSpot.at) : 'Position mémorisée' })}
              style={{ position: 'absolute', left: `${carXY.x}px`, top: `${carXY.y}px`, transform: 'translate(-50%,-50%)', width: '28px', height: '28px', borderRadius: '50%', background: '#2f2a22', border: '2px solid #fffaf0', cursor: 'pointer', fontSize: '13px', padding: 0 }}>🚗</button>
          )}
          {giteXY && (
            <button data-testid="detmap-gite" onClick={() => setSelected({ kind: 'gite', name: gite.name || 'Notre gîte', meta: 'Vezels-Roussy (Carladès)' })}
              style={{ position: 'absolute', left: `${giteXY.x}px`, top: `${giteXY.y}px`, transform: 'translate(-50%,-50%)', width: '34px', height: '34px', borderRadius: '50%', background: '#4a5d3a', border: '3px solid #fffaf0', cursor: 'pointer', fontSize: '16px', padding: 0 }}>🏠</button>
          )}

          {/* Zoom */}
          <div style={{ position: 'absolute', right: '10px', top: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button data-testid="detmap-zoom-in" aria-label="Zoomer" onClick={() => setZoom(Math.min((z) + 1, 15))} style={sx('width:34px;height:34px;border:none;border-radius:10px;background:rgba(255,253,248,0.95);font-size:20px;font-weight:700;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.15);color:#4a5d3a;')}>+</button>
            <button data-testid="detmap-zoom-out" aria-label="Dézoomer" onClick={() => setZoom(Math.max((z) - 1, 3))} style={sx('width:34px;height:34px;border:none;border-radius:10px;background:rgba(255,253,248,0.95);font-size:20px;font-weight:700;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.15);color:#4a5d3a;')}>−</button>
          </div>

          {/* Attribution obligatoire */}
          <div style={{ position: 'absolute', left: 0, bottom: 0, background: 'rgba(255,253,248,0.85)', fontSize: '9px', color: '#6b6354', padding: '2px 6px', borderTopRightRadius: '8px' }}>{map?.attribution}</div>
        </div>
      </div>

      {selected && (
        <div data-testid="detmap-selected" style={sx('margin-top:14px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px 16px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:16px;')}>{selected.name}</div>
          <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>{selected.meta}</div>
        </div>
      )}
    </div>
  )
}
