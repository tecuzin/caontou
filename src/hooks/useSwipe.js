import { useRef } from 'react'

// Détection de swipe horizontal (tactile). La position de départ est
// gardée dans une ref (pas un state) : elle doit survivre à un re-render
// du composant qui intervient entre le touchstart et le touchend (l'app
// re-rend très souvent), sans redéclencher de rendu pour un simple geste.
const SWIPE_THRESHOLD = 50 // px minimum de déplacement horizontal pour compter comme un swipe
const MAX_VERTICAL_RATIO = 0.6 // au-delà, on considère que c'est un scroll vertical, pas un swipe

/**
 * useSwipe(onSwipeLeft, onSwipeRight) — retourne { onTouchStart, onTouchEnd }
 * à attacher à un élément. onSwipeLeft se déclenche quand le doigt glisse
 * vers la gauche (deltaX négatif), onSwipeRight vers la droite (deltaX
 * positif). Ignore les gestes trop verticaux (scroll) ou trop courts (tap
 * normal, pas de conflit avec les clics/boutons).
 */
export function useSwipe(onSwipeLeft, onSwipeRight) {
  const start = useRef(null)

  const onTouchStart = (e) => {
    const t = e.touches && e.touches[0]
    if (!t) return
    start.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e) => {
    if (!start.current) return
    const t = e.changedTouches && e.changedTouches[0]
    const { x, y } = start.current
    start.current = null
    if (!t) return
    const dx = t.clientX - x
    const dy = t.clientY - y
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    if (Math.abs(dy) > Math.abs(dx) * MAX_VERTICAL_RATIO) return
    if (dx < 0) onSwipeLeft && onSwipeLeft()
    else onSwipeRight && onSwipeRight()
  }

  return { onTouchStart, onTouchEnd }
}
