// Mode sombre — l'app entière est stylée via des chaînes CSS passées au
// helper s() (ADR-006, pixel-fidélité au design). Plutôt que de réécrire
// des centaines d'appels s('...') avec des couleurs conditionnelles, on
// substitue à l'exécution les quelques couleurs de "surface" (fonds,
// bordures, texte neutre) par leurs équivalents sombres dans la chaîne
// CSS elle-même, avant de la parser. Les couleurs d'accent (verts,
// oranges, couleurs de catégories) restent inchangées — pratique standard
// des thèmes sombres (Material/iOS) : on neutralise les surfaces, pas les
// couleurs de marque.

export const DARK_COLOR_MAP = {
  '#f4ecdc': '#1c1a16', // fond de page (crème clair -> presque noir chaud)
  '#fffdf8': '#242019', // fond des cartes (blanc cassé -> surface sombre)
  '#fffaf0': '#242019', // fond des modales/sheets
  '#f6efe2': '#2a251d', // fond des sheets (variante)
  '#2f2a22': '#f3ecda', // texte principal (brun foncé -> crème clair)
  '#6b6354': '#b8ac96', // texte secondaire / bordures foncées
  '#efe6d4': '#3a352c', // bordures claires
  '#ece2cf': '#3a352c', // bordures claires (variante, barre d'onglets)
  '#d8cbb0': '#4a4436', // bordures d'inputs
  '#e3d8c2': '#3a352c', // bordures claires (variante)
  '#f1e9da': '#332e26', // séparateurs de liste
  '#fbf4e6': '#2c2820', // fond des boutons pointillés "+ Ajouter"
  'rgba(255,253,248,0.97)': 'rgba(28,26,22,0.97)', // barre d'onglets translucide
}

/**
 * Remplace les couleurs de surface connues dans une chaîne CSS par leurs
 * équivalents sombres. Ne touche pas aux couleurs d'accent non listées.
 */
export function applyDarkTheme(css) {
  let out = css
  for (const [light, dark] of Object.entries(DARK_COLOR_MAP)) {
    out = out.split(light).join(dark)
  }
  return out
}
