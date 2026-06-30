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
