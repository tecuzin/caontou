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

// Planning par défaut : 11 jours (5 → 15 août), étape à Laschamps à
// l'aller (nuit du 5) comme au retour (nuit du 14).
export const DAYS_INITIAL = [
  { dow: 'Mer', num: 5, title: 'Le grand départ', sub: 'Beauvais → Laschamps', items: [
    { time: '09:00', title: 'Départ de Beauvais', note: 'Voiture chargée, c\'est parti !', color: '#5b7042' },
    { time: '12:30', title: 'Pique-nique en route', note: 'Se dégourdir les jambes', color: '#4f8a86' },
    { time: '16:00', title: 'Arrivée à Laschamps', note: 'Étape pour la nuit', color: '#9c6b4a' },
    { time: '19:30', title: 'Dîner tranquille', note: 'Tout le monde au lit tôt', color: '#b8503f' },
  ] },
  { dow: 'Jeu', num: 6, title: 'Cap sur le Cantal', sub: 'Laschamps → Mandailles', items: [
    { time: '09:30', title: 'Départ de Laschamps', note: 'Volcans en vue', color: '#5b7042' },
    { time: '11:00', title: 'Pause à Murat', note: 'Café & jambes', color: '#cf7d3c' },
    { time: '13:00', title: 'Arrivée au gîte', note: 'Installation & goûter', color: '#9c6b4a' },
    { time: '16:00', title: 'Courses à Aurillac', note: 'Premier ravitaillement', color: '#8a8b3d' },
    { time: '19:30', title: 'Dîner au coin du cantou', note: 'Pâtes au pesto', color: '#b8503f' },
  ] },
  { dow: 'Ven', num: 7, title: 'Mise en jambes', sub: 'Vallée de Mandailles', items: [
    { time: '09:30', title: 'Petit-déj tranquille', note: 'On prend le temps', color: '#cf7d3c' },
    { time: '10:30', title: 'Cascade du Faillitoux', note: 'Balade facile (1 h)', color: '#5b7042' },
    { time: '12:30', title: 'Pique-nique au bord de l\'eau', note: '', color: '#4f8a86' },
    { time: '15:00', title: 'Sieste & jeux au jardin', note: '', color: '#9c6b4a' },
    { time: '18:00', title: 'Marché de producteurs', note: 'Fromages & charcuterie', color: '#8a8b3d' },
  ] },
  { dow: 'Sam', num: 8, title: 'Ascension du Puy Mary', sub: 'Pas de Peyrol', items: [
    { time: '08:30', title: 'Départ tôt', note: 'Avant la chaleur', color: '#5b7042' },
    { time: '09:30', title: 'Parking Pas de Peyrol', note: '1 589 m', color: '#9c6b4a' },
    { time: '10:00', title: 'Montée au sommet', note: 'Porte-bébé conseillé', color: '#5b7042' },
    { time: '12:30', title: 'Pique-nique panorama', note: 'Vue à 360° 🏔️', color: '#4f8a86' },
    { time: '15:00', title: 'Glace à Dienne', note: 'Récompense méritée', color: '#b8503f' },
  ] },
  { dow: 'Dim', num: 9, title: 'Fermes & fromages', sub: 'Autour de Salers', items: [
    { time: '10:00', title: 'Ferme pédagogique', note: 'Traite & petits animaux', color: '#5b7042' },
    { time: '12:30', title: 'Déjeuner truffade', note: 'À l\'auberge', color: '#b8503f' },
    { time: '15:00', title: 'Buronnerie & dégustation', note: 'Cantal AOP', color: '#8a8b3d' },
    { time: '17:00', title: 'Baignade au lac', note: '', color: '#4f8a86' },
  ] },
  { dow: 'Lun', num: 10, title: 'Cap sur Aurillac', sub: 'La ville', items: [
    { time: '10:00', title: 'Château Saint-Étienne', note: '', color: '#9c6b4a' },
    { time: '12:00', title: 'Déjeuner en ville', note: '', color: '#b8503f' },
    { time: '14:30', title: 'Maison des Volcans', note: 'Ludique pour les enfants', color: '#cf7d3c' },
    { time: '16:30', title: 'Parc & manège', note: '', color: '#5b7042' },
  ] },
  { dow: 'Mar', num: 11, title: 'Train & lacs', sub: 'Riom-ès-Montagnes', items: [
    { time: '10:00', title: 'Gentiane Express', note: 'Train touristique 🚂', color: '#cf7d3c' },
    { time: '13:00', title: 'Pique-nique au lac', note: '', color: '#4f8a86' },
    { time: '15:30', title: 'Pédalo & baignade', note: '', color: '#4f8a86' },
    { time: '18:00', title: 'Retour & repos', note: '', color: '#9c6b4a' },
  ] },
  { dow: 'Mer', num: 12, title: 'Journée libre', sub: 'Au gré de l\'envie', items: [
    { time: 'Matin', title: 'Grasse matinée', note: 'On souffle', color: '#cf7d3c' },
    { time: '11:00', title: 'Balade douce', note: '', color: '#5b7042' },
    { time: '16:00', title: 'Jeux au jardin', note: '', color: '#9c6b4a' },
  ] },
  { dow: 'Jeu', num: 13, title: 'Marché & baignade', sub: 'Dernier jour complet', items: [
    { time: '10:00', title: 'Marché de Salers', note: 'Souvenirs & fromages à ramener', color: '#8a8b3d' },
    { time: '15:00', title: 'Baignade au lac', note: 'Une dernière fois', color: '#4f8a86' },
    { time: '18:00', title: 'Rangement des valises', note: '', color: '#9c6b4a' },
  ] },
  { dow: 'Ven', num: 14, title: 'Retour — étape 1', sub: 'Mandailles → Laschamps', items: [
    { time: '09:30', title: 'Check-out du gîte', note: 'État des lieux', color: '#9c6b4a' },
    { time: '10:00', title: 'Route vers Laschamps', note: '', color: '#5b7042' },
    { time: '12:30', title: 'Pause déjeuner', note: '', color: '#b8503f' },
    { time: '16:00', title: 'Arrivée à Laschamps', note: 'Étape pour la nuit', color: '#9c6b4a' },
  ] },
  { dow: 'Sam', num: 15, title: 'Retour — étape 2', sub: 'Laschamps → Beauvais', items: [
    { time: '09:30', title: 'Départ de Laschamps', note: '', color: '#5b7042' },
    { time: '13:00', title: 'Pause déjeuner', note: '', color: '#b8503f' },
    { time: '17:00', title: 'Arrivée à Beauvais', note: 'Des souvenirs plein la tête 💛', color: '#4f8a86' },
  ] },
]

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
  { id: 6, emoji: '🧺', name: 'Marche de Salers', cat: 'Marché', dist: '30 min', dur: '1 h', age: 'Tous ages' },
  { id: 7, emoji: '🏊', name: 'Lac de Saint-Etienne-Cantalès', cat: 'Baignade', dist: '45 min', dur: '½ journee', age: 'Tous ages' },
  { id: 8, emoji: '🏘️', name: 'Village de Salers', cat: 'Patrimoine', dist: '30 min', dur: '2 h', age: 'Poussette ok' },
  { id: 9, emoji: '🧀', name: 'Buronnerie & degustation Cantal', cat: 'Gourmand', dist: '20 min', dur: '1 h', age: 'Tous ages' },
  { id: 10, emoji: '🧗', name: 'Via ferrata & escalade — Mandailles', cat: 'Sport', dist: 'Sur place', dur: '½ journee', age: 'Des 8 ans' },
  { id: 11, emoji: '🌊', name: 'Canyoning — vallee de la Jordanne', cat: 'Sport', dist: 'Sur place', dur: '½ journee', age: 'Ados & adultes' },
  { id: 12, emoji: '🚵', name: 'VTT & parapente — base de loisirs', cat: 'Sport', dist: 'Sur place', dur: '2 h', age: 'Selon activite' },
  { id: 13, emoji: '🚐', name: 'Navette ete Puy Mary — Pas de Peyrol', cat: 'Nature', dist: 'Depuis Mandailles', dur: '11/07 → 23/08', age: 'Evite le parking' },
  { id: 14, emoji: '🧺', name: 'Marche fermier de Mandailles', cat: 'Marché', dist: 'Sur place', dur: 'Dim. matin', age: 'Place du Bourg' },
  { id: 15, emoji: '🌉', name: 'Gorges de la Jordanne (passerelles bois)', cat: 'Famille', dist: 'Vallee', dur: '1 h', age: 'Sans poussette' },
  { id: 16, emoji: '🌲', name: 'Sources de la Jordanne — cirque de Mandailles', cat: 'Nature', dist: 'Route des Volcans', dur: '1 h 30 – 2 h', age: 'Des 5 ans' },
  { id: 17, emoji: '💦', name: 'Cascade du Luc (coin frais en foret)', cat: 'Nature', dist: 'Vallee', dur: '1 h', age: 'Tous ages' },
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

