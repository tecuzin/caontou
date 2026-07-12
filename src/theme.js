// Mode sombre — l'app entière est stylée via des chaînes CSS passées au
// helper s() (ADR-006, pixel-fidélité au design). Plutôt que de réécrire
// des centaines d'appels s('...') avec des couleurs conditionnelles, on
// substitue à l'exécution les quelques couleurs de "surface" (fonds,
// bordures, texte neutre) par leurs équivalents sombres dans la chaîne
// CSS elle-même, avant de la parser. Palette "bleu nuit étoilée" plutôt
// qu'un noir neutre.

export const DARK_COLOR_MAP = {
  '#f4ecdc': '#10162b', // fond de page (crème clair -> bleu nuit)
  '#fffdf8': '#1a2140', // fond des cartes (blanc cassé -> surface bleu nuit)
  '#f6efe2': '#1c2444', // fond des sheets (variante)
  // NB : #fffaf0 n'est PAS mappé ici — dans ce codebase il n'est jamais
  // utilisé comme fond (0 occurrence `background:#fffaf0`), uniquement comme
  // texte blanc sur bouton/onglet actif coloré (`background:#4a5d3a;
  // color:#fffaf0`). Le remplacer aveuglément rendait ce texte illisible
  // (texte bleu nuit sur fond vert bleu nuit) sur des dizaines de boutons —
  // c'était le bug principal derrière « textes sombres illisibles ».
  '#2f2a22': '#f3ecda', // texte principal (brun foncé -> crème clair)
  '#6b6354': '#b8ac96', // texte secondaire / bordures foncées
  '#efe6d4': '#2a3358', // bordures claires
  '#ece2cf': '#2a3358', // bordures claires (variante, barre d'onglets)
  '#d8cbb0': '#384068', // bordures d'inputs
  '#e3d8c2': '#2a3358', // bordures claires (variante)
  '#f1e9da': '#242c50', // séparateurs de liste
  '#fbf4e6': '#182038', // fond des boutons pointillés "+ Ajouter"
  'rgba(255,253,248,0.97)': 'rgba(16,22,43,0.95)', // barre d'onglets translucide
  // Fonds de cartes/modules teintés (accueil : hébergement, trajet, budget,
  // météo, encarts info) — non couverts par les entrées ci-dessus, sinon ils
  // restent des pastilles claires flottant sur le fond sombre.
  '#e7ecdf': '#1c2444',
  '#f1e4d4': '#1c2444',
  '#eee7d4': '#1c2444',
  '#f3ece0': '#1c2444',
  '#dfeae6': '#1c2444',
  '#e6ece0': '#1c2444',
}

/**
 * Couleurs d'accent utilisées comme TEXTE (icônes, libellés, boutons) —
 * distinctes de DARK_COLOR_MAP : ces mêmes teintes servent aussi de
 * couleurs de marqueur/catégorie (pastille trajet, sélecteur de couleur
 * d'activité) où elles doivent rester fidèles à leur valeur d'origine.
 * On ne les éclaircit donc que lorsqu'elles apparaissent après `color:`
 * (jamais `background:`/`border-color:`) — sinon un vert foncé lisible sur
 * fond clair devient illisible une fois le fond de carte passé en bleu nuit.
 */
export const DARK_TEXT_COLOR_MAP = {
  '#4a5d3a': '#a7d08a', // vert foncé -> vert clair
  '#9c6b4a': '#e2a97a', // brun -> brun clair
  '#b8503f': '#f0876c', // rouille -> corail clair
  '#cf7d3c': '#f5b06e', // orange -> orange clair
  '#9a917f': '#cbc2ae', // gris-brun neutre -> plus clair
  '#6b5a45': '#c9a883', // brun texte (encarts info) -> brun clair
  // Couleurs de catégorie VCAT (écran Visites) utilisées comme TEXTE du libellé
  // de catégorie : sombres sur fond clair, elles devenaient illisibles sur les
  // cartes bleu nuit (ratios 2.9–4.4 < AA). Éclaircies uniquement en tant que
  // texte ; la pastille (background) garde la couleur d'origine.
  '#5b7042': '#9fce82', // Nature -> vert clair
  '#4f8a86': '#79c3bd', // Baignade -> turquoise clair
  '#8a8b3d': '#c6c76b', // Marché -> olive clair
  '#4a6d9c': '#93b4e0', // Sport -> bleu clair
}

/**
 * Remplace les couleurs de surface connues dans une chaîne CSS par leurs
 * équivalents sombres, puis les couleurs de texte d'accent (uniquement
 * lorsqu'elles suivent `color:`). Ne touche pas aux couleurs d'accent
 * utilisées comme fond/bordure/marqueur.
 */
// Cache chaîne claire → chaîne sombre : ~40 split/join par appel sur des
// chaînes stables, appelé pour chaque élément à chaque render en mode sombre.
// Même stratégie de borne que le cache de s() (utils.js).
const DARK_CACHE = new Map()

export function applyDarkTheme(css) {
  const hit = DARK_CACHE.get(css)
  if (hit !== undefined) return hit
  let out = css
  for (const [light, dark] of Object.entries(DARK_COLOR_MAP)) {
    out = out.split(light).join(dark)
  }
  for (const [light, dark] of Object.entries(DARK_TEXT_COLOR_MAP)) {
    out = out.split(`color:${light}`).join(`color:${dark}`)
  }
  if (DARK_CACHE.size > 4000) DARK_CACHE.clear()
  DARK_CACHE.set(css, out)
  return out
}

/**
 * Fond étoilé subtil (mode sombre uniquement) — quelques pastilles
 * translucides positionnées en radial-gradient, à ajouter en backgroundImage
 * sur le conteneur racine en plus de sx() (qui ne gère qu'une seule couleur
 * de fond à la fois).
 */
export const STARRY_BACKGROUND_IMAGE = [
  'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6) 1px, transparent 0)',
  'radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.5) 1px, transparent 0)',
  'radial-gradient(1.5px 1.5px at 40% 75%, rgba(255,255,255,0.5) 1px, transparent 0)',
  'radial-gradient(1px 1px at 85% 65%, rgba(255,255,255,0.4) 1px, transparent 0)',
  'radial-gradient(1px 1px at 10% 88%, rgba(255,255,255,0.4) 1px, transparent 0)',
  'radial-gradient(1.5px 1.5px at 60% 45%, rgba(255,255,255,0.35) 1px, transparent 0)',
  'radial-gradient(1px 1px at 92% 12%, rgba(255,255,255,0.4) 1px, transparent 0)',
].join(', ')
