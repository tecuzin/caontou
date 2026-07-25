import { MealSheet } from './MealSheet.jsx'
import { s } from '../utils.js'

/** Feuille repas (ajout ou édition selon `isEdit`) : jour + plat. */
export default {
  title: 'Modals/MealSheet',
  component: MealSheet,
  tags: ['autodocs'],
  args: {
    sx: s,
    isEdit: false,
    day: 'Jeu 6',
    dish: 'Pâtes au pesto',
    setDay: () => {},
    setDish: () => {},
    onSubmit: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const Edition = { name: 'Mode édition', args: { isEdit: true, day: 'Ven 7', dish: 'Truffade maison' } }
