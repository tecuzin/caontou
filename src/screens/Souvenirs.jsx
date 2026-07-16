import { useState, useEffect } from 'react'
import { groupPhotosByDay } from '../photos.js'
import { hasJournalEntry, journalSnippet } from '../journal.js'

/** Vignette : charge son URL affichable à l'affichage (async Filesystem). */
function PhotoThumb({ sx, meta, src, loadSrc, onOpen }) {
  useEffect(() => { if (!src) loadSrc(meta) }, [src, meta, loadSrc])
  return (
    <button onClick={() => onOpen(meta)} style={sx('border:none;padding:0;background:#ece2cf;border-radius:14px;overflow:hidden;aspect-ratio:1;cursor:pointer;box-shadow:0 2px 8px rgba(74,93,58,0.10);')}>
      {src
        ? <img src={src} alt="" style={sx('width:100%;height:100%;object-fit:cover;display:block;')} />
        : <span style={sx('display:flex;align-items:center;justify-content:center;height:100%;font-size:22px;')}>🖼️</span>}
    </button>
  )
}

/** Sous-écran Souvenirs — galerie photo du séjour regroupée par journée. */
export function Souvenirs({ sx, photos, days, srcMap, capturePhoto, deletePhoto, loadSrc, shareDay, journal = {}, openDayJournal }) {
  const [viewer, setViewer] = useState(null) // meta de la photo ouverte en plein écran
  const groups = groupPhotosByDay(photos, days)
  const journalDays = days
    .map((d, i) => ({ d, i, entry: journal[`${d.dow} ${d.num}`] }))
    .filter((x) => hasJournalEntry(x.entry))
  return (
    <div data-testid="screen-souvenirs" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('background:#9c6b4a;border-radius:20px;padding:18px;color:#fffaf0;box-shadow:0 8px 20px rgba(156,107,74,0.2);')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>📸 Souvenirs du séjour</div>
        <div style={sx('font-size:13px;color:#ecd9c4;margin-top:4px;')}>{photos.length ? `${photos.length} photo${photos.length > 1 ? 's' : ''}, rangée${photos.length > 1 ? 's' : ''} par journée` : 'Les photos prises ici se rangent toutes seules par journée.'}</div>
      </div>

      <div style={sx('display:flex;gap:10px;margin-top:14px;')}>
        <button data-testid="btn-take-photo" onClick={() => capturePhoto('camera')} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>📷 Prendre une photo</button>
        <button data-testid="btn-import-photo" onClick={() => capturePhoto('photos')} style={sx('flex:1;border:1px solid #4a5d3a;background:#fffdf8;color:#4a5d3a;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>🖼️ Importer</button>
      </div>

      {openDayJournal && journalDays.length > 0 && (
        <div data-testid="souvenirs-journal" style={sx('margin-top:20px;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin-bottom:10px;')}>📔 Journal de bord</div>
          <div style={sx('display:flex;flex-direction:column;gap:8px;')}>
            {journalDays.map(({ d, i, entry }) => (
              <button
                key={i} data-testid={`journal-link-${i}`} onClick={() => openDayJournal(i)}
                style={sx('display:flex;align-items:center;gap:12px;text-align:left;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px 14px;cursor:pointer;')}
              >
                <span style={sx('font-size:22px;flex:0 0 auto;')}>{entry.mood || '📔'}</span>
                <span style={sx('flex:1;min-width:0;')}>
                  <span style={sx('display:block;font-family:Quicksand;font-weight:700;font-size:14px;')}>{d.dow} {d.num} — {d.title}</span>
                  {journalSnippet(entry) && <span style={sx('display:block;font-size:12px;color:#6b6354;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;')}>{journalSnippet(entry)}</span>}
                </span>
                <span style={sx('flex:0 0 auto;color:#9c6b4a;font-size:16px;')}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {groups.length === 0 && (
        <div style={sx('margin-top:22px;text-align:center;color:#9a917f;font-size:14px;line-height:1.6;')}>
          <div style={sx('font-size:40px;')}>🏔️</div>
          Aucune photo pour l'instant.<br />Le premier souvenir n'attend que vous !
        </div>
      )}

      {groups.map((g) => (
        <div key={g.key}>
          <div style={sx('display:flex;align-items:center;justify-content:space-between;margin:20px 0 10px;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>{g.label} · {g.photos.length}</div>
            <button data-testid={`btn-share-day-${g.key}`} onClick={() => shareDay(g.photos, g.label)} style={sx('border:none;background:transparent;cursor:pointer;font-size:15px;padding:2px 4px;color:#9c6b4a;')}>📤</button>
          </div>
          <div style={sx('display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;')}>
            {g.photos.map((meta) => (
              <PhotoThumb key={meta.id} sx={sx} meta={meta} src={srcMap[meta.id]} loadSrc={loadSrc} onOpen={setViewer} />
            ))}
          </div>
        </div>
      ))}

      {/* Visionneuse plein écran */}
      {viewer && (
        <div data-testid="photo-viewer" onClick={() => setViewer(null)} style={sx('position:fixed;inset:0;z-index:300;background:rgba(20,16,10,0.92);display:flex;flex-direction:column;animation:fadeIn 0.2s ease;')}>
          <div style={sx('flex:1;display:flex;align-items:center;justify-content:center;padding:20px;min-height:0;')}>
            {srcMap[viewer.id] && <img src={srcMap[viewer.id]} alt="" style={sx('max-width:100%;max-height:100%;border-radius:12px;object-fit:contain;')} />}
          </div>
          <div onClick={(e) => e.stopPropagation()} style={sx('flex:0 0 auto;display:flex;gap:10px;padding:14px 18px 34px;')}>
            <button onClick={() => setViewer(null)} style={sx('flex:1;border:1px solid rgba(255,255,255,0.4);background:transparent;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Fermer</button>
            <button data-testid="btn-delete-photo" onClick={() => { deletePhoto(viewer.id); setViewer(null) }} style={sx('flex:1;border:none;background:#b8503f;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>🗑️ Supprimer</button>
          </div>
        </div>
      )}
    </div>
  )
}
