/* ------------------------------------------------------------------ *
 * Bascule automatique du thème selon l'heure locale.
 *
 * Pourquoi pas `prefers-color-scheme` : Android le pilote au niveau système
 * et beaucoup de téléphones restent en clair toute la journée. En vacances
 * on consulte l'app le soir sous la couette — d'où une bascule propre à
 * l'app, que l'utilisateur peut couper.
 *
 * Tout est PUR ici : la décision ne dépend que de l'heure passée en
 * paramètre, donc elle est testable sans manipuler l'horloge.
 * ------------------------------------------------------------------ */

/** Bornes par défaut : sombre de 21 h à 7 h. */
export const DEFAULT_DARK_FROM = 21
export const DEFAULT_DARK_TO = 7

/**
 * Le thème sombre doit-il être actif à cette heure ?
 * Gère l'intervalle qui enjambe minuit (21 h → 7 h).
 * @param {number} hour  0-23
 */
export function shouldBeDark(hour, from = DEFAULT_DARK_FROM, to = DEFAULT_DARK_TO) {
  const h = Number(hour)
  if (!Number.isInteger(h) || h < 0 || h > 23) return null // heure inexploitable : ne rien décider
  if (from === to) return false
  return from > to
    ? (h >= from || h < to)   // intervalle à cheval sur minuit
    : (h >= from && h < to)   // intervalle dans la journée
}

/**
 * Décide s'il faut changer le thème MAINTENANT.
 *
 * Règle clé : on ne bascule que si l'utilisateur n'a pas repris la main
 * depuis la dernière bascule automatique. Sinon on lui reprendrait son
 * choix dans le dos — le pire comportement possible pour ce genre d'aide.
 *
 * @param {object} p
 * @param {number} p.hour           heure locale (0-23)
 * @param {boolean} p.darkMode      état courant
 * @param {boolean} p.enabled       l'auto-bascule est-elle activée ?
 * @param {boolean} p.userOverride  l'utilisateur a-t-il basculé à la main depuis ?
 * @returns {boolean|null} nouvel état, ou null s'il ne faut rien faire
 */
export function nextThemeDecision({ hour, darkMode, enabled, userOverride = false }) {
  if (!enabled || userOverride) return null
  const target = shouldBeDark(hour)
  if (target === null) return null
  return target === darkMode ? null : target
}
