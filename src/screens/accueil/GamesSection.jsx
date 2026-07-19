import { useState } from 'react'

/** Section « Jeux avec les enfants » de l'Accueil (bingo + idées de jeux repliables). */
export function GamesSection({ sx, kidsGames, setSub }) {
  const [gamesOpen, setGamesOpen] = useState(false)
  return (
    <>
      <div style={sx('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>🎲 Jeux avec les enfants</div>
      <div style={sx('padding:0 18px 12px;')}>
        <button data-testid="btn-open-bingo" onClick={() => setSub('bingo')} style={sx('width:100%;text-align:left;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:14px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          <div style={sx('width:42px;height:42px;flex:0 0 auto;border-radius:14px;background:#e7ecdf;display:flex;align-items:center;justify-content:center;font-size:22px;')}>🔍</div>
          <div style={sx('flex:1;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>Bingo du Cantal</div>
            <div style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>16 trésors à repérer · une ligne complète = 🎉</div>
          </div>
          <div style={sx('font-size:14px;color:#6b6354;flex:0 0 auto;')}>›</div>
        </button>
        <button data-testid="btn-toggle-games" onClick={() => setGamesOpen((o) => !o)} style={sx('width:100%;text-align:left;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:14px;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          <div style={sx('width:42px;height:42px;flex:0 0 auto;border-radius:14px;background:#e7ecdf;display:flex;align-items:center;justify-content:center;font-size:22px;')}>🎲</div>
          <div style={sx('flex:1;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>Idées de jeux</div>
            <div style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>{kidsGames.length} activités nature, au gîte et le soir</div>
          </div>
          <div style={sx('font-size:14px;color:#6b6354;flex:0 0 auto;')}>{gamesOpen ? '▲' : '▼'}</div>
        </button>
        {gamesOpen && (
          <div data-testid="games-list" style={sx('margin-top:10px;display:flex;flex-direction:column;gap:10px;')}>
            {kidsGames.map((g, i) => (
              <div key={i} style={sx('display:flex;gap:12px;align-items:flex-start;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
                <div style={sx('width:44px;height:44px;flex:0 0 auto;border-radius:14px;background:#f3ece0;display:flex;align-items:center;justify-content:center;font-size:22px;')}>{g.emoji}</div>
                <div style={sx('flex:1;min-width:0;')}>
                  <div style={sx(`font-size:12px;font-weight:700;color:${g.color};text-transform:uppercase;letter-spacing:0.5px;`)}>{g.place}</div>
                  <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;margin-top:2px;')}>{g.name}</div>
                  <div style={sx('font-size:12px;color:#6b6354;margin-top:4px;line-height:1.4;')}>{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
