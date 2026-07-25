import { EditVisitModal } from './EditVisitModal.jsx'
import { s } from '../utils.js'

/** Feuille visite : nom, catégorie, distance et âge recommandé.
 *  Titre « Ajouter une visite » quand `editIdx` vaut `null`. */
export default {
  title: 'Modals/EditVisitModal',
  component: EditVisitModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    editIdx: 0,
    editVisitName: 'Pas de Cère — sentier des passerelles',
    setEditVisitName: () => {},
    editVisitDist: '30 min',
    setEditVisitDist: () => {},
    editVisitCat: 'Nature',
    setEditVisitCat: () => {},
    editVisitNote: 'Dès 4 ans',
    setEditVisitNote: () => {},
    darkMode: false,
    onClose: () => {},
    onSubmit: () => {},
    onDelete: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const Edition = { name: 'Édition d’une visite' }
export const Ajout = {
  name: 'Ajout d’une visite (formulaire vide)',
  args: { editIdx: null, editVisitName: '', editVisitDist: '', editVisitCat: 'Nature', editVisitNote: '' },
}
