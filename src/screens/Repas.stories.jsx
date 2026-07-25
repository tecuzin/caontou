import { Repas } from './Repas.jsx'
import { s } from '../utils.js'
import { MEALS_INITIAL } from '../data.js'

const coursesGroups = [
  { name: 'Frais', key: 'co_frais', doneStr: '2/4', items: [
    { label: 'Lait', checked: true }, { label: 'Œufs (x12)', checked: true },
    { label: 'Beurre', checked: false }, { label: 'Cantal AOP', checked: false },
  ] },
  { name: 'Épicerie', key: 'co_epic', doneStr: '1/2', items: [
    { label: 'Café', checked: true }, { label: 'Pâtes', checked: false },
  ] },
]

/** Écran Repas & courses : onglets Menus / Courses (fiche marchés, liste par
 *  catégorie, gestion des articles). */
export default {
  title: 'Écrans/Repas',
  component: Repas,
  tags: ['autodocs'],
  args: {
    sx: s, meals: MEALS_INITIAL, coursesGroups, coursesDone: 3, coursesTotal: 6, coursesPct: 50,
    coursesSorted: false, shoppingItems: [{ id: 1, label: 'Charbon BBQ', checked: false }], newShoppingItem: '',
    editMeal: () => {}, deleteMeal: () => {}, openAddMeal: () => {}, capturePhoto: () => {},
    setMealTab: () => {}, setCoursesSorted: () => {}, toggleCheck: () => {}, deleteCourseCategory: () => {},
    deleteCourseItem: () => {}, setEditingCourseKey: () => {}, setShowAddCourseItem: () => {}, setShowAddCourseCat: () => {},
    toggleShoppingItem: () => {}, deleteShoppingItem: () => {}, setNewShoppingItem: () => {}, addShoppingItem: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const Menus = { args: { mealTab: 'repas' } }
export const Courses = { args: { mealTab: 'courses' } }
