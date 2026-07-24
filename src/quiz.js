/* ------------------------------------------------------------------ *
 * Quiz « Sais-tu ça sur le Carladès ? » — carnet de questions/réponses
 * locales pour enfants. Contenu factuel statique (100 % hors-ligne).
 * Faits recoupés (Cantal Destination / offices de tourisme / géographie
 * générale du Cantal). Mécanique flashcard : question → révéler la réponse.
 * ------------------------------------------------------------------ */

export const QUIZ_QUESTIONS = [
  { q: 'Quel est le point culminant du Cantal, visible depuis Le Lioran ?', a: 'Le Plomb du Cantal (1 855 m).' },
  { q: 'Le Cantal est en réalité un ancien… quoi ?', a: 'Un volcan — le plus grand stratovolcan d’Europe.' },
  { q: 'Quel est le numéro du département du Cantal ?', a: 'Le 15.' },
  { q: 'Quelle ville est la préfecture du Cantal ?', a: 'Aurillac.' },
  { q: 'Quel plat mélange purée de pomme de terre et tome fraîche ?', a: 'L’aligot.' },
  { q: 'Cite un fromage AOP fabriqué dans le Cantal.', a: 'Le Cantal (ou Salers, ou Saint-Nectaire, ou Bleu d’Auvergne).' },
  { q: 'Comment s’appelle la petite cabane où l’on faisait le fromage en montagne ?', a: 'Un buron.' },
  { q: 'De quelle fleur jaune de montagne fait-on une boisson apéritive ?', a: 'La gentiane.' },
  { q: 'Quelle forme a le sommet du rocher de Ronesque ?', a: 'Une table (plateau basaltique) avec un panorama à 360°.' },
  { q: 'Comment s’appelle la station de ski au cœur du Cantal ?', a: 'Le Lioran.' },
  { q: 'Le château de Messilhac est de quel style ?', a: 'Renaissance.' },
  { q: 'Quel grand site en forme de pyramide domine le nord du Cantal ?', a: 'Le Puy Mary (Grand Site de France).' },
]

/** Pourcentage de bonnes réponses (entier 0–100). Pur & testable. */
export function quizScorePct(good, total = QUIZ_QUESTIONS.length) {
  if (!total) return 0
  return Math.round((Math.max(0, Math.min(good, total)) / total) * 100)
}
