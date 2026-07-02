// Mutable data - meals, shopping, planning
// Separated from DEFAULTS to avoid encoding issues

export const MEALS_INITIAL = [
  { id: 1, day: 'Sam 11', dish: 'Pates au pesto (soir arrivee)' },
  { id: 2, day: 'Dim 12', dish: 'Truffade maison + salade' },
  { id: 3, day: 'Lun 13', dish: 'Poulet roti & legumes' },
  { id: 4, day: 'Mar 14', dish: 'Aligot & saucisse de Cantal' },
  { id: 5, day: 'Mer 15', dish: 'Pizzeria a Murat' },
  { id: 6, day: 'Jeu 16', dish: 'Omelette aux cepes' },
  { id: 7, day: 'Ven 17', dish: 'Grillades au jardin' },
]

export const SHOPPING_INITIAL = {
  co_frais: { 'Lait': true, 'Oeufs (x12)': true },
  co_epic: { 'Cafe': true },
  co_fl: {},
  co_enf: { 'Compotes a boire': true },
  co_autre: { 'Pain': true },
}

export const PLANNING_INITIAL = []

// Shopping items stored as flat list with category + checked state
export const SHOPPING_ITEMS_INITIAL = [
  { id: 1, cat: 'co_frais', label: 'Lait', checked: true },
  { id: 2, cat: 'co_frais', label: 'Oeufs (x12)', checked: true },
  { id: 3, cat: 'co_epic', label: 'Cafe', checked: true },
  { id: 4, cat: 'co_enf', label: 'Compotes a boire', checked: true },
  { id: 5, cat: 'co_autre', label: 'Pain', checked: true },
]

// Planning activities stored as flat list with day index, time, title
export const PLANNING_ACTIVITIES_INITIAL = []

// Logistics lists for packing
export const LOGI_INITIAL = [
  { key: 've', name: 'Valise enfants', emoji: '🧒', items: ['Bodies & sous-vetements', 'Pulls chauds (montagne !)', 'K-way / impermeabilisé', 'Bottes & baskets', 'Chapeaux & creme solaire', 'Doudous & jouets', 'Medicaments habituels'] },
  { key: 'va', name: 'Valise adultes', emoji: '🎒', items: ['Vetements chauds', 'Chaussures de rando', 'Maillots de bain', 'Trousse de toilette', 'Chargeurs & batteries', 'Sac a dos de rando'] },
  { key: 'ph', name: 'Pharmacie', emoji: '🩹', items: ['Paracetamol adulte', 'Doliprane enfant', 'Pansements', 'Creme solaire', 'Anti-moustique', 'Tire-tique', 'Desinfectant'] },
  { key: 'vo', name: 'Voiture', emoji: '🚗', items: ['Sieges auto', 'Gilets & triangle', 'Plaid & oreillers', 'Jeux de voiture', 'En-cas & eau'] },
  { key: 'ma', name: 'Maison (avant depart)', emoji: '🏠', items: ['Couper l\'eau & le gaz', 'Sortir les poubelles', 'Fermer les volets', 'Prevenir les voisins', 'Vider le frigo', 'Arroser les plantes'] },
]

export const COURSES_INITIAL = [
  { key: 'co_frais', name: 'Frais', items: ['Lait', 'Oeufs (x12)', 'Beurre', 'Cantal AOP', 'Saint-Nectaire', 'Yaourts enfants', 'Jambon'] },
  { key: 'co_epic', name: 'Epicerie', items: ['Pates', 'Riz', 'Pesto', 'Huile d\'olive', 'Cafe', 'Cereales', 'Chocolat'] },
  { key: 'co_fl', name: 'Fruits & legumes', items: ['Pommes de terre (aligot)', 'Salade', 'Tomates', 'Pommes', 'Bananes', 'Oignons'] },
  { key: 'co_enf', name: 'Pour les enfants', items: ['Compotes a boire', 'Petits gateau', 'Jus de fruits', 'Sirop'] },
  { key: 'co_autre', name: 'Autres', items: ['Pain', 'Eau (pack)', 'Sacs poubelle', 'Charbon BBQ', 'Essuie-tout'] },
]

export const TRAJET_STEPS_INITIAL = [
  { time: '08:30', place: 'Lyon', note: 'Depart, voiture chargee', color: '#5b7042' },
  { time: '10:00', place: 'Thiers', note: 'Pause cafe & toilettes', color: '#cf7d3c' },
  { time: '11:15', place: 'Massiac (A75)', note: 'On quitte l\'autoroute', color: '#4f8a86' },
  { time: '12:30', place: 'Murat', note: 'Pique-nique & jambes', color: '#8a8b3d' },
  { time: '13:30', place: 'Mandailles', note: 'Arrivee au gite', color: '#b8503f' },
]

export const VISITS_INITIAL = [
  { id: 1, emoji: '⛰️', name: 'Puy Mary — Pas de Peyrol', cat: 'Nature', dist: '25 min', dur: '2 h', age: 'Des 4 ans (porte-bebe)' },
  { id: 2, emoji: '💧', name: 'Cascade du Faillitoux', cat: 'Nature', dist: '10 min', dur: '1 h', age: 'Poussette non' },
  { id: 3, emoji: '🐄', name: 'Ferme pedagogique des burons', cat: 'Famille', dist: '15 min', dur: '2 h', age: 'Tous ages' },
  { id: 4, emoji: '🌋', name: 'Maison des Volcans, Aurillac', cat: 'Patrimoine', dist: '40 min', dur: '1 h 30', age: 'Des 3 ans' },
  { id: 5, emoji: '🚂', name: 'Gentiane Express', cat: 'Famille', dist: '35 min', dur: '3 h', age: 'Tous ages' },
  { id: 6, emoji: '🧺', name: 'Marche de Salers', cat: 'Marche', dist: '30 min', dur: '1 h', age: 'Tous ages' },
  { id: 7, emoji: '🏊', name: 'Lac de Saint-Etienne-Cantalès', cat: 'Baignade', dist: '45 min', dur: '½ journee', age: 'Tous ages' },
  { id: 8, emoji: '🏘️', name: 'Village de Salers', cat: 'Patrimoine', dist: '30 min', dur: '2 h', age: 'Poussette ok' },
  { id: 9, emoji: '🧀', name: 'Buronnerie & degustation Cantal', cat: 'Gourmand', dist: '20 min', dur: '1 h', age: 'Tous ages' },
]

export const METEO_INITIAL = [
  { d: 'Sam', n: 11, icon: '☀️', hi: 24, lo: 12, rain: '10 %' },
  { d: 'Dim', n: 12, icon: '⛅', hi: 22, lo: 11, rain: '20 %' },
  { d: 'Lun', n: 13, icon: '🌧️', hi: 17, lo: 9, rain: '80 %' },
  { d: 'Mar', n: 14, icon: '☀️', hi: 23, lo: 12, rain: '5 %' },
  { d: 'Mer', n: 15, icon: '⛅', hi: 21, lo: 11, rain: '30 %' },
  { d: 'Jeu', n: 16, icon: '⛅', hi: 20, lo: 10, rain: '40 %' },
  { d: 'Ven', n: 17, icon: '☀️', hi: 25, lo: 13, rain: '5 %' },
]
