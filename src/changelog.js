/**
 * Journal des versions de Cantou — source unique pour « Quoi de neuf ? »
 * (au premier lancement d'un build) et la page Historique.
 * À compléter à CHAQUE livraison (voir skill deploy), du plus récent au plus
 * ancien, avec les nouveautés visibles par la famille.
 */
export const CHANGELOG = [
  { build: 104, version: '1.3.0', date: '2026-07-19', items: [
    '🎉 Version 1.3.0 — assistant de démarrage, multi-séjours et bien plus',
    '🧭 Assistant de configuration au premier lancement (relançable dans Réglages)',
    '🧳 Mes séjours : garde plusieurs séjours et rebascule quand tu veux',
  ] },
  { build: 104, version: '1.3.0', date: '2026-07-19', items: [
    '📸 Album souvenir de fin de séjour, à partager',
    '🌦️ Suggestions d\'activités selon la météo (repli à l\'abri s\'il pleut)',
    '🔳 Partage de la config par QR code entre téléphones, sans réseau',
  ] },
  { build: 104, version: '1.3.0', date: '2026-07-19', items: [
    '➕ « Enregistrer & nouveau » : ajoute plusieurs éléments d\'affilée dans les listes',
    '♿ Accessibilité renforcée des fenêtres (fermeture au clavier, focus)',
  ] },
  { build: 91, version: '1.2.0', date: '2026-07-17', items: [
    '🎉 Version 1.2.0 — deux cartes du séjour et une app entièrement personnalisable',
    '🗺️ Carte détaillée OpenTopoMap (reliefs, sentiers, cols) quand tu as du réseau',
  ] },
  { build: 90, version: '1.2.0', date: '2026-07-17', items: [
    '📦 Tout est personnalisable : jeux, bingo et numéros d\'urgence dans la sauvegarde',
  ] },
  { build: 89, version: '1.2.0', date: '2026-07-17', items: [
    '🎛️ Réglages : active ou masque chaque onglet, module ou carte selon tes envies',
  ] },
  { build: 88, version: '1.2.0', date: '2026-07-16', items: [
    '🗺️ Carte du séjour hors-ligne : le gîte, les visites et la voiture d\'un coup d\'œil',
  ] },
  { build: 86, version: '1.1.0', date: '2026-07-16', items: [
    '🎙️ Journal de bord : dicte le récit du jour à la voix',
  ] },
  { build: 85, version: '1.1.0', date: '2026-07-16', items: [
    '🧾 Budget : attache la photo d\'un reçu à une dépense',
  ] },
  { build: 84, version: '1.1.0', date: '2026-07-14', items: [
    '🚗 Mémo voiture : mémorise où on s\'est garé et laisse-toi guider au retour',
  ] },
  { build: 82, version: '1.1.0', date: '2026-07-13', items: [
    '💸 Budget : partage des dépenses « qui doit combien ? »',
    '⭐ Visites : note tes sorties et garde un souvenir (étoiles + commentaire)',
  ] },
  { build: 80, version: '1.1.0', date: '2026-07-13', items: [
    '📔 Journal de bord quotidien, relié aux Souvenirs',
    '🧭 Itinéraire du jour rangé par proximité · 🔑 checklist de départ du gîte',
    '🎯 Défi du jour pour les enfants',
  ] },
  { build: 68, version: '1.1.0', date: '2026-07-12', items: [
    '🛠️ Fiabilité : logique interne extraite et testée (aucun changement visible)',
  ] },
  { build: 67, version: '1.1.0', date: '2026-07-12', items: [
    '🎉 Version 1.1.0 — grande mise au point qualité (détail dans les builds ci-dessous)',
  ] },
  { build: 66, version: '1.0.0', date: '2026-07-12', items: [
    '♿ Accessibilité améliorée (libellés des champs de formulaire)',
    '🛠️ Fiabilité renforcée (tests bout-en-bout des écrans)',
  ] },
  { build: 65, version: '1.0.0', date: '2026-07-12', items: [
    '⚡ Démarrage plus rapide (écrans chargés à la demande)',
  ] },
  { build: 63, version: '1.0.0', date: '2026-07-12', items: [
    '🛠️ Couverture de tests étendue (moins de bugs)',
  ] },
  { build: 62, version: '1.0.0', date: '2026-07-12', items: [
    '🔔 Plus de demande d\'autorisation notifications au démarrage',
    '🔎 Petites corrections (icône, référencement)',
  ] },
  { build: 61, version: '1.0.0', date: '2026-07-11', items: [
    '🔒 Génération d\'identifiants internes plus sûre',
  ] },
  { build: 60, version: '1.0.0', date: '2026-07-11', items: [
    '🔎 Corrections diverses (bug d\'export corrigé, référencement)',
  ] },
  { build: 59, version: '1.0.0', date: '2026-07-11', items: [
    '📍 « Ma position » : l\'app demande enfin l\'autorisation de localisation',
  ] },
  { build: 58, version: '1.0.0', date: '2026-07-11', items: [
    '📍 « Ma position » corrigé sous Android (géolocalisation native)',
  ] },
  { build: 56, version: '1.0.0', date: '2026-07-11', items: [
    '🗂️ Bouton « Historique des versions » (cette fenêtre)',
  ] },
  { build: 55, version: '1.0.0', date: '2026-07-11', items: [
    '🍴 Carnet de restaurants & réservations (appel + Google Maps en 1 tap)',
    '🆘 Numéros d\'urgence cliquables (112, SAMU, pompiers…)',
    '📍 Bouton « Ma position → Google Maps »',
    '🗳️ Correction du vote familial (le gagnant est désormais bien désigné)',
  ] },
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
