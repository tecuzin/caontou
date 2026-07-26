/**
 * Bingo d'observation — helpers purs pour une grille 4×4 (indices 0..15).
 * Une « ligne » gagnante = une rangée, une colonne ou une diagonale complète.
 *
 * Progression **par enfant** depuis le schéma 5 : le store contient
 * `bingo: { [prénom]: { [index]: true } }`. Toutes les fonctions acceptent un
 * paramètre `child` OPTIONNEL ; sans lui (ou avec une chaîne vide) on retombe
 * sur la clé de repli `FAMILY_KEY` (« Famille »), qui porte aussi toute la
 * progression historique migrée. Une grille plate héritée `{0:true}` reste
 * acceptée telle quelle. Voir `progress.js`.
 */
import { childProgress, setChildEntry, toggleChildEntry, FAMILY_KEY } from './progress.js'

export { FAMILY_KEY }

// Les 10 lignes gagnantes d'une grille 4×4 (4 rangées, 4 colonnes, 2 diagonales).
export const BINGO_LINES = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // rangées
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // colonnes
  [0, 5, 10, 15], [3, 6, 9, 12], // diagonales
]

/**
 * Grille plate `{idx:true}` d'un enfant. `checked` peut être la grille plate
 * héritée ou le store par enfant ; `child` est optionnel (repli « Famille »).
 */
export function bingoGrid(checked, child) {
  return childProgress(checked, child)
}

/** True si toutes les cases d'une ligne sont cochées. */
export function isLineComplete(line, checked, child) {
  const grid = bingoGrid(checked, child)
  return line.every((i) => grid[i])
}

/** Nombre de lignes complètes dans la grille de l'enfant. */
export function countCompletedLines(checked, child) {
  const grid = bingoGrid(checked, child)
  return BINGO_LINES.reduce((n, line) => n + (line.every((i) => grid[i]) ? 1 : 0), 0)
}

/** True si toute la grille (16 cases) est cochée pour l'enfant. */
export function isFullHouse(checked, child, size = 16) {
  const grid = bingoGrid(checked, child)
  let n = 0
  for (let i = 0; i < size; i++) if (grid[i]) n++
  return n === size
}

/** Nombre de cases cochées par l'enfant. */
export function countChecked(checked, child) {
  return Object.values(bingoGrid(checked, child)).filter(Boolean).length
}

/** Coche/décoche une case pour un enfant → nouveau store par enfant. */
export function toggleBingoCell(checked, idx, child) {
  return toggleChildEntry(checked, child, idx)
}

/** Force l'état d'une case pour un enfant → nouveau store par enfant. */
export function setBingoCell(checked, idx, value, child) {
  return setChildEntry(checked, child, idx, value)
}
