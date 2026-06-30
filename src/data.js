// Mutable data - meals, shopping, planning
// Separated from DEFAULTS to avoid encoding issues

export const MEALS_INITIAL = [
  { day: 'Sam 11', dish: 'Pates au pesto (soir arrivee)' },
  { day: 'Dim 12', dish: 'Truffade maison + salade' },
  { day: 'Lun 13', dish: 'Poulet roti & legumes' },
  { day: 'Mar 14', dish: 'Aligot & saucisse de Cantal' },
  { day: 'Mer 15', dish: 'Pizzeria a Murat' },
  { day: 'Jeu 16', dish: 'Omelette aux cepes' },
  { day: 'Ven 17', dish: 'Grillades au jardin' },
]

export const SHOPPING_INITIAL = {
  co_frais: { 'Lait': true, 'Oeufs (x12)': true },
  co_epic: { 'Cafe': true },
  co_fl: {},
  co_enf: { 'Compotes a boire': true },
  co_autre: { 'Pain': true },
}

export const PLANNING_INITIAL = [
  // Days come from DAYS constant - can be made editable per activity
]
