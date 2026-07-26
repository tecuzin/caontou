/* ------------------------------------------------------------------ *
 * Jeu de Mémory du Carladès — logique pure et testable.
 *
 * Le plateau est construit à partir des emojis déjà présents dans le
 * Bingo (`BINGO_CANTAL`) : aucune nouvelle image, 100 % hors-ligne.
 * Le mélange est DÉTERMINISTE (PRNG seedé, jamais `Math.random`) pour
 * que `buildBoard(n, seed)` soit reproductible en test.
 * ------------------------------------------------------------------ */

import { BINGO_CANTAL } from './data.js'

/** Taille par défaut d'une partie : 6 paires = 12 cartes = grille 4×3. */
export const MEMORY_DEFAULT_PAIRS = 6

/** Nombre maximal de paires possibles (limité par la banque d'emojis). */
export const MEMORY_MAX_PAIRS = BINGO_CANTAL.length

/** PRNG mulberry32 : seed entier → fonction () => flottant [0,1). Pur. */
export function makeRng(seed = 1) {
  let a = (Math.floor(Math.abs(seed)) || 1) >>> 0
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Mélange de Fisher-Yates seedé — ne mute pas le tableau d'entrée. */
export function shuffle(list, seed = 1) {
  const rng = makeRng(seed)
  const out = list.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Construit un plateau de `pairCount` paires mélangées de façon déterministe.
 * Retourne 2×pairCount cartes `{ id, pairId, emoji, label }` où `id` est
 * l'index dans le plateau et `pairId` identifie la paire (0..pairCount-1).
 */
export function buildBoard(pairCount = MEMORY_DEFAULT_PAIRS, seed = 1) {
  const n = Math.max(1, Math.min(Math.floor(pairCount) || 0, MEMORY_MAX_PAIRS))
  // 1) on tire les motifs de la banque (mélange seedé, puis n premiers)
  const picked = shuffle(BINGO_CANTAL, seed).slice(0, n)
  // 2) on double chaque motif, 3) on mélange le tout (seed dérivée)
  const cards = []
  picked.forEach((item, pairId) => {
    cards.push({ pairId, emoji: item.emoji, label: item.label })
    cards.push({ pairId, emoji: item.emoji, label: item.label })
  })
  return shuffle(cards, seed + 1).map((c, id) => ({ id, ...c }))
}

/** True si deux cartes distinctes forment une paire (même motif). */
export function isPair(a, b) {
  if (!a || !b) return false
  if (a.id === b.id) return false
  return a.pairId === b.pairId
}

/** Nombre de paires trouvées à partir de la liste des ids de cartes appariées. */
export function countMatchedPairs(matchedIds = []) {
  return Math.floor(matchedIds.length / 2)
}

/** True si toutes les paires du plateau ont été trouvées. */
export function isBoardComplete(board = [], matchedIds = []) {
  return board.length > 0 && matchedIds.length >= board.length
}

/**
 * Appréciation de la performance : moins de coups = mieux.
 * Le minimum théorique est `pairCount` coups (une paire par coup).
 */
export function memoryRating(moves, pairCount = MEMORY_DEFAULT_PAIRS) {
  if (!pairCount || moves <= 0) return '—'
  if (moves <= pairCount + 1) return '🏆 Mémoire d’éléphant !'
  if (moves <= pairCount * 2) return '🌟 Très fort !'
  if (moves <= pairCount * 3) return '👍 Bien joué !'
  return '🙂 Terminé !'
}

/** Graine aléatoire de partie (hors logique pure : usage UI uniquement). */
export function randomSeed() {
  return Math.floor(Math.random() * 1e9) + 1
}
