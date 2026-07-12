import { s } from '../utils.js'

export function EditHebergementModal({ isOpen, onClose, hebFields, setHebFields, darkMode, onSubmit }) {
  if (!isOpen) return null
  const sx = css => s(css)

  const handleChange = (field, value) => {
    setHebFields(prev => ({ ...prev, [field]: value }))
  }

  const fields = [
    ['Nom', 'nom', 'Notre gîte en Carladès'],
    ['Adresse', 'adresse', 'Vezels-Roussy (15130)'],
    ['Arrivée', 'arrivee', 'Sam 11 · dès 16 h'],
    ['Départ', 'depart', 'Sam 18 · avant 10 h'],
    ['Capacité', 'capacite', '4–5 personnes · 2 chambres'],
    ['Wi-Fi réseau', 'wifiNom', 'LaGrange-Gite'],
    ['Wi-Fi code', 'wifiPass', ''],
    ['Contact', 'contact', 'Mme Vidal · 06 12 34 56 78'],
  ]

  return (
    <div onClick={onClose} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
      <div onClick={e => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:16px;')}>Modifier l\'hébergement</div>
        {fields.map(([label, key, ph]) => (
          <div key={key}>
            <div style={sx('font-size:12px;font-weight:700;color:#6b6354;')}>{label}</div>
            <input value={hebFields[key] || ''} onChange={e => handleChange(key, e.target.value)} placeholder={ph} style={sx('width:100%;margin-top:6px;margin-bottom:12px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;')} />
          </div>
        ))}
        <div style={sx('display:flex;gap:10px;margin-top:8px;')}>
          <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
          <button onClick={onSubmit} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
