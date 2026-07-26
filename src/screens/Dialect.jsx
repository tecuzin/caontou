import { useMemo, useState } from 'react'
import { DIALECT_WORDS, pickRound, randomDialectSeed } from '../dialect.js'

/** Sous-écran « Mini-lexique auvergnat » — flashcards mot → sens pour enfants.
 *  Autonome : manche tirée localement (PRNG seedé), aucun état persisté,
 *  aucun appel réseau (le lexique est embarqué dans `dialect.js`). */
export function Dialect({ sx }) {
  const [seed, setSeed] = useState(randomDialectSeed)
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const round = useMemo(() => pickRound(DIALECT_WORDS, DIALECT_WORDS.length, seed), [seed])
  const total = round.length
  const card = round[i]

  const go = (delta) => {
    setI((prev) => (prev + delta + total) % total)
    setRevealed(false)
  }
  const shuffleRound = () => { setSeed(randomDialectSeed()); setI(0); setRevealed(false) }

  if (!card) return <div data-testid="screen-dialect" style={sx('padding:16px 18px 40px;')} />

  return (
    <div data-testid="screen-dialect" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>🗣️ Parler d’ici</div>
        <div style={sx('font-size:13px;font-weight:700;color:#6b6354;')}>{i + 1}/{total}</div>
      </div>
      <div style={sx('height:8px;border-radius:8px;background:#efe6d4;overflow:hidden;margin-bottom:16px;')}>
        <div style={sx(`height:100%;background:#5b7042;width:${Math.round(((i + 1) / total) * 100)}%;`)} />
      </div>

      <button data-testid="dialect-card" onClick={() => setRevealed(true)} style={sx('width:100%;text-align:left;background:#fffdf8;border:1px solid #efe6d4;border-radius:20px;padding:22px 18px;cursor:pointer;box-shadow:0 4px 14px rgba(74,93,58,0.08);min-height:150px;')}>
        <div style={sx('font-size:12px;font-weight:700;color:#8a8b3d;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;')}>Le mot</div>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:26px;color:#2f2a22;')}>{card.word}</div>
        {revealed
          ? (
            <div data-testid="dialect-meaning" style={sx('margin-top:16px;padding-top:14px;border-top:1px solid #f1e9da;')}>
              <div style={sx('font-size:12px;font-weight:700;color:#4a5d3a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;')}>Ça veut dire</div>
              <div style={sx('font-size:15px;color:#4a5d3a;font-weight:600;')}>{card.meaning}</div>
              {card.note && <div data-testid="dialect-note" style={sx('margin-top:10px;font-size:13px;color:#6b6354;')}>💡 {card.note}</div>}
            </div>
          )
          : <div style={sx('margin-top:16px;font-size:13px;color:#9a917f;')}>👆 Devine, puis touche la carte pour voir le sens</div>}
      </button>

      <div style={sx('display:flex;gap:10px;margin-top:16px;')}>
        <button data-testid="dialect-prev" onClick={() => go(-1)} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>← Précédent</button>
        <button data-testid="dialect-next" onClick={() => go(1)} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Suivant →</button>
      </div>

      <button data-testid="dialect-shuffle" onClick={shuffleRound} style={sx('width:100%;margin-top:10px;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px;cursor:pointer;')}>🔀 Mélanger les mots</button>

      <div style={sx('margin-top:16px;font-size:12px;color:#9a917f;line-height:1.5;')}>
        Mots recoupés dans au moins deux sources sérieuses. L’orthographe et les
        usages varient d’une vallée à l’autre du Cantal.
      </div>
    </div>
  )
}
