/**
 * Badges de progression pour les enfants, 100 % locaux et déterministes.
 * Chaque badge se débloque à un jalon calculé à partir de données déjà suivies
 * (visites notées, défis, bingo, photos, journal). Module pur, testable.
 */
import { countCompletedLines, isFullHouse } from './bingo.js'
import { isVisited } from './visits-progress.js'

const countTrue = (obj, pred = Boolean) => Object.values(obj || {}).filter(pred).length
const visitedCount = (s) => (s.visits || []).filter((v) => isVisited(s.ratings, v.id)).length

/** Catalogue des badges. `target` peut être un nombre ou une fonction du store. */
export const BADGES = [
  { id: 'first-visit', emoji: '🧭', name: 'Première sortie', desc: 'Note ta première visite', target: 1, value: visitedCount },
  { id: 'explorer', emoji: '🥾', name: 'Explorateur', desc: '5 visites faites', target: 5, value: visitedCount },
  { id: 'explorer-carlades', emoji: '🏔️', name: 'Explorateur du Carladès', desc: 'Toutes les visites faites', target: (s) => (s.visits || []).length || 1, value: visitedCount },
  { id: 'challenger', emoji: '🎯', name: 'Relève-défis', desc: '3 défis du jour relevés', target: 3, value: (s) => countTrue(s.challengesDone) },
  { id: 'bingo-line', emoji: '🔍', name: 'Ligne de bingo', desc: 'Complète une ligne du bingo', target: 1, value: (s) => countCompletedLines(s.bingo || {}) },
  { id: 'bingo-full', emoji: '🎉', name: 'Bingo complet', desc: 'Toute la grille du bingo', target: 1, value: (s) => (isFullHouse(s.bingo || {}) ? 1 : 0) },
  { id: 'photographer', emoji: '📸', name: 'Photographe', desc: '5 photos de souvenirs', target: 5, value: (s) => (s.photos || []).length },
  { id: 'journalist', emoji: '📔', name: 'Journaliste', desc: '3 pages de journal', target: 3, value: (s) => countTrue(s.journal, (t) => t && String(t).trim()) },
]

/** Évalue tous les badges pour un store : valeur, cible, débloqué. */
export function computeBadges(store) {
  const s = store || {}
  return BADGES.map((b) => {
    const target = typeof b.target === 'function' ? b.target(s) : b.target
    const value = Math.min(b.value(s), target)
    return { id: b.id, emoji: b.emoji, name: b.name, desc: b.desc, target, value, unlocked: target > 0 && value >= target }
  })
}

/** Résumé { unlocked, total, badges }. */
export function badgeStats(store) {
  const badges = computeBadges(store)
  return { unlocked: badges.filter((b) => b.unlocked).length, total: badges.length, badges }
}
