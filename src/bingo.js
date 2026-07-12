/**
 * Bingo d'observation — helpers purs pour une grille 4×4 (indices 0..15).
 * Une « ligne » gagnante = une rangée, une colonne ou une diagonale complète.
 */

// Les 10 lignes gagnantes d'une grille 4×4 (4 rangées, 4 colonnes, 2 diagonales).
export const BINGO_LINES = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // rangées
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // colonnes
  [0, 5, 10, 15], [3, 6, 9, 12], // diagonales
]

/** True si toutes les cases d'une ligne sont cochées. `checked` = objet {idx:true}. */
export function isLineComplete(line, checked) {
  return line.every((i) => checked[i])
}

/** Nombre de lignes complètes dans la grille. */
export function countCompletedLines(checked) {
  return BINGO_LINES.reduce((n, line) => n + (isLineComplete(line, checked) ? 1 : 0), 0)
}

/** True si toute la grille (16 cases) est cochée. */
export function isFullHouse(checked, size = 16) {
  let n = 0
  for (let i = 0; i < size; i++) if (checked[i]) n++
  return n === size
}
