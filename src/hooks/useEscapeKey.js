import { useEffect } from 'react'

/**
 * Ferme un overlay (modale, viewer plein écran) à la touche **Échap**. C'est la
 * vraie amélioration d'accessibilité derrière la conversion des backdrops
 * `<div onClick>` (Sonar S1082/S6848) : un équivalent clavier au clic souris.
 * `enabled` permet de ne l'armer que quand l'overlay est ouvert.
 */
export function useEscapeKey(onClose, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, enabled])
}
