import { AddCourseItemModal } from './AddCourseItemModal.jsx'

const courseGroups = [
  { key: 'co_frais', name: 'Frais', items: ['Lait', 'Oeufs (x12)', 'Cantal AOP'] },
  { key: 'co_epic', name: 'Épicerie', items: ['Pâtes', 'Riz', 'Café'] },
  { key: 'co_enf', name: 'Pour les enfants', items: ['Compotes à boire', 'Sirop'] },
]

/** Feuille « Ajouter un article » à une catégorie de courses (avec « Enregistrer & nouveau »). */
export default {
  title: 'Modals/AddCourseItemModal',
  component: AddCourseItemModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    selectedCourseKey: 'co_frais',
    newCourseItem: 'Saint-Nectaire',
    courseGroups,
    darkMode: false,
    setNewCourseItem: () => {},
    onSubmit: () => {},
    onSubmitAndNew: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const SansSaisieRapide = { name: 'Sans « Enregistrer & nouveau »', args: { onSubmitAndNew: undefined, newCourseItem: '' } }
