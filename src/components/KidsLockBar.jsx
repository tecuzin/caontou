import { useState } from 'react'
import { checkUnlock } from '../kids-lock.js'

/**
 * Bandeau discret « 🔒 Mode enfant » affiché quand le téléphone est prêté :
 * il rappelle que l'app est bridée et propose le défi de déverrouillage
 * (une multiplication) pour rendre la main à un adulte.
 *
 * `challenge` vient de `makeUnlockChallenge(seed)` ; `onUnlock` n'est
 * appelé QUE si la réponse saisie est correcte.
 */
export function KidsLockBar({ sx, challenge, onUnlock }) {
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)

  const submit = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (checkUnlock(challenge, value)) {
      setWrong(false)
      setValue('')
      if (onUnlock) onUnlock()
    } else {
      setWrong(true)
    }
  }

  return (
    <form data-testid="kids-lock-bar" onSubmit={submit} style={sx('margin:0 18px 12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:12px 14px;box-shadow:0 2px 8px rgba(74,93,58,0.06);')}>
      <div style={sx('display:flex;align-items:center;gap:8px;')}>
        <span style={sx('font-size:19px;flex:0 0 auto;')}>🔒</span>
        <div style={sx('flex:1;min-width:0;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:14px;')}>Mode enfant</div>
          <div data-testid="kids-lock-question" style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>{challenge ? challenge.question : 'Téléphone prêté : écrans sensibles masqués.'}</div>
        </div>
      </div>

      <div style={sx('display:flex;gap:8px;margin-top:10px;')}>
        <input
          data-testid="kids-lock-input"
          inputMode="numeric"
          aria-label="Réponse au défi"
          placeholder="Réponse"
          value={value}
          onChange={(e) => { setValue(e.target.value); setWrong(false) }}
          style={sx('flex:1;min-width:0;border:1px solid #d8cbb0;background:#fffaf0;color:#6b6354;font-family:Quicksand;font-weight:700;font-size:14px;border-radius:12px;padding:10px 12px;')}
        />
        <button data-testid="kids-lock-unlock" type="submit" style={sx('flex:0 0 auto;border:none;background:#4f8a86;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:12px;padding:10px 16px;cursor:pointer;')}>Déverrouiller</button>
      </div>

      {wrong && (
        <div data-testid="kids-lock-error" style={sx('font-size:12px;color:#b8503f;margin-top:8px;')}>Ce n’est pas la bonne réponse.</div>
      )}
    </form>
  )
}
