import { useState } from 'react'
import { Confetti } from './Confetti.jsx'
import { s } from './utils.js'

/**
 * Confetti — pluie de particules ~2 s à la complétion d'une checklist (haptic
 * Medium). Rien si `prefers-reduced-motion`. Overlay plein écran, `pointer-events:none`.
 */
export default {
  title: 'Composants/Confetti',
  component: Confetti,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export const AuDeclenchement = {
  name: 'Au déclenchement (rejouer)',
  render: () => {
    const [run, setRun] = useState(0)
    return (
      <div style={{ minHeight: 120, display: 'flex', alignItems: 'center' }}>
        <button onClick={() => setRun((x) => x + 1)} style={s('border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px 20px;cursor:pointer;')}>🎉 Rejouer les confettis</button>
        <Confetti key={run} trigger={run > 0} />
      </div>
    )
  },
}
