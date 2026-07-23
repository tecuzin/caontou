import { s } from '../utils.js'
import { composeHebMoment } from '../heb-datetime.js'
import { ModalShell } from './ModalShell.jsx'

/** Bloc « moment » (arrivée/départ) : calendrier + horloge natifs qui composent
 *  la chaîne lisible stockée (ex. "Mer 5 · dès 16:00"). */
function MomentField({ sx, label, qualifier, dateKey, timeKey, strKey, hebFields, setHebFields }) {
  const date = hebFields[dateKey] || ''
  const time = hebFields[timeKey] || ''
  const apply = (d, t) => setHebFields({
    [dateKey]: d, [timeKey]: t, [strKey]: composeHebMoment(d, t, qualifier),
  })
  return (
    <div>
      <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>{label}</div>
      <div style={sx('display:flex;gap:8px;margin-top:6px;margin-bottom:12px;')}>
        <input type="date" data-testid={`heb-${dateKey}`} value={date} onChange={(e) => apply(e.target.value, time)} style={sx('flex:1;min-width:0;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
        <input type="time" data-testid={`heb-${timeKey}`} value={time} onChange={(e) => apply(date, e.target.value)} style={sx('flex:0 0 auto;width:110px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
      </div>
      {!date && hebFields[strKey] && (
        <div style={sx('font-size:12px;color:#9a917f;margin:-6px 0 12px;')}>Actuel : {hebFields[strKey]} — choisis une date pour le mettre à jour.</div>
      )}
    </div>
  )
}

export function EditHebergementModal({ isOpen, onClose, hebFields, setHebFields, darkMode, onSubmit }) {
  if (!isOpen) return null
  const sx = css => s(css)

  // App fournit un setHebFields qui applique un OBJET de mises à jour partielles
  // (une ou plusieurs clés) — on ne passe donc jamais de fonction updater ici.
  const handleChange = (field, value) => setHebFields({ [field]: value })
  const patch = (update) => setHebFields(update)

  const fields = [
    ['Nom', 'nom', 'Notre gîte en Carladès'],
    ['Adresse', 'adresse', 'Vezels-Roussy (15130)'],
    ['Capacité', 'capacite', '4–5 personnes · 2 chambres'],
    ['Wi-Fi réseau', 'wifiNom', 'LaGrange-Gite'],
    ['Wi-Fi code', 'wifiPass', ''],
    ['Contact', 'contact', 'Mme Vidal · 06 12 34 56 78'],
  ]

  return (
    <ModalShell onClose={onClose} z={200} fade={true}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Modifier l\'hébergement</div>
        {fields.slice(0, 2).map(([label, key, ph]) => (
          <div key={key}>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>{label}</div>
            <input value={hebFields[key] || ''} onChange={e => handleChange(key, e.target.value)} placeholder={ph} style={sx('width:100%;margin-top:6px;margin-bottom:12px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
          </div>
        ))}
        <MomentField sx={sx} label="Arrivée" qualifier="dès" dateKey="arriveeDate" timeKey="arriveeTime" strKey="arrivee" hebFields={hebFields} setHebFields={patch} />
        <MomentField sx={sx} label="Départ" qualifier="avant" dateKey="departDate" timeKey="departTime" strKey="depart" hebFields={hebFields} setHebFields={patch} />
        {fields.slice(2).map(([label, key, ph]) => (
          <div key={key}>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>{label}</div>
            <input value={hebFields[key] || ''} onChange={e => handleChange(key, e.target.value)} placeholder={ph} style={sx('width:100%;margin-top:6px;margin-bottom:12px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
          </div>
        ))}
        <div style={sx('display:flex;gap:10px;margin-top:8px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Annuler</button>
          <button onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Enregistrer</button>
        </div>
      </div>
    </ModalShell>
  )
}
