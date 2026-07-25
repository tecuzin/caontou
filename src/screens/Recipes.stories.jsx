import { Recipes } from './Recipes.jsx'
import { s } from '../utils.js'
import { RECIPES_INITIAL } from '../data.js'

/** Écran Recettes du Cantal : recettes locales (truffade, aligot…), éditables. */
export default {
  title: 'Écrans/Recipes',
  component: Recipes,
  tags: ['autodocs'],
  args: { sx: s, recipes: RECIPES_INITIAL, setRecipes: () => {} },
  argTypes: { sx: { table: { disable: true } }, setRecipes: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
