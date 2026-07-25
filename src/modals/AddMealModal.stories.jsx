import { AddMealModal } from './AddMealModal.jsx'

const days = [
  { dow: 'Mer', num: 5, title: 'Le grand départ', sub: 'Beauvais → Laschamps' },
  { dow: 'Jeu', num: 6, title: 'Cap sur le Cantal', sub: 'Laschamps → Vezels-Roussy' },
  { dow: 'Ven', num: 7, title: 'Mise en jambes', sub: 'Autour du gîte · Carladès' },
]

/** Feuille « Ajouter un repas » : jour, type de repas, plat. */
export default {
  title: 'Modals/AddMealModal',
  component: AddMealModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    newMealDay: 1,
    newMealType: 'diner',
    newMealLabel: 'Pâtes au pesto',
    days,
    darkMode: false,
    setNewMealDay: () => {},
    setNewMealType: () => {},
    setNewMealLabel: () => {},
    onSubmit: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const PetitDejeuner = { name: 'Petit-déj, plat vide', args: { newMealDay: 0, newMealType: 'petit-dej', newMealLabel: '' } }
