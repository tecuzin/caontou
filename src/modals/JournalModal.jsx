import { useEffect, useRef, useState } from 'react'
import { MOODS } from '../journal.js'
import { appendSegment, isSpeechSupported, startDictation } from '../speech.js'
import { ModalShell } from './ModalShell.jsx'

/**
 * Journal de bord d'une journée — humeur (emoji), moment préféré, phrase du
 * jour. Sauvegarde au fil de la saisie (updateEntry écrit dans le store).
 * Le récit du jour peut aussi être dicté à la voix (Web Speech API).
 */
export function JournalModal({ isOpen, onClose, sx, dayLabel, entry, updateEntry, onShare, canShare }) {
  const e = entry || {}
  const [recording, setRecording] = useState(false)
  const [micError, setMicError] = useState('')
  const ctrlRef = useRef(null)
  const textRef = useRef('')
  textRef.current = e.text || '' // toujours la dernière valeur (dictée ou frappe)

  const stopMic = () => { ctrlRef.current?.stop(); ctrlRef.current = null; setRecording(false) }
  // Arrête proprement la dictée si la feuille se ferme pendant l'enregistrement.
  useEffect(() => () => ctrlRef.current?.stop(), [])

  const toggleMic = () => {
    if (recording) { stopMic(); return }
    setMicError('')
    const ctrl = startDictation({
      onSegment: (seg) => {
        const next = appendSegment(textRef.current, seg)
        textRef.current = next
        updateEntry('text', next)
      },
      onEnd: () => { ctrlRef.current = null; setRecording(false) },
      onError: (code) => {
        setMicError(code === 'not-allowed' || code === 'service-not-allowed' ? 'Micro refusé' : 'Dictée indisponible')
        ctrlRef.current = null
        setRecording(false)
      },
    })
    if (ctrl) { ctrlRef.current = ctrl; setRecording(true) }
    else setMicError('Dictée indisponible')
  }

  if (!isOpen) return null
  const micSupported = isSpeechSupported()
  return (
    <ModalShell onClose={onClose} z={200} fade={true}>
      <div role="dialog" aria-modal="true" onClick={(ev) => ev.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:2px;')}>📔 Journal de bord</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;')}>{dayLabel}</div>

        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Humeur du jour</div>
        <div style={sx('display:flex;gap:8px;margin-top:6px;margin-bottom:14px;')}>
          {MOODS.map((m) => (
            <button key={m} data-testid={`mood-${m}`} onClick={() => updateEntry('mood', e.mood === m ? '' : m)} style={sx(`flex:1;font-size:26px;padding:8px 0;border-radius:12px;cursor:pointer;background:${e.mood === m ? '#e7ecdf' : '#fffdf8'};border:${e.mood === m ? '2px solid #4a5d3a' : '1px solid #d8cbb0'};`)}>{m}</button>
          ))}
        </div>

        <div style={sx('display:flex;align-items:center;justify-content:space-between;gap:10px;')}>
          <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>📔 Le récit du jour</div>
          {micSupported && (
            <button data-testid="btn-journal-mic" onClick={toggleMic} aria-pressed={recording} aria-label={recording ? 'Arrêter la dictée' : 'Dicter le récit'} style={sx(`border:none;border-radius:10px;padding:5px 10px;font-size:12px;font-weight:700;font-family:Quicksand;cursor:pointer;display:flex;align-items:center;gap:5px;background:${recording ? '#cf4a3c' : '#e7ecdf'};color:${recording ? '#fffaf0' : '#4a5d3a'};`)}>{recording ? '⏺ Enregistre…' : '🎙️ Dicter'}</button>
          )}
        </div>
        <textarea data-testid="journal-text" value={e.text || ''} onChange={(ev) => updateEntry('text', ev.target.value)} rows={4} placeholder="Ce qu'on a fait, vu, ri, mangé… quelques mots pour s'en souvenir." style={sx('width:100%;margin-top:6px;margin-bottom:4px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;font-family:inherit;resize:vertical;line-height:1.4;')} />
        {micError
          ? <div data-testid="journal-mic-error" style={sx('font-size:11px;color:#cf4a3c;margin-bottom:10px;')}>{micError}</div>
          : recording
            ? <div style={sx('font-size:11px;color:#6b6354;margin-bottom:10px;')}>Parle, ça s'écrit tout seul. Touche à nouveau pour arrêter.</div>
            : <div style={sx('margin-bottom:10px;')} />}

        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>⭐ Moment préféré</div>
        <input data-testid="journal-best" value={e.best || ''} onChange={(ev) => updateEntry('best', ev.target.value)} placeholder="Ex : la cascade du Pas de Cère" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />

        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>💬 Phrase du jour (des enfants…)</div>
        <input data-testid="journal-quote" value={e.quote || ''} onChange={(ev) => updateEntry('quote', ev.target.value)} placeholder="Ex : « encore la cascade ! »" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />

        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Fermer</button>
          <button data-testid="btn-share-journal" onClick={onShare} disabled={!canShare} style={sx(`flex:1;border:none;background:${canShare ? '#cf7d3c' : '#d8cbb0'};color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:${canShare ? 'pointer' : 'default'};`)}>📤 Partager le journal</button>
        </div>
      </div>
    </ModalShell>
  )
}
