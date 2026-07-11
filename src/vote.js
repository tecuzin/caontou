/**
 * Vote familial « on fait quoi demain ? » — helpers purs (testables sans UI).
 * Un vote = liste de clés de candidat (une par votant). Le dépouillement rend
 * les compteurs et le(s) gagnant(s) ex æquo ; le tirage final est au choix de
 * l'appelant (pickWinner).
 */

/** Dépouille les votes. @returns {{ counts: Record<string,number>, winners: string[] }} */
export function tallyVotes(votes) {
  const counts = {}
  votes.forEach((v) => { if (v != null) counts[v] = (counts[v] || 0) + 1 })
  const max = Object.values(counts).reduce((m, n) => Math.max(m, n), 0)
  const winners = Object.keys(counts).filter((k) => counts[k] === max)
  return { counts, winners }
}

/**
 * Désigne un gagnant à partir des votes. En cas d'égalité, tranche au hasard
 * (rng injectable pour les tests). Retourne la valeur d'origine du vote (type
 * préservé : un id numérique reste un nombre, pas la clé string de tallyVotes)
 * — sinon un `visits.find(v => v.id === winner)` échouerait (1 !== "1").
 * Retourne null si aucun vote exprimé.
 */
export function pickWinner(votes, rng = Math.random) {
  const { winners } = tallyVotes(votes)
  if (!winners.length) return null
  const winKey = winners[Math.floor(rng() * winners.length)]
  return votes.find((v) => String(v) === winKey) ?? winKey
}
