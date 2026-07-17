/**
 * Catalogue des fonctionnalités désactivables. Chaque entrée porte une clé
 * stable (persistée dans le store sous `features`), un libellé et un groupe
 * d'affichage pour l'écran Réglages. Tout est **activé par défaut** : une clé
 * absente ou différente de `false` est considérée « on » (rétro-compat totale
 * avec les stores existants, aucune migration nécessaire).
 *
 * Conventions de clés :
 *  - `tab_*`   : onglet principal de la barre du bas.
 *  - `mod_*`   : module/sous-écran ouvert depuis les tuiles de l'Accueil.
 *  - `extra_*` : carte/bloc optionnel de l'Accueil.
 */
export const FEATURE_GROUPS = [
  {
    group: 'Onglets',
    items: [
      { key: 'tab_planning', label: 'Planning' },
      { key: 'tab_visites', label: 'À faire (visites)' },
      { key: 'tab_repas', label: 'Repas' },
      { key: 'tab_budget', label: 'Budget' },
    ],
  },
  {
    group: 'Modules',
    items: [
      { key: 'mod_trajet', label: 'Trajet' },
      { key: 'mod_hebergement', label: 'Hébergement' },
      { key: 'mod_logistique', label: 'Préparatifs' },
      { key: 'mod_meteo', label: 'Météo' },
      { key: 'mod_souvenirs', label: 'Souvenirs' },
      { key: 'mod_restos', label: 'Restos' },
      { key: 'mod_departure', label: 'Départ du gîte' },
      { key: 'mod_itineraire', label: 'Itinéraire' },
      { key: 'mod_carte', label: 'Carte du séjour' },
    ],
  },
  {
    group: 'Extras',
    items: [
      { key: 'extra_challenge', label: 'Défi du jour' },
      { key: 'extra_carspot', label: 'Mémo voiture' },
      { key: 'extra_vote', label: 'Vote familial' },
      { key: 'extra_weather_suggestions', label: 'Suggestions météo' },
    ],
  },
]

/** Toutes les clés connues, à plat. */
export const FEATURE_KEYS = FEATURE_GROUPS.flatMap((g) => g.items.map((i) => i.key))

/** Table clé → libellé (pour affichages ponctuels). */
export const FEATURE_LABELS = Object.fromEntries(
  FEATURE_GROUPS.flatMap((g) => g.items.map((i) => [i.key, i.label])),
)

/** Une fonctionnalité est active sauf si explicitement mise à false. */
export function isFeatureOn(features, key) {
  return !features || features[key] !== false
}

/** Mappe l'action d'une tuile Accueil (`sub:xxx` / `tab:xxx`) vers sa clé feature. */
export function featureKeyForAction(action) {
  if (typeof action !== 'string') return null
  if (action.startsWith('tab:')) return `tab_${action.slice(4)}`
  if (action.startsWith('sub:')) return `mod_${action.slice(4)}`
  return null
}
