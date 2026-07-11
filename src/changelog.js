/**
 * Journal des versions de Cantou — source unique pour « Quoi de neuf ? »
 * (au premier lancement d'un build) et la page Historique.
 * À compléter à CHAQUE livraison (voir skill deploy), du plus récent au plus
 * ancien, avec les nouveautés visibles par la famille.
 */
export const CHANGELOG = [
  { build: 54, version: '1.0.0', date: '2026-07-11', items: [
    '🔍 Bingo d\'observation du Cantal pour les enfants',
    '📊 Bilan de fin de séjour, à partager',
    '🆕 Cet écran « Quoi de neuf ? » + l\'historique des versions',
  ] },
  { build: 52, version: '1.0.0', date: '2026-07-11', items: [
    '🗳️ Vote familial « on fait quoi demain ? »',
    '🌅 Brief du matin (météo + activité + repas) en notification',
  ] },
  { build: 51, version: '1.0.0', date: '2026-07-11', items: [
    '📤 Partager toutes les photos d\'une journée d\'un coup',
    '📷 Bouton photo rapide sur l\'accueil',
  ] },
  { build: 50, version: '1.0.0', date: '2026-07-10', items: [
    '📸 Galerie photo du séjour, rangée par journée',
    '📔 Journal de bord (un souvenir par jour)',
    '🎉 Mode « jour du départ » avec confetti',
    '🐄 Compteur de vaches pour la route',
    '📅 Partager une sortie dans le calendrier des proches',
  ] },
]

/** Entrées livrées APRÈS le build vu (strictement > lastSeen), plus récentes d'abord. */
export function entriesSince(lastSeen) {
  const seen = Number(lastSeen) || 0
  return CHANGELOG.filter((e) => e.build > seen)
}
