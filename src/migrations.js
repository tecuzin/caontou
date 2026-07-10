/**
 * Migration system pour cantou.v1 store.
 * Applique les transformations ordonnées au chargement.
 */

const MIGRATIONS = [
  // Migration 1 → 2 : exemple (non opérationnel pour le moment)
  // {
  //   from: 1,
  //   to: 2,
  //   apply: (store) => {
  //     // ex: renommer trajetSteps → trajets.aller/retour
  //     return store
  //   }
  // }
]

/**
 * Exécute toutes les migrations nécessaires du schémaVersion courant vers le dernier.
 * @param {object} store — le store chargé depuis localStorage
 * @param {number} currentVersion — numéro de schéma du store (par défaut 1)
 * @returns {object} store migré
 */
export function applyMigrations(store, currentVersion = 1) {
  const LATEST = 1
  let result = { ...store }

  if (result.saved) {
    result = { ...result.saved, ...result }
    delete result.saved
  }

  for (const m of MIGRATIONS) {
    if (m.from === currentVersion && m.to <= LATEST) {
      result = m.apply(result)
      currentVersion = m.to
    }
  }
  result.schemaVersion = LATEST
  return result
}

/**
 * Valide que le store a un schemaVersion valide.
 */
export function isValidSchema(store) {
  if (!store || typeof store !== 'object') return false
  return store.schemaVersion === undefined || typeof store.schemaVersion === 'number'
}
