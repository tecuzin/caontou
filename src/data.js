// Mutable data - meals, shopping, planning
// Separated from DEFAULTS to avoid encoding issues

// Parametres du voyage — tout est modifiable dans l'app (modal ⚙️).
// Dates ISO (yyyy-mm-dd) ; etape = halte pour la nuit (aller ET retour).
export const TRIP_INITIAL = {
  start: '2026-08-05',
  end: '2026-08-15',
  origin: 'Beauvais',
  etape: 'Laschamps',
  destination: 'Mandailles (Cantal)',
}

export const MEALS_INITIAL = [
  { id: 1, day: 'Mer 5', dish: 'Etape a Laschamps — resto simple' },
  { id: 2, day: 'Jeu 6', dish: 'Pates au pesto (soir arrivee)' },
  { id: 3, day: 'Ven 7', dish: 'Truffade maison + salade' },
  { id: 4, day: 'Sam 8', dish: 'Poulet roti & legumes' },
  { id: 5, day: 'Dim 9', dish: 'Aligot & saucisse de Cantal' },
  { id: 6, day: 'Lun 10', dish: 'Pizzeria a Murat' },
  { id: 7, day: 'Mar 11', dish: 'Omelette aux cepes' },
  { id: 8, day: 'Mer 12', dish: 'Grillades au jardin' },
  { id: 9, day: 'Jeu 13', dish: 'Soupe au fromage & salade' },
  { id: 10, day: 'Ven 14', dish: 'Etape a Laschamps — resto simple' },
  { id: 11, day: 'Sam 15', dish: 'Retour a la maison' },
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

// Trajet en deux directions, chacune avec ses etapes editables.
// Aller comme retour font halte une nuit a Laschamps (Puy-de-Dome).
// Étapes basées sur l'itinéraire réel (recherché sur Google Maps/ViaMichelin) :
// Beauvais -> Laschamps (Orcines, 63) : 502 km, ~5h35 via A16 puis A71
//   (Orléans, Vierzon, Bourges, Montluçon, Riom).
// Laschamps -> Mandailles-Saint-Julien (15) : 137,7 km, ~2h04 via A75
//   (68,6 km d'autoroute, sortie vers Murat puis routes de vallée).
export const TRAJETS_INITIAL = {
  aller: [
    { time: 'Mer 5 · 08:00', place: 'Depart de Beauvais', note: 'Voiture chargee, c\'est parti !', color: '#5b7042' },
    { time: '10:30', place: 'Pause a Orleans', note: '215 km, via A16 (contournement Paris) puis A10', color: '#4f8a86' },
    { time: '13:00', place: 'Pause dejeuner a Bourges', note: '~350 km, via A71', color: '#cf7d3c' },
    { time: '17:00', place: 'Arrivee a Laschamps', note: '502 km au total (~5h35 de route + pauses) - etape pour la nuit (Orcines, Puy-de-Dome)', color: '#9c6b4a' },
    { time: 'Jeu 6 · 09:30', place: 'Depart de Laschamps', note: 'Cap au sud par l\'A75, volcans en vue', color: '#5b7042' },
    { time: '11:00', place: 'Pause a Murat', note: 'Sortie A75, derniere etape avant les vallees du Cantal', color: '#8a8b3d' },
    { time: '12:30', place: 'Arrivee a Mandailles', note: '137,7 km depuis Laschamps (~2h04 de route) - installation au gite', color: '#b8503f' },
  ],
  retour: [
    { time: 'Ven 14 · 09:30', place: 'Depart de Mandailles', note: 'Check-out du gite', color: '#9c6b4a' },
    { time: '11:00', place: 'Pause a Murat', note: '', color: '#8a8b3d' },
    { time: '12:30', place: 'Arrivee a Laschamps', note: '137,7 km, etape pour la nuit', color: '#5b7042' },
    { time: 'Sam 15 · 09:00', place: 'Depart de Laschamps', note: 'Retour par l\'A71 puis A16', color: '#5b7042' },
    { time: '12:30', place: 'Pause dejeuner a Bourges', note: '~150 km', color: '#cf7d3c' },
    { time: '15:00', place: 'Pause a Orleans', note: '~285 km', color: '#4f8a86' },
    { time: '17:30', place: 'Arrivee a Beauvais', note: '502 km au total - des souvenirs plein la tete 💛', color: '#4f8a86' },
  ],
}

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
  { d: 'Mer', n: 5, icon: '☀️', hi: 26, lo: 14, rain: '5 %' },
  { d: 'Jeu', n: 6, icon: '⛅', hi: 24, lo: 13, rain: '15 %' },
  { d: 'Ven', n: 7, icon: '☀️', hi: 25, lo: 13, rain: '10 %' },
  { d: 'Sam', n: 8, icon: '⛅', hi: 23, lo: 12, rain: '20 %' },
  { d: 'Dim', n: 9, icon: '🌧️', hi: 18, lo: 10, rain: '70 %' },
  { d: 'Lun', n: 10, icon: '⛅', hi: 21, lo: 11, rain: '30 %' },
  { d: 'Mar', n: 11, icon: '☀️', hi: 24, lo: 12, rain: '5 %' },
  { d: 'Mer', n: 12, icon: '☀️', hi: 26, lo: 14, rain: '5 %' },
  { d: 'Jeu', n: 13, icon: '⛅', hi: 23, lo: 12, rain: '25 %' },
  { d: 'Ven', n: 14, icon: '☀️', hi: 25, lo: 13, rain: '10 %' },
  { d: 'Sam', n: 15, icon: '⛅', hi: 24, lo: 13, rain: '15 %' },
]
