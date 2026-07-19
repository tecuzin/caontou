/**
 * Contrôle « prêt hors-ligne ? », 100 % local. Vérifie que le nécessaire est
 * présent dans le store pour fonctionner sans réseau (fréquent en Carladès) et
 * liste ce qui, au contraire, **exige** une connexion. Module pur, testable.
 */

/**
 * Diagnostics de disponibilité hors-ligne à partir du store.
 * @returns {{ ready: boolean, checks: {key,label,ok,detail}[] }}
 */
export function offlineChecks(store) {
  const s = store || {}
  const len = (a) => (Array.isArray(a) ? a.length : 0)
  const checks = [
    { key: 'store', label: 'Données du séjour enregistrées', ok: !!store && Object.keys(s).length > 0,
      detail: 'Tout est stocké sur l\'appareil (localStorage), sans réseau.' },
    { key: 'visits', label: 'Visites & lieux chargés', ok: len(s.visits) > 0,
      detail: `${len(s.visits)} visite(s) disponibles hors-ligne.` },
    { key: 'planning', label: 'Planning des journées', ok: len(s.days) > 0,
      detail: `${len(s.days)} journée(s) au programme.` },
    { key: 'meals', label: 'Repas & courses', ok: len(s.meals) > 0 || len(s.courses) > 0,
      detail: `${len(s.meals)} repas, ${len(s.courses)} liste(s) de courses.` },
    { key: 'prep', label: 'Préparatifs (valises, checklists)', ok: len(s.logi) > 0,
      detail: `${len(s.logi)} liste(s) de préparatifs.` },
    { key: 'gite', label: 'Coordonnées du gîte & carte simplifiée', ok: !!(s.hebergement || s.visits),
      detail: 'La carte schématique du séjour fonctionne sans réseau.' },
  ]
  return { ready: checks.every((c) => c.ok), checks }
}

/**
 * Fonctionnalités qui **exigent** le réseau (dégradent proprement hors-ligne).
 * Liste stable — les seules exceptions au fonctionnement offline de l'app.
 */
export function networkDependentFeatures() {
  return [
    { key: 'osm', label: 'Carte détaillée (OpenTopoMap)', reason: 'télécharge des tuiles cartographiques en ligne — repli automatique sur la carte simplifiée hors-ligne.' },
    { key: 'share', label: 'Partages (Telegram / WhatsApp, position…)', reason: 'passent par la feuille de partage système et une connexion.' },
  ]
}
