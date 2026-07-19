/**
 * Jeux de route (trajet Beauvais → Carladès), 100 % hors-ligne. Contenu par
 * défaut éditable côté store (personnalisable, donc exporté en JSON). Module
 * pur et testable — pas d'état ici, juste les données et des sélecteurs.
 */

/** Départements plausibles sur l'itinéraire (jeu « repère la plaque »). */
export const ROUTE_DEPARTMENTS = [
  { code: '60', name: 'Oise' },
  { code: '95', name: "Val-d'Oise" },
  { code: '75', name: 'Paris' },
  { code: '45', name: 'Loiret' },
  { code: '18', name: 'Cher' },
  { code: '03', name: 'Allier' },
  { code: '63', name: 'Puy-de-Dôme' },
  { code: '43', name: 'Haute-Loire' },
  { code: '15', name: 'Cantal' },
  { code: '12', name: 'Aveyron' },
  { code: '19', name: 'Corrèze' },
  { code: '48', name: 'Lozère' },
]

/** Prompts pour « Je vois quelque chose de… » (couleurs + objets nature). */
export const ISPY_PROMPTS = [
  '🔴 rouge', '🟢 vert', '🔵 bleu', '🟡 jaune', '🟠 orange', '⚪ blanc', '⚫ noir', '🟤 marron',
  '🐄 une vache', '🚜 un tracteur', '🌳 un arbre isolé', '⛪ un clocher', '🏔️ une montagne',
  '🌉 un pont', '🐑 un mouton', '🚚 un camion',
]

/**
 * Choisit un prompt « Je vois… » différent du précédent, de façon déterministe
 * à partir d'une graine (index ou timestamp) — testable sans aléatoire réel.
 */
export function pickISpy(seed = 0, prev = null, prompts = ISPY_PROMPTS) {
  if (!prompts.length) return null
  let idx = Math.abs(Math.floor(seed)) % prompts.length
  if (prompts[idx] === prev && prompts.length > 1) idx = (idx + 1) % prompts.length
  return prompts[idx]
}

/** Compteur { done, total } de plaques repérées (map `{ [code]: true }`). */
export function plateProgress(spotted = {}, departments = ROUTE_DEPARTMENTS) {
  const done = departments.filter((d) => spotted[d.code]).length
  return { done, total: departments.length }
}
