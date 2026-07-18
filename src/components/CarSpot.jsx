import { formatParkedAt, hasCarSpot } from '../carspot.js'

/**
 * Carte « Mémo voiture » : mémorise l'endroit où on s'est garé (GPS) et permet
 * d'y retourner via Google Maps. Le point est stocké dans le store (`carSpot`).
 */
export function CarSpot({ sx, carSpot, parkCar, findCar, forgetCar }) {
  const parked = hasCarSpot(carSpot)
  return (
    <div data-testid="car-spot" style={sx('margin:0 18px 14px;background:#fffdf8;border:1px solid #efe6d4;border-radius:20px;padding:16px;box-shadow:0 2px 8px rgba(74,93,58,0.06);')}>
      <div style={sx('display:flex;align-items:center;gap:10px;')}>
        <span style={sx('font-size:22px;flex:0 0 auto;')}>🅿️</span>
        <div style={sx('flex:1;min-width:0;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>Mémo voiture</div>
          <div style={sx('font-size:12px;color:#6b6354;margin-top:1px;')}>{parked ? formatParkedAt(carSpot.at) : 'Sur un grand parking ? Mémorise où tu t\'es garé.'}</div>
        </div>
      </div>

      {parked ? (
        <div style={sx('display:flex;gap:8px;margin-top:12px;')}>
          <button data-testid="btn-find-car" onClick={findCar} style={sx('flex:1;border:none;background:#4f8a86;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px;cursor:pointer;')}>🧭 Y retourner</button>
          <button data-testid="btn-park-again" onClick={parkCar} style={sx('flex:0 0 auto;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px 14px;cursor:pointer;')}>↻</button>
          <button data-testid="btn-forget-car" onClick={forgetCar} style={sx('flex:0 0 auto;border:1px solid #d8cbb0;background:#fffdf8;color:#b8503f;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px 14px;cursor:pointer;')}>🗑️</button>
        </div>
      ) : (
        <button data-testid="btn-park-car" onClick={parkCar} style={sx('width:100%;margin-top:12px;border:none;background:#4f8a86;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>🅿️ J'ai garé ici</button>
      )}
    </div>
  )
}
