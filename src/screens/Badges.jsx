import { useEffect, useState } from 'react'
import { computeBadges } from '../badges.js'
import { Confetti } from '../Confetti.jsx'

/**
 * Écran « Mes badges » : gamifie le séjour pour les enfants. Badges verrouillés
 * / débloqués calculés depuis des données déjà suivies (visites, défis, bingo,
 * photos, journal). Petite célébration (Confetti) s'il y a des badges gagnés.
 */
export function Badges({ sx, storeData }) {
  const badges = computeBadges(storeData ? storeData() : {})
  const unlocked = badges.filter((b) => b.unlocked).length
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    if (unlocked > 0) { const t = setTimeout(() => setCelebrate(true), 150); return () => clearTimeout(t) }
  }, [unlocked])

  return (
    <div data-testid="screen-badges" style={sx('padding:0 18px 24px;')}>
      <Confetti trigger={celebrate} onEnd={() => setCelebrate(false)} />

      <div data-testid="badges-header" style={sx('margin:8px 0 14px;border-radius:18px;padding:16px;border:2px solid #4a5d3a;background:#fffdf8;box-shadow:0 4px 14px rgba(74,93,58,0.12);text-align:center;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:26px;')}>{unlocked}/{badges.length}</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>badges débloqués — bravo les explorateurs !</div>
      </div>

      <div style={sx('display:flex;flex-direction:column;gap:10px;')}>
        {badges.map((b) => (
          <div key={b.id} data-testid={`badge-${b.id}`} data-unlocked={b.unlocked ? '1' : '0'} style={sx(`display:flex;gap:12px;align-items:center;background:#fffdf8;border:1px solid ${b.unlocked ? '#4a5d3a' : '#efe6d4'};border-radius:16px;padding:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);${b.unlocked ? '' : 'opacity:0.7;'}`)}>
            <div style={sx(`width:46px;height:46px;flex:0 0 auto;border-radius:14px;background:${b.unlocked ? '#e7ecdf' : '#f3ece0'};display:flex;align-items:center;justify-content:center;font-size:22px;${b.unlocked ? '' : 'filter:grayscale(1);'}`)}>{b.unlocked ? b.emoji : '🔒'}</div>
            <div style={sx('flex:1;min-width:0;')}>
              <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{b.name}</div>
              <div style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>{b.desc}</div>
              <div style={sx('margin-top:6px;height:6px;border-radius:6px;background:#f1e9da;overflow:hidden;')}>
                <div style={sx(`height:100%;width:${Math.round((b.value / b.target) * 100)}%;background:${b.unlocked ? '#4a5d3a' : '#cf7d3c'};`)} />
              </div>
            </div>
            <div style={sx('flex:0 0 auto;font-family:Quicksand;font-weight:700;font-size:13px;color:#6b6354;')}>{b.value}/{b.target}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
