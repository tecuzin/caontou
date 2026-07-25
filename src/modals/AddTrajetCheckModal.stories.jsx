import { AddTrajetCheckModal } from './AddTrajetCheckModal.jsx'

/** Feuille « Avant de partir… » : ajout d'un point à la checklist du trajet. */
export default {
  title: 'Modals/AddTrajetCheckModal',
  component: AddTrajetCheckModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    newTrajetCheckItem: 'Vérifier les pneus',
    darkMode: false,
    setNewTrajetCheckItem: () => {},
    onSubmit: () => {},
    onSubmitAndNew: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const SansSaisieRapide = { name: 'Sans « Enregistrer & nouveau »', args: { onSubmitAndNew: undefined, newTrajetCheckItem: '' } }
