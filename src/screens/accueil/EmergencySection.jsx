import { TelLink } from '../../components/Links.jsx'

/** Section « Urgences & repères » de l'Accueil (numéros cliquables + ma position). */
export function EmergencySection({ sx, emergencyNumbers, openMyPosition }) {
  return (
    <>
      <div style={sx('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>🆘 Urgences & repères</div>
      <div style={sx('padding:0 18px 12px;')}>
        <div data-testid="emergency-block" style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:6px 14px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          {emergencyNumbers.map((e, i) => (
            <div key={e.num} style={sx(`display:flex;align-items:center;gap:10px;padding:10px 0;${i < emergencyNumbers.length - 1 ? 'border-bottom:1px solid #f1e9da;' : ''}`)}>
              <span style={sx('font-size:19px;flex:0 0 auto;')}>{e.emoji}</span>
              <span style={sx('flex:1;font-size:14px;color:#3a352b;')}>{e.label}</span>
              <TelLink sx={sx} num={e.num} style={'color:#b8503f;font-weight:700;text-decoration:none;font-family:Quicksand;font-size:15px;'}>📞 {e.num}</TelLink>
            </div>
          ))}
        </div>
        <button data-testid="btn-my-position" onClick={openMyPosition} style={sx('width:100%;margin-top:10px;border:1px solid #4f8a86;background:#fffdf8;color:#4f8a86;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px;cursor:pointer;')}>📍 Ma position → Google Maps</button>
      </div>
    </>
  )
}
