import { useState } from 'react'
import { QUIZ_QUESTIONS, quizScorePct } from '../quiz.js'

const BEST_KEY = 'cantou.quizBest'
const readBest = () => { try { return parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0 } catch { return 0 } }
const writeBest = (n) => { try { localStorage.setItem(BEST_KEY, String(n)) } catch { } }

/** Sous-écran Quiz du Carladès — flashcards question → réponse pour enfants.
 *  Autonome : score de la manche en state local, meilleur score en localStorage
 *  (trivia local à l'appareil, hors store cantou.v1). */
export function Quiz({ sx }) {
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [good, setGood] = useState(0)
  const [done, setDone] = useState(false)
  const [best, setBest] = useState(readBest)

  const total = QUIZ_QUESTIONS.length
  const finish = (nextGood) => {
    setDone(true)
    if (nextGood > best) { setBest(nextGood); writeBest(nextGood) }
  }
  const answer = (knew) => {
    const nextGood = good + (knew ? 1 : 0)
    setGood(nextGood)
    if (i + 1 >= total) finish(nextGood)
    else { setI(i + 1); setRevealed(false) }
  }
  const restart = () => { setI(0); setRevealed(false); setGood(0); setDone(false) }

  if (done) {
    return (
      <div data-testid="screen-quiz" style={sx('padding:16px 18px 40px;')}>
        <div data-testid="quiz-result" style={sx('background:#5b7042;border-radius:20px;padding:22px;color:#f3ecda;text-align:center;box-shadow:0 8px 20px rgba(91,112,66,0.22);')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:22px;')}>🎉 Bravo !</div>
          <div style={sx('font-size:40px;font-family:Quicksand;font-weight:700;margin:10px 0;')}>{good}/{total}</div>
          <div style={sx('font-size:14px;color:#dbe2c9;')}>{quizScorePct(good)} % de bonnes réponses · Record : {best}/{total}</div>
        </div>
        <button data-testid="quiz-restart" onClick={restart} style={sx('width:100%;margin-top:16px;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:14px;cursor:pointer;')}>Rejouer</button>
      </div>
    )
  }

  const card = QUIZ_QUESTIONS[i]
  return (
    <div data-testid="screen-quiz" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>❓ Quiz du Carladès</div>
        <div style={sx('font-size:13px;font-weight:700;color:#6b6354;')}>{i + 1}/{total}</div>
      </div>
      <div style={sx('height:8px;border-radius:8px;background:#efe6d4;overflow:hidden;margin-bottom:16px;')}><div style={sx(`height:100%;background:#5b7042;width:${quizScorePct(i, total)}%;`)} /></div>

      <button data-testid="quiz-card" onClick={() => setRevealed(true)} style={sx('width:100%;text-align:left;background:#fffdf8;border:1px solid #efe6d4;border-radius:18px;padding:22px 18px;cursor:pointer;box-shadow:0 4px 14px rgba(74,93,58,0.08);min-height:150px;')}>
        <div style={sx('font-size:12px;font-weight:700;color:#8a8b3d;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;')}>Question</div>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:18px;color:#2f2a22;')}>{card.q}</div>
        {revealed
          ? <div data-testid="quiz-answer" style={sx('margin-top:16px;padding-top:14px;border-top:1px solid #f1e9da;')}><div style={sx('font-size:12px;font-weight:700;color:#4a5d3a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;')}>Réponse</div><div style={sx('font-size:16px;color:#4a5d3a;font-weight:600;')}>{card.a}</div></div>
          : <div style={sx('margin-top:16px;font-size:13px;color:#9a917f;')}>👆 Touche la carte pour voir la réponse</div>}
      </button>

      {revealed && (
        <div style={sx('display:flex;gap:10px;margin-top:16px;')}>
          <button data-testid="quiz-miss" onClick={() => answer(false)} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>😅 Pas trouvé</button>
          <button data-testid="quiz-knew" onClick={() => answer(true)} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>✅ Je savais !</button>
        </div>
      )}
    </div>
  )
}
