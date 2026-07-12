import { useState, useEffect } from 'react'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

/**
 * Confetti — célébration quand une checklist atteint 100%.
 * Particules tombant du haut, animation 2 s, haptic Medium.
 * Respecte prefers-reduced-motion (rien n'est affiché).
 */
export function Confetti({ trigger = false, onEnd = () => {} }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!trigger) return
    setShow(true)
    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
    const timer = setTimeout(() => {
      setShow(false)
      onEnd()
    }, 2000)
    return () => clearTimeout(timer)
  }, [trigger, onEnd])

  if (!show) return null

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) return null

  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 1.5 + Math.random() * 0.5,
    color: ['#4a5d3a', '#9c6b4a', '#cf7d3c', '#b8503f', '#4f8a86'][
      Math.floor(Math.random() * 5)
    ],
  }))

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
        .confetti-particle {
          position: fixed;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: confetti-fall linear forwards;
          top: -10px;
        }
      `}</style>

      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
