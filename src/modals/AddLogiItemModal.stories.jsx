import { AddLogiItemModal } from './AddLogiItemModal.jsx'

const logiLists = [
  { key: 've', name: 'Valise enfants', emoji: '🧒', items: ['Pulls chauds (montagne !)', 'Bottes & baskets'] },
  { key: 'ph', name: 'Pharmacie', emoji: '🩹', items: ['Pansements', 'Crème solaire'] },
  { key: 'vo', name: 'Voiture', emoji: '🚗', items: ['Sièges auto', 'Jeux de voiture'] },
]

/** Feuille « Ajouter à une liste de préparatifs » (avec « Enregistrer & nouveau »). */
export default {
  title: 'Modals/AddLogiItemModal',
  component: AddLogiItemModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    selectedLogiKey: 'ph',
    newLogiItem: 'Tire-tique',
    logiLists,
    darkMode: false,
    setNewLogiItem: () => {},
    onSubmit: () => {},
    onSubmitAndNew: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const SansSaisieRapide = { name: 'Sans « Enregistrer & nouveau »', args: { onSubmitAndNew: undefined, newLogiItem: '' } }
