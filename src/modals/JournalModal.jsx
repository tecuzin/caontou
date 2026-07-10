import { MOODS } from '../journal.js'

/**
 * Journal de bord d'une journée — humeur (emoji), moment préféré, phrase du
 * jour. Sauvegarde au fil de la saisie (updateEntry écrit dans le store).
 */
export function JournalModal({ isOpen, onClose, sx, dayLabel, entry, updateEntry, onShare, canShare }) {
  if (!isOpen) return null
  const e = entry || {}
  return (
    <div onClick={onClose} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
      <div onClick={(ev) => ev.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:2px;')}>📔 Journal de bord</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;')}>{dayLabel}</div>

        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Humeur du jour</div>
        <div style={sx('display:flex;gap:8px;margin-top:6px;margin-bottom:14px;')}>
          {MOODS.map((m) => (
            <button key={m} data-testid={`mood-${m}`} onClick={() => updateEntry('mood', e.mood === m ? '' : m)} style={sx(`flex:1;font-size:24px;padding:8px 0;border-radius:12px;cursor:pointer;background:${e.mood === m ? '#e7ecdf' : '#fffdf8'};border:${e.mood === m ? '2px solid #4a5d3a' : '1px solid #d8cbb0'};`)}>{m}</button>
          ))}
        </div>

        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>⭐ Moment préféré</div>
        <input data-testid="journal-best" value={e.best || ''} onChange={(ev) => updateEntry('best', ev.target.value)} placeholder="Ex : la cascade du Pas de Cère" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />

        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>💬 Phrase du jour (des enfants…)</div>
        <input data-testid="journal-quote" value={e.quote || ''} onChange={(ev) => updateEntry('quote', ev.target.value)} placeholder="Ex : « encore la cascade ! »" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />

        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Fermer</button>
          <button data-testid="btn-share-journal" onClick={onShare} disabled={!canShare} style={sx(`flex:1;border:none;background:${canShare ? '#cf7d3c' : '#d8cbb0'};color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:${canShare ? 'pointer' : 'default'};`)}>📤 Partager le journal</button>
        </div>
      </div>
    </div>
  )
}
