import { useState, useRef, useEffect } from 'react'

/**
 * Filet « Annuler » après une suppression.
 *
 * Prend un instantané des tranches de store concernées avant chaque 🗑️, et
 * les restaure si l'utilisateur clique « Annuler » dans les 5 secondes.
 *
 * ── Pourquoi piloté par les données ────────────────────────────────────
 * La version précédente listait les 18 tranches DEUX fois : une fois pour
 * l'instantané, une fois pour la restauration. Ajouter une tranche demandait
 * de penser aux deux endroits — et c'est exactement l'oubli qui a laissé les
 * restos, les idées et la checklist de départ hors du filet pendant des mois.
 * Ici, une tranche se déclare **une seule fois**.
 *
 * @param {Record<string, [any, Function]>} slices  { nom: [valeur, setter] }
 * @param {number} delayMs
 */
export function useUndo(slices, delayMs = 5000) {
  const [undoMsg, setUndoMsg] = useState(null)
  const snapRef = useRef(null)
  const timerRef = useRef(null)
  // Les valeurs changent à chaque render : on garde une référence fraîche
  // pour que `offerUndo` capture l'état au moment du clic, pas à la création.
  const slicesRef = useRef(slices)
  slicesRef.current = slices

  useEffect(() => () => clearTimeout(timerRef.current), [])

  /** Prend l'instantané et affiche le bandeau. */
  const offerUndo = (msg) => {
    const snap = {}
    for (const [key, pair] of Object.entries(slicesRef.current)) snap[key] = pair[0]
    snapRef.current = snap
    setUndoMsg(msg)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setUndoMsg(null), delayMs)
  }

  /** Restaure l'instantané. Sans instantané, ne fait rien. */
  const applyUndo = (onRestore) => {
    const snap = snapRef.current
    if (!snap) return false
    for (const [key, value] of Object.entries(snap)) {
      const pair = slicesRef.current[key]
      if (pair && typeof pair[1] === 'function') pair[1](value)
    }
    setUndoMsg(null)
    snapRef.current = null
    clearTimeout(timerRef.current)
    if (typeof onRestore === 'function') onRestore()
    return true
  }

  return { undoMsg, offerUndo, applyUndo }
}
