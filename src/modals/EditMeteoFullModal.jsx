import { s } from '../utils.js'
import { ModalShell } from './ModalShell.jsx'

export function EditMeteoFullModal({ isOpen, onClose, editingMeteoIdx, newMeteoDay, setNewMeteoDay, newMeteoNum, setNewMeteoNum, newMeteoIcon, setNewMeteoIcon, newMeteoHi, setNewMeteoHi, newMeteoLo, setNewMeteoLo, newMeteoRain, setNewMeteoRain, darkMode, onSubmit }) {
  if (!isOpen) return null
  const sx = css => s(css)
  return (
    <ModalShell onClose={onClose} z={200} fade={true}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={sx('background:#f6efe2;border-radius:28px 28px 0 0;padding:18px 18px 30px;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>{editingMeteoIdx === null ? 'Ajouter un jour' : 'Meteo'}</div>
        <div style={sx('display:flex;gap:10px;')}>
          <div style={sx('flex:1;')}>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Jour</div>
            <input value={newMeteoDay} onChange={e => setNewMeteoDay(e.target.value)} placeholder="Sam" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
          </div>
          <div style={sx('flex:1;')}>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Numero</div>
            <input value={newMeteoNum} onChange={e => setNewMeteoNum(e.target.value)} placeholder="11" inputMode="numeric" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
          </div>
        </div>
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Icone</div>
        <input value={newMeteoIcon} onChange={e => setNewMeteoIcon(e.target.value)} placeholder="☀️" maxLength="2" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:24px;text-align:center;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Temp max</div>
        <input value={newMeteoHi} onChange={e => setNewMeteoHi(e.target.value)} placeholder="24" inputMode="numeric" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Temp min</div>
        <input value={newMeteoLo} onChange={e => setNewMeteoLo(e.target.value)} placeholder="12" inputMode="numeric" style={sx('width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>Pluie</div>
        <input value={newMeteoRain} onChange={e => setNewMeteoRain(e.target.value)} placeholder="10 %" style={sx('width:100%;margin-top:6px;margin-bottom:20px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <div style={sx('display:flex;gap:10px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
          <button onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
        </div>
      </div>
    </ModalShell>
  )
}
