import { TRIP_INITIAL, TRAJETS_INITIAL } from './data.js'

/**
 * Migration system pour cantou.v1 store.
 * Applique les transformations ordonnées au chargement (ensureStoreIsUpToDate).
 */

export const LATEST_SCHEMA = 2

const MIGRATIONS = [
  // v1 → v2 : re-basage Carladès. Les stores créés par les premiers builds
  // ont persisté les anciennes valeurs par défaut (Lyon → Mandailles) qui
  // survivaient à toutes les mises à jour de l'APK (le store local gagne
  // toujours). On remplace UNIQUEMENT les valeurs stales reconnues — les
  // saisies personnelles de l'utilisateur sont conservées.
  {
    from: 1,
    to: 2,
    apply(store) {
      const s = { ...store }
      const staleRe = /lyon|mandailles|jordanne/i
      if (s.trip) {
        const trip = { ...s.trip }
        let touched = false
        if (staleRe.test(trip.origin || '')) { trip.origin = TRIP_INITIAL.origin; touched = true }
        if (staleRe.test(trip.destination || '')) { trip.destination = TRIP_INITIAL.destination; touched = true }
        if (touched && !trip.etape) trip.etape = TRIP_INITIAL.etape
        s.trip = trip
      }
      // Étapes du trajet : si la route mentionne l'ancien itinéraire, on
      // repart de l'itinéraire réel complet (mélanger n'aurait pas de sens).
      const routeText = JSON.stringify(s.trajets ?? s.trajetSteps ?? '')
      if (staleRe.test(routeText)) {
        s.trajets = structuredClone(TRAJETS_INITIAL)
        delete s.trajetSteps
      }
      // Hébergement : l'ancienne fiche « La Grange, Mandailles » (valeurs
      // dupliquées depuis HEB_INITIAL — App.jsx — pour éviter un import circulaire).
      if (s.hebergement && staleRe.test(`${s.hebergement.nom || ''} ${s.hebergement.adresse || ''}`)) {
        s.hebergement = { ...s.hebergement, nom: 'Notre gîte en Carladès', adresse: 'Vezels-Roussy (15130)' }
      }
      return s
    },
  },
]

/**
 * Exécute toutes les migrations nécessaires du schemaVersion courant vers le
 * dernier. Idempotent : un store déjà à jour est retourné tel quel.
 * @param {object} store — le store chargé depuis localStorage
 * @param {number} currentVersion — numéro de schéma du store (par défaut 1)
 * @returns {object} store migré (schemaVersion = LATEST_SCHEMA)
 */
export function applyMigrations(store, currentVersion = 1) {
  let result = { ...store }
  for (const m of MIGRATIONS) {
    if (m.from === currentVersion && m.to <= LATEST_SCHEMA) {
      result = m.apply(result)
      currentVersion = m.to
    }
  }
  result.schemaVersion = LATEST_SCHEMA
  return result
}

/**
 * Valide que le store a un schemaVersion valide.
 */
export function isValidSchema(store) {
  if (!store || typeof store !== 'object') return false
  return store.schemaVersion === undefined || typeof store.schemaVersion === 'number'
}
