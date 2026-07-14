// ── Défi du jour (mini-quêtes enfants, Carladès) ──────────────────────────────
//
// Pool statique + sélection **déterministe par date** (même défi pour toute la
// famille le même jour, sans stockage). Calcul pur, hors-ligne.

export const CHALLENGES = [
  { emoji: '📷', label: "Prends une photo d'une cascade" },
  { emoji: '🐄', label: 'Compte 10 vaches de Salers' },
  { emoji: '🧀', label: 'Goûte un fromage que tu ne connais pas' },
  { emoji: '🛖', label: 'Repère un buron dans la montagne' },
  { emoji: '🦅', label: 'Observe un rapace en vol' },
  { emoji: '🌸', label: 'Trouve une fleur de gentiane' },
  { emoji: '💧', label: 'Trempe tes pieds dans un ruisseau' },
  { emoji: '🥾', label: 'Marche jusqu’à un point de vue à 360°' },
  { emoji: '🍫', label: 'Mérite un goûter après l’effort' },
  { emoji: '🪨', label: 'Ramasse un caillou volcanique noir' },
  { emoji: '🌰', label: 'Trouve une châtaigne ou un pin' },
  { emoji: '🎨', label: 'Dessine le paysage sur un carnet' },
]

/** Clé de jour locale « YYYY-MM-DD ». */
export function dayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Défi du jour : sélection déterministe par nombre de jours depuis l'époque →
 * on parcourt le pool dans l'ordre (variété garantie, pas de répétition avant
 * d'avoir fait le tour). Même entrée = même sortie.
 */
export function challengeOfDay(key = dayKey(), pool = CHALLENGES) {
  if (!pool.length) return null
  const days = Math.floor(new Date(`${key}T12:00:00`).getTime() / 86400000)
  const idx = ((days % pool.length) + pool.length) % pool.length
  return { ...pool[idx], idx }
}
