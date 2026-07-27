import { useEffect, useState } from 'react'

/**
 * Pastille discrète « ✓ Enregistré », visible ~2 s après chaque écriture.
 *
 * L'app n'a aucun cloud : rien ne dit à l'utilisateur que sa saisie est
 * conservée, ce qui inquiète (« et si je ferme ? »). Ce retour visuel
 * répond à la question sans encombrer l'écran.
 *
 * `savedAt` est un horodatage qui change à chaque sauvegarde ; rien n'est
 * affiché tant qu'il est absent (premier rendu = pas de faux positif).
 */
export function SavedIndicator({ sx, savedAt, duration = 2000 }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!savedAt) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(t)
  }, [savedAt, duration])

  if (!visible) return null

  return (
    <div
      data-testid="saved-indicator"
      role="status"
      aria-live="polite"
      style={sx('position:fixed;left:0;right:0;bottom:96px;z-index:200;display:flex;justify-content:center;pointer-events:none;animation:fadeIn 0.2s ease;')}
    >
      <span style={sx('background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:12px;border-radius:999px;padding:6px 12px;')}>
        ✓ Enregistré sur ce téléphone
      </span>
    </div>
  )
}
