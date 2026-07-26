import { countCompletedLines } from '../bingo.js'

/** Sous-écran Bingo du Cantal — grille 4×4 à cocher pour les enfants. */
export function Bingo({ sx, items, checked, toggleBingo, currentChild = '', setCurrentChild, childOptions = [] }) {
  const done = items.reduce((n, _, i) => n + (checked[i] ? 1 : 0), 0)
  const lines = countCompletedLines(checked)
  return (
    <div data-testid="screen-bingo" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('background:#5b7042;border-radius:20px;padding:18px;color:#f3ecda;box-shadow:0 8px 20px rgba(91,112,66,0.22);')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>🔍 Bingo du Cantal</div>
        <div style={sx('font-size:13px;color:#dbe2c9;margin-top:4px;')}>Repérez ces trésors pendant les balades et sur la route. Une rangée, une colonne ou une diagonale complète = 🎉 !</div>
        <div style={sx('display:flex;gap:8px;margin-top:12px;')}>
          <div data-testid="bingo-lines" style={sx('background:rgba(255,255,255,0.18);border-radius:12px;padding:6px 12px;font-weight:700;font-family:Quicksand;font-size:13px;')}>🎉 {lines}/10 lignes</div>
          <div style={sx('background:rgba(255,255,255,0.18);border-radius:12px;padding:6px 12px;font-weight:700;font-family:Quicksand;font-size:13px;')}>✓ {done}/16 cases</div>
        </div>
      </div>


      {setCurrentChild && (
        <div data-testid="bingo-child-picker" style={sx('display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px;')}>
          <span style={sx('font-size:12px;font-weight:700;color:#6b6354;text-transform:uppercase;letter-spacing:0.5px;')}>Qui joue ?</span>
          {['', ...childOptions.filter((n) => n !== 'Famille')].map((name) => {
            const on = currentChild === name
            return (
              <button
                key={name || 'famille'} data-testid={`bingo-child-${name || 'famille'}`}
                onClick={() => setCurrentChild(name)}
                style={sx(`border:1px solid ${on ? '#4a5d3a' : '#ece2cf'};background:${on ? '#4a5d3a' : '#fffdf8'};color:${on ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:6px 12px;font-weight:700;font-size:12px;cursor:pointer;`)}
              >{name || '👨‍👩‍👧‍👦 Famille'}</button>
            )
          })}
        </div>
      )}

      <div style={sx('display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-top:16px;')}>
        {items.map((it, i) => {
          const on = !!checked[i]
          return (
            <button key={i} data-testid={`bingo-cell-${i}`} onClick={() => toggleBingo(i)} style={sx(`aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;border:${on ? '2px solid #4a5d3a' : '1px solid #e3d8c2'};background:${on ? '#e7ecdf' : '#fffdf8'};border-radius:14px;padding:4px;cursor:pointer;box-shadow:0 2px 6px rgba(74,93,58,0.06);`)}>
              <span style={sx(`font-size:26px;${on ? '' : 'filter:grayscale(0.4);opacity:0.85;'}`)}>{on ? '✅' : it.emoji}</span>
              <span style={sx('font-size:12px;line-height:1.15;font-weight:700;color:#6b6354;')}>{it.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
