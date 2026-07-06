import { GiteScene } from '../Scenery.jsx'

const HEB_EQUIP = ['Wi-Fi', 'Cheminée (cantou)', 'Lave-linge', 'Lit bébé', 'Jardin clos', 'Parking', 'Lave-vaisselle', 'Barbecue']

/** Sous-écran Hébergement — infos du gîte, éditables. */
export function Hebergement({ sx, hebergement, openHebEdit }) {
  return (
    <div style={sx('padding:16px 18px 40px;')}>
      <div style={sx('height:150px;border-radius:18px;overflow:hidden;box-shadow:0 2px 8px rgba(74,93,58,0.1);')}>
        <GiteScene />
      </div>
      <div style={sx('display:flex;align-items:center;margin-top:14px;gap:10px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:20px;flex:1;')}>{hebergement.nom}</div>
        <button onClick={openHebEdit} style={sx('border:none;background:transparent;cursor:pointer;font-size:18px;padding:4px;')}>✏️</button>
      </div>
      <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>📍 {hebergement.adresse}</div>
      <div style={sx('display:flex;gap:10px;margin-top:14px;')}>
        <div style={sx('flex:1;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px;')}><div style={sx('font-size:12px;color:#6b6354;')}>Arrivée</div><div style={sx('font-weight:700;font-size:14px;margin-top:3px;')}>{hebergement.arrivee}</div></div>
        <div style={sx('flex:1;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px;')}><div style={sx('font-size:12px;color:#6b6354;')}>Départ</div><div style={sx('font-weight:700;font-size:14px;margin-top:3px;')}>{hebergement.depart}</div></div>
      </div>
      <div style={sx('margin-top:10px;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px 14px;font-size:14px;')}>🛏️ {hebergement.capacite}</div>
      <div style={sx('margin:18px 0 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>Équipements</div>
      <div style={sx('display:flex;flex-wrap:wrap;gap:8px;')}>
        {HEB_EQUIP.map((eq) => <span key={eq} style={sx('background:#fffdf8;border:1px solid #e3d8c2;border-radius:999px;padding:7px 13px;font-size:13px;font-weight:600;color:#6b6354;')}>{eq}</span>)}
      </div>
      <div style={sx('margin-top:16px;background:#e7ecdf;border-radius:14px;padding:14px;')}>
        <div style={sx('font-weight:700;font-family:Quicksand;')}>📶 Wi-Fi</div>
        <div style={sx('font-size:13px;color:#4a5d3a;margin-top:5px;')}>Réseau : <b>{hebergement.wifiNom}</b></div>
        <div style={sx('font-size:13px;color:#4a5d3a;margin-top:2px;')}>Code : <b>{hebergement.wifiPass}</b></div>
      </div>
      <div style={sx('margin-top:10px;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px 14px;font-size:14px;')}>📞 {hebergement.contact}</div>
      <div style={sx('margin-top:10px;background:#f1e4d4;border-radius:14px;padding:14px;font-size:13px;line-height:1.5;color:#6b5a45;')}>{hebergement.note}</div>
    </div>
  )
}
