import { useState, useEffect } from 'react'
import {
  buildBoard, isPair, countMatchedPairs, isBoardComplete, memoryRating,
  randomSeed, MEMORY_DEFAULT_PAIRS,
} from '../memory.js'

/** Sous-écran Mémory du Carladès — jeu calme (pluie, sieste, trajet retour).
 *  Autonome : partie en état local, motifs repris du Bingo (aucune image). */
export function Memory({ sx, pairs = MEMORY_DEFAULT_PAIRS }) {
  const [seed, setSeed] = useState(randomSeed)
  const [board, setBoard] = useState(() => buildBoard(pairs, seed))
  const [flipped, setFlipped] = useState([])   // cartes retournées ce tour (0-2)
  const [matched, setMatched] = useState([])   // ids des cartes appariées
  const [moves, setMoves] = useState(0)

  // Deux cartes retournées : on laisse le temps de les voir avant de refermer.
  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    setMoves((m) => m + 1)
    if (isPair(a, b)) {
      setMatched((ids) => [...ids, a.id, b.id])
      setFlipped([])
      return
    }
    const t = setTimeout(() => setFlipped([]), 900)
    return () => clearTimeout(t)
  }, [flipped])

  const restart = () => {
    const s = randomSeed()
    setSeed(s); setBoard(buildBoard(pairs, s))
    setFlipped([]); setMatched([]); setMoves(0)
  }

  const flip = (card) => {
    if (flipped.length === 2) return
    if (matched.includes(card.id)) return
    if (flipped.some((c) => c.id === card.id)) return
    setFlipped((f) => [...f, card])
  }

  const done = isBoardComplete(board, matched)
  const found = countMatchedPairs(matched)
  const total = board.length / 2

  return (
    <div data-testid="screen-memory" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('background:#4f8a86;border-radius:20px;padding:18px;color:#f3ecda;box-shadow:0 8px 20px rgba(79,138,134,0.22);')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>🧩 Mémory du Carladès</div>
        <div style={sx('font-size:13px;color:#dbe2c9;margin-top:4px;')}>Retourne deux cartes : si elles vont ensemble, elles restent ouvertes.</div>
        <div style={sx('display:flex;gap:8px;margin-top:12px;')}>
          <div data-testid="memory-found" style={sx('background:rgba(255,255,255,0.18);border-radius:12px;padding:6px 12px;font-weight:700;font-family:Quicksand;font-size:13px;')}>✓ {found}/{total} paires</div>
          <div data-testid="memory-moves" style={sx('background:rgba(255,255,255,0.18);border-radius:12px;padding:6px 12px;font-weight:700;font-family:Quicksand;font-size:13px;')}>🔁 {moves} coups</div>
        </div>
      </div>

      {done && (
        <div data-testid="memory-win" style={sx('margin-top:16px;background:#e7ecdf;border-radius:16px;padding:16px;text-align:center;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;color:#4a5d3a;')}>{memoryRating(moves, total)}</div>
          <div style={sx('font-size:14px;color:#6b6354;margin-top:4px;')}>Toutes les paires trouvées en {moves} coups.</div>
        </div>
      )}

      <div style={sx('display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-top:16px;')}>
        {board.map((card) => {
          const open = matched.includes(card.id) || flipped.some((c) => c.id === card.id)
          return (
            <button
              key={card.id} data-testid={`memory-card-${card.id}`}
              onClick={() => flip(card)}
              aria-label={open ? card.label : 'Carte face cachée'}
              style={sx(`aspect-ratio:1;border:1px solid ${open ? '#4f8a86' : '#efe6d4'};background:${open ? '#fffdf8' : '#ece2cf'};border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;cursor:pointer;padding:0;`)}
            >
              {open ? card.emoji : '❓'}
            </button>
          )
        })}
      </div>

      <button data-testid="memory-restart" onClick={restart} style={sx('width:100%;margin-top:16px;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>🔄 Nouvelle partie</button>
    </div>
  )
}
