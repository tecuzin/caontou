/* ------------------------------------------------------------------ *
 * Budget — agrégations pures (testables, sans React ni DOM).
 * Réutilisées par l'écran Budget (barres + donut) et le Bilan.
 * ------------------------------------------------------------------ */

/**
 * Répartition des dépenses par catégorie.
 * @param {Array<{cat:string, amt:number}>} expenses
 * @param {Array<{name:string, color:string}>} cats  ordre & couleurs de référence (CATS)
 * @returns {Array<{name, color, amt, pct}>} catégories non vides, triées par montant décroissant.
 *   `pct` = part du total dépensé (entier, 0–100).
 */
export function budgetByCategory(expenses = [], cats = []) {
  const spent = expenses.reduce((a, e) => a + (e.amt || 0), 0)
  return cats
    .map((c) => {
      const amt = expenses.filter((e) => e.cat === c.name).reduce((sum, e) => sum + (e.amt || 0), 0)
      return { name: c.name, color: c.color, amt, pct: Math.round(spent ? (amt / spent) * 100 : 0) }
    })
    .filter((c) => c.amt > 0)
    .sort((a, b) => b.amt - a.amt)
}

/**
 * Segments d'anneau (donut) pour un rendu SVG maison via `stroke-dasharray`.
 * Chaque segment est proportionnel à son montant (fractions exactes, pas les
 * pourcentages arrondis → l'anneau se referme toujours parfaitement).
 * @param {Array<{name, color, amt}>} cats  (typiquement la sortie de budgetByCategory)
 * @param {number} radius  rayon du cercle SVG (défaut 50)
 * @returns {Array<{name, color, amt, len, offset}>}
 *   `len` = longueur de l'arc, `offset` = décalage cumulé (dashoffset négatif à appliquer),
 *   exprimés dans les mêmes unités que la circonférence (2·π·radius).
 */
export function donutArcs(cats = [], radius = 50) {
  const circ = 2 * Math.PI * radius
  const total = cats.reduce((a, c) => a + (c.amt || 0), 0)
  let acc = 0
  return cats.map((c) => {
    const frac = total ? (c.amt || 0) / total : 0
    const len = frac * circ
    const seg = { name: c.name, color: c.color, amt: c.amt, len, offset: acc }
    acc += len
    return seg
  })
}
