/* ------------------------------------------------------------------ *
 * Mode « prêté aux enfants » — logique PURE et testable.
 *
 * Quand le téléphone est prêté à un enfant pour jouer (bingo, quiz,
 * mémory, souvenirs), on réduit l'app à une surface sûre :
 *   - seuls quelques onglets et sous-écrans restent atteignables ;
 *   - toutes les actions destructives (suppression, édition, export…)
 *     sont neutralisées via une garde unique `canDestroy`.
 *
 * Le déverrouillage passe par un petit défi arithmétique hors de portée
 * d'un jeune enfant (table de multiplication à deux chiffres). Le tirage
 * est DÉTERMINISTE (PRNG mulberry32 seedé, jamais `Math.random` dans la
 * partie pure) pour être reproductible en test.
 *
 * Aucune dépendance, 100 % hors-ligne. Ce module ne décide de rien tout
 * seul : il expose des prédicats que la navigation et les écrans
 * appellent comme gardes.
 * ------------------------------------------------------------------ */

/**
 * Onglets principaux (valeurs de `tab`) accessibles en mode enfant.
 * `budget` est volontairement absent (modification de dépenses).
 */
export const KIDS_ALLOWED_TABS = ['accueil', 'planning', 'visites', 'repas']

/**
 * Sous-écrans (valeurs de `sub`) accessibles en mode enfant : uniquement
 * les jeux et l'album de souvenirs (consultation).
 * Restent bloqués : reglages, sejours, partage-config, offline-check,
 * imprimer, bilan, trajet, itineraire, carte, carte-detaillee, restos,
 * departure, logistique, hebergement, meteo, badges, recettes.
 */
export const KIDS_ALLOWED_SUBS = ['bingo', 'quiz', 'memory', 'souvenirs']

/** True si l'onglet `tab` est atteignable. Tout est ouvert si non verrouillé. */
export function isTabAllowed(tab, locked) {
  if (!locked) return true
  return KIDS_ALLOWED_TABS.includes(tab)
}

/** True si le sous-écran `sub` est atteignable. Tout est ouvert si non verrouillé. */
export function isSubAllowed(sub, locked) {
  if (!locked) return true
  if (sub == null) return true // fermeture / retour à l'écran parent : toujours permis
  return KIDS_ALLOWED_SUBS.includes(sub)
}

/**
 * Garde unique des actions destructives ou sensibles (suppression,
 * édition, export/import, réinitialisation). `canDestroy(locked) === !locked`.
 */
export function canDestroy(locked) {
  return !locked
}

/** PRNG mulberry32 : seed entier → fonction () => flottant [0,1). Pur. */
function makeRng(seed = 1) {
  let a = (Math.floor(Math.abs(seed)) || 1) >>> 0
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Bornes des facteurs du défi : assez grands pour bloquer un jeune enfant. */
const KIDS_FACTOR_MIN = 6
const KIDS_FACTOR_MAX = 12

/**
 * Construit le défi de déverrouillage à partir d'une graine.
 * Déterministe : la même graine donne toujours le même couple.
 * @returns {{ question: string, answer: number, a: number, b: number }}
 *   ex. `{ question: 'Combien font 7 × 8 ?', answer: 56, a: 7, b: 8 }`
 */
export function makeUnlockChallenge(seed = 1) {
  const rng = makeRng(seed)
  const span = KIDS_FACTOR_MAX - KIDS_FACTOR_MIN + 1
  const a = KIDS_FACTOR_MIN + Math.floor(rng() * span)
  const b = KIDS_FACTOR_MIN + Math.floor(rng() * span)
  return { question: `Combien font ${a} × ${b} ?`, answer: a * b, a, b }
}

/**
 * Vérifie la réponse saisie. Tolérant aux espaces (y compris insécables)
 * autour et à l'intérieur du nombre ; refuse tout ce qui n'est pas un
 * entier exactement égal à la réponse attendue.
 */
export function checkUnlock(challenge, input) {
  if (!challenge || typeof challenge.answer !== 'number') return false
  if (input == null) return false
  const cleaned = String(input).replace(/\s/g, '') // \s couvre aussi l'espace insécable
  if (!/^[+-]?\d+$/.test(cleaned)) return false
  return Number(cleaned) === challenge.answer
}

/** Graine aléatoire de défi (hors logique pure : usage UI uniquement). */
export function randomChallengeSeed() {
  return Math.floor(Math.random() * 1e9) + 1
}