// Idées de jeux à faire avec les enfants pendant le séjour. Contenu statique
// (non éditable pour l'instant) affiché en section repliable sur l'Accueil.
// `place` sert de libellé + couleur de tag ; les couleurs sont choisies parmi
// celles gérées par le mode sombre (theme.js DARK_TEXT_COLOR_MAP).
export const KIDS_GAMES = [
  { emoji: '🔎', place: 'Nature', color: '#5b7042', name: 'Chasse au trésor nature', desc: 'Une liste à cocher : pomme de pin, plume, caillou blanc, fleur jaune, trèfle à quatre feuilles.' },
  { emoji: '🐄', place: 'Nature', color: '#5b7042', name: "Cartes d'observation", desc: 'Repérer les animaux du Cantal : vaches Salers, marmottes, rapaces, papillons.' },
  { emoji: '🌿', place: 'Nature', color: '#5b7042', name: 'Cabane & land art', desc: 'Construire une cabane de branches ou une œuvre avec cailloux, feuilles et bois.' },
  { emoji: '🧭', place: 'Nature', color: '#5b7042', name: "Course d'orientation", desc: 'Un petit parcours autour du gîte avec des indices dessinés à retrouver.' },
  { emoji: '🌙', place: 'Le soir', color: '#cf7d3c', name: 'Observation des étoiles', desc: 'Le ciel du Cantal est très sombre : repérer la Grande Ourse et les étoiles filantes du mois d\'août.' },
  { emoji: '📖', place: 'Le soir', color: '#cf7d3c', name: 'Veillée histoires de volcans', desc: 'Inventer des légendes sur le Puy Mary et les burons, à la lueur d\'une lampe.' },
  { emoji: '🃏', place: 'Au gîte', color: '#4f8a86', name: 'Jeux de pluie', desc: 'Memory des animaux, bataille, jeu du dictionnaire — pour les après-midis gris.' },
  { emoji: '🍳', place: 'Au gîte', color: '#4f8a86', name: 'Cuisiner en famille', desc: "Préparer l'aligot ou un gâteau à la châtaigne tous ensemble." },
  { emoji: '🎨', place: 'Au gîte', color: '#4f8a86', name: 'Carnet de vacances', desc: 'Dessiner la journée, coller un ticket, écrire un mot chaque soir.' },
]
