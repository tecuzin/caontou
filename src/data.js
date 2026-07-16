// Mutable data - meals, shopping, planning
// Separated from DEFAULTS to avoid encoding issues

// Parametres du voyage — tout est modifiable dans l'app (modal ⚙️).
// Dates ISO (yyyy-mm-dd) ; etape = halte pour la nuit (aller ET retour).
export const TRIP_INITIAL = {
  start: '2026-08-05',
  end: '2026-08-15',
  origin: 'Beauvais',
  etape: 'Laschamps',
  destination: 'Vezels-Roussy (Cantal)',
}

// Coordonnées du gîte (Vezels-Roussy, 15130, Carladès) — centre par défaut de
// la carte du séjour. Approximatives (~bourg de Vezels-Roussy).
export const GITE_COORDS = { lat: 44.827, lng: 2.566 }

export const MEALS_INITIAL = [
  { id: 1, day: 'Mer 5', dish: 'Etape a Laschamps — resto simple' },
  { id: 2, day: 'Jeu 6', dish: 'Pates au pesto (soir arrivee)' },
  { id: 3, day: 'Ven 7', dish: 'Truffade maison + salade' },
  { id: 4, day: 'Sam 8', dish: 'Repas sur place a Riom (apres la course)' },
  { id: 5, day: 'Dim 9', dish: 'Aligot & saucisse de Cantal' },
  { id: 6, day: 'Lun 10', dish: 'Pizzeria a Vic-sur-Cere' },
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
  { dow: 'Jeu', num: 6, title: 'Cap sur le Cantal', sub: 'Laschamps → Vezels-Roussy', items: [
    { time: '09:30', title: 'Départ de Laschamps', note: 'Volcans en vue', color: '#5b7042' },
    { time: '11:00', title: 'Pause à Murat', note: 'Café & jambes', color: '#cf7d3c' },
    { time: '13:30', title: 'Arrivée au gîte', note: 'Vezels-Roussy · installation & goûter', color: '#9c6b4a' },
    { time: '16:00', title: 'Courses à Aurillac', note: 'Premier ravitaillement (~25 min)', color: '#8a8b3d' },
    { time: '19:30', title: 'Dîner au coin du cantou', note: 'Pâtes au pesto', color: '#b8503f' },
  ] },
  { dow: 'Ven', num: 7, title: 'Mise en jambes', sub: 'Autour du gîte · Carladès', items: [
    { time: '09:30', title: 'Petit-déj tranquille', note: 'On prend le temps', color: '#cf7d3c' },
    { time: '10:30', title: 'Rocher de Ronesque', note: 'Table basaltique, panorama 360° (tout près)', color: '#5b7042' },
    { time: '12:30', title: 'Pique-nique au sommet', note: '', color: '#4f8a86' },
    { time: '15:00', title: 'Sieste & jeux au jardin', note: '', color: '#9c6b4a' },
    { time: '18:00', title: 'Marché de producteurs', note: 'Fromages & charcuterie', color: '#8a8b3d' },
  ] },
  { dow: 'Sam', num: 8, title: 'Trail de Riom-ès-Montagnes', sub: 'Course · 79 km / 3 000 m D+', items: [
    { time: '04:45', title: 'Départ du gîte', note: 'Route vers Riom-ès-Montagnes (~1 h 15)', color: '#5b7042' },
    { time: '06:00', title: 'Retrait du dossard', note: 'Préparation & échauffement', color: '#9c6b4a' },
    { time: '07:00', title: 'Départ de la course', note: '79 km · 3 000 m D+ 🏃', color: '#b8503f' },
    { time: '18:30', title: 'Arrivée estimée', note: '11–12 h d\'effort — bravo !', color: '#cf7d3c' },
    { time: '19:30', title: 'Retour vers le gîte', note: 'Repas sur place avant de reprendre la route', color: '#5b7042' },
    { time: '20:45', title: 'Retour au gîte', note: 'Douche & récupération', color: '#9c6b4a' },
  ] },
  { dow: 'Dim', num: 9, title: 'Fermes & fromages', sub: 'Vallée du Carladès', items: [
    { time: '10:00', title: 'Ferme pédagogique', note: 'Traite & petits animaux', color: '#5b7042' },
    { time: '12:30', title: 'Déjeuner truffade', note: 'À l\'auberge', color: '#b8503f' },
    { time: '15:00', title: 'Buronnerie & dégustation', note: 'Cantal AOP', color: '#8a8b3d' },
    { time: '17:00', title: 'Parc de loisirs à Vic', note: 'Piscine & rosalies', color: '#4f8a86' },
  ] },
  { dow: 'Lun', num: 10, title: 'Cap sur Aurillac', sub: 'La ville (~25 min)', items: [
    { time: '10:00', title: 'Château Saint-Étienne', note: '', color: '#9c6b4a' },
    { time: '12:00', title: 'Déjeuner en ville', note: '', color: '#b8503f' },
    { time: '14:30', title: 'Maison des Volcans', note: 'Ludique pour les enfants', color: '#cf7d3c' },
    { time: '16:30', title: 'Parc & manège', note: '', color: '#5b7042' },
  ] },
  { dow: 'Mar', num: 11, title: 'Gorges & cascades', sub: 'Pas de Cère · Vic-sur-Cère', items: [
    { time: '10:00', title: 'Pas de Cère', note: 'Sentier des passerelles 🌉', color: '#5b7042' },
    { time: '12:30', title: 'Pique-nique au bord de l\'eau', note: '', color: '#4f8a86' },
    { time: '15:00', title: 'Cascade de la Conche', note: 'Balade courte depuis Vic', color: '#5b7042' },
    { time: '18:00', title: 'Retour & repos', note: '', color: '#9c6b4a' },
  ] },
  { dow: 'Mer', num: 12, title: 'Le Lioran en famille', sub: 'Plomb du Cantal', items: [
    { time: '09:00', title: 'Départ vers Le Lioran', note: '~45 min par la vallée de la Cère', color: '#5b7042' },
    { time: '10:00', title: 'Télécabine du Plomb', note: 'Montée au Plomb du Cantal (1 855 m)', color: '#9c6b4a' },
    { time: '12:30', title: 'Pique-nique panorama', note: 'Vue à 360° sur le massif 🏔️', color: '#4f8a86' },
    { time: '14:30', title: 'Accrobranche « jungle verte »', note: 'Parcours dès 3 ans', color: '#5b7042' },
    { time: '17:00', title: 'Glace à Vic-sur-Cère', note: 'Récompense méritée', color: '#b8503f' },
  ] },
  { dow: 'Jeu', num: 13, title: 'Marché & baignade', sub: 'Dernier jour complet', items: [
    { time: '10:00', title: 'Marché de Vic-sur-Cère', note: 'Souvenirs & fromages à ramener', color: '#8a8b3d' },
    { time: '15:00', title: 'Baignade au lac', note: 'Une dernière fois', color: '#4f8a86' },
    { time: '18:00', title: 'Rangement des valises', note: '', color: '#9c6b4a' },
  ] },
  { dow: 'Ven', num: 14, title: 'Retour — étape 1', sub: 'Vezels-Roussy → Laschamps', items: [
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
// Laschamps -> Vezels-Roussy (15130) : ~170 km, ~2h30 via A75 puis N122
//   (sortie A75 vers Massiac, N122 par Murat / Le Lioran / Vic-sur-Cère,
//   contournement d'Aurillac puis routes du Carladès jusqu'au gîte).
export const TRAJETS_INITIAL = {
  aller: [
    { time: 'Mer 5 · 08:00', place: 'Depart de Beauvais', note: 'Voiture chargee, c\'est parti !', color: '#5b7042' },
    { time: '10:30', place: 'Pause a Orleans', note: '215 km, via A16 (contournement Paris) puis A10', color: '#4f8a86' },
    { time: '13:00', place: 'Pause dejeuner a Bourges', note: '~350 km, via A71', color: '#cf7d3c' },
    { time: '17:00', place: 'Arrivee a Laschamps', note: '502 km au total (~5h35 de route + pauses) - etape pour la nuit (Orcines, Puy-de-Dome)', color: '#9c6b4a' },
    { time: 'Jeu 6 · 09:30', place: 'Depart de Laschamps', note: 'Cap au sud par l\'A75, volcans en vue', color: '#5b7042' },
    { time: '11:00', place: 'Pause a Murat', note: 'Sortie A75 puis N122, derniere etape avant Aurillac', color: '#8a8b3d' },
    { time: '13:00', place: 'Arrivee a Vezels-Roussy', note: '~170 km depuis Laschamps (~2h30 de route) - installation au gite (Carlades)', color: '#b8503f' },
  ],
  retour: [
    { time: 'Ven 14 · 09:30', place: 'Depart de Vezels-Roussy', note: 'Check-out du gite', color: '#9c6b4a' },
    { time: '11:00', place: 'Pause a Murat', note: 'N122 puis A75 vers le nord', color: '#8a8b3d' },
    { time: '12:30', place: 'Arrivee a Laschamps', note: '~170 km, etape pour la nuit', color: '#5b7042' },
    { time: 'Sam 15 · 09:00', place: 'Depart de Laschamps', note: 'Retour par l\'A71 puis A16', color: '#5b7042' },
    { time: '12:30', place: 'Pause dejeuner a Bourges', note: '~150 km', color: '#cf7d3c' },
    { time: '15:00', place: 'Pause a Orleans', note: '~285 km', color: '#4f8a86' },
    { time: '17:30', place: 'Arrivee a Beauvais', note: '502 km au total - des souvenirs plein la tete 💛', color: '#4f8a86' },
  ],
}

// Visites re-basées autour du gîte réel (Vezels-Roussy, Carladès, sud-est
// d'Aurillac). Distances de route indicatives depuis Vezels-Roussy. Les sites
// emblématiques du nord (Puy Mary, Salers) sont conservés mais étiquetés
// « grande sortie » (~1 h de route), plus à « 25 min » comme avant.
// `lat`/`lng` : coordonnées réelles approximatives (site/bourg) servant à
// placer les visites sur la carte du séjour. Précision « à la commune » —
// suffisante pour une carte schématique relative au gîte, pas pour naviguer.
export const VISITS_INITIAL = [
  { id: 1, emoji: '🌉', name: 'Pas de Cère — sentier des passerelles', cat: 'Nature', dist: '30 min', dur: '1 h 30', age: 'Des 4 ans', lat: 45.017, lng: 2.657 },
  { id: 2, emoji: '🚠', name: 'Le Lioran — télécabine du Plomb du Cantal', cat: 'Nature', dist: '45 min', dur: '½ journee', age: 'Tous ages', lat: 45.083, lng: 2.744 },
  { id: 3, emoji: '🌲', name: 'Accrobranche « jungle verte » du Lioran', cat: 'Sport', dist: '45 min', dur: '½ journee', age: 'Des 3 ans', lat: 45.098, lng: 2.751 },
  { id: 4, emoji: '💧', name: 'Cascade de la Conche (Vic-sur-Cère)', cat: 'Nature', dist: '30 min', dur: '45 min', age: 'Tous ages', lat: 44.985, lng: 2.635 },
  { id: 5, emoji: '💦', name: 'Cascade du Faillitoux (Thiézac)', cat: 'Nature', dist: '35 min', dur: '1 h', age: 'Poussette non', lat: 45.028, lng: 2.672 },
  { id: 6, emoji: '🏰', name: 'Château de Messilhac (Renaissance)', cat: 'Patrimoine', dist: '15 min', dur: '1 h', age: 'Des 5 ans', lat: 44.858, lng: 2.663 },
  { id: 7, emoji: '🏘️', name: 'Village de Raulhac (Carladès)', cat: 'Patrimoine', dist: '15 min', dur: '1 h', age: 'Tous ages', lat: 44.791, lng: 2.660 },
  { id: 8, emoji: '⛰️', name: 'Rocher de Ronesque (panorama 360°)', cat: 'Nature', dist: '12 min', dur: '1 h 30', age: 'Des 6 ans', lat: 44.823, lng: 2.628 },
  { id: 9, emoji: '🪨', name: 'Site de Carlat (rocher historique)', cat: 'Patrimoine', dist: '20 min', dur: '1 h', age: 'Des 5 ans', lat: 44.851, lng: 2.581 },
  { id: 10, emoji: '🎡', name: 'Parc de loisirs de Vic-sur-Cère', cat: 'Famille', dist: '30 min', dur: '½ journee', age: 'Tous ages', lat: 44.982, lng: 2.625 },
  { id: 11, emoji: '🌋', name: 'Maison des Volcans, Aurillac', cat: 'Patrimoine', dist: '25 min', dur: '1 h 30', age: 'Des 3 ans', lat: 44.918, lng: 2.457 },
  { id: 12, emoji: '🧺', name: 'Marché de Vic-sur-Cère', cat: 'Marché', dist: '30 min', dur: 'Matinée', age: 'Tous ages', lat: 44.980, lng: 2.626 },
  { id: 13, emoji: '🏊', name: 'Lac de Saint-Etienne-Cantalès', cat: 'Baignade', dist: '50 min', dur: '½ journee', age: 'Tous ages', lat: 44.903, lng: 2.222 },
  { id: 14, emoji: '🧀', name: 'Buronnerie & degustation Cantal', cat: 'Gourmand', dist: '30 min', dur: '1 h', age: 'Tous ages', lat: 45.046, lng: 2.732 },
  { id: 15, emoji: '⛰️', name: 'Puy Mary — Pas de Peyrol (grande sortie)', cat: 'Nature', dist: '1 h 15', dur: 'Journée', age: 'Des 4 ans (porte-bebe)', lat: 45.108, lng: 2.680 },
  { id: 16, emoji: '🏘️', name: 'Village de Salers (grande sortie)', cat: 'Patrimoine', dist: '1 h 20', dur: '½ journee', age: 'Poussette ok', lat: 45.139, lng: 2.494 },
  { id: 17, emoji: '🚂', name: 'Gentiane Express (grande sortie)', cat: 'Famille', dist: '1 h 10', dur: '½ journee', age: 'Tous ages', lat: 45.279, lng: 2.660 },
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

// Bingo d'observation du Cantal — grille 4×4 à cocher pendant les balades et
// la route. Ligne complète (rangée / colonne / diagonale) = petite célébration.
export const BINGO_CANTAL = [
  { emoji: '🐄', label: 'Vache de Salers' },
  { emoji: '🏔️', label: 'Le Plomb du Cantal' },
  { emoji: '🛖', label: 'Un buron' },
  { emoji: '💧', label: 'Une cascade' },
  { emoji: '🧀', label: 'Une fromagerie' },
  { emoji: '🦅', label: 'Un rapace' },
  { emoji: '🐟', label: 'Une truite' },
  { emoji: '⛪', label: 'Un clocher roman' },
  { emoji: '🌰', label: 'Un châtaignier' },
  { emoji: '🚜', label: 'Un tracteur à foin' },
  { emoji: '🌸', label: 'Une gentiane jaune' },
  { emoji: '🐑', label: 'Un troupeau' },
  { emoji: '🪨', label: 'Un mur en pierre volcanique' },
  { emoji: '🌋', label: 'Un ancien volcan' },
  { emoji: '🥾', label: 'Un sentier de rando (GR)' },
  { emoji: '🧺', label: 'Un marché de village' },
]

// Numéros d'urgence — contenu statique, cliquables (tel:) même hors-ligne.
export const EMERGENCY_NUMBERS = [
  { emoji: '🆘', label: 'Urgences (Europe)', num: '112' },
  { emoji: '🚑', label: 'SAMU', num: '15' },
  { emoji: '🚒', label: 'Pompiers', num: '18' },
  { emoji: '👮', label: 'Gendarmerie', num: '17' },
  { emoji: '💬', label: 'Urgences par SMS', num: '114' },
]

// Carnet de restaurants du séjour (éditable). resa = note de réservation,
// reserved = statut (réservé / à réserver).
export const RESTOS_INITIAL = [
  { id: 1, name: 'Aligot & truffade au buron', place: 'Col de Curebourse (Carladès)', tel: '', resa: '', reserved: false },
  { id: 2, name: 'Truite du Pas de Cère', place: 'Vic-sur-Cère', tel: '', resa: '', reserved: false },
]
