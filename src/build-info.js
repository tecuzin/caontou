// Numéro de build courant, injecté par Vite (define __BUILD_NUMBER__).
// Garde `typeof` pour ne jamais lever de ReferenceError si non défini.
export const BUILD_NUMBER = typeof __BUILD_NUMBER__ !== 'undefined' ? __BUILD_NUMBER__ : 0
