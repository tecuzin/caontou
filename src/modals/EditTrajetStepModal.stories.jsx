import { EditTrajetStepModal } from './EditTrajetStepModal.jsx'
import { s } from '../utils.js'

/** Édition d'une étape du trajet : horaire, lieu, note et pastille de couleur.
 *  Ne rend rien si `isOpen` est faux ou `editingTrajetIdx` est `null`. */
export default {
  title: 'Modals/EditTrajetStepModal',
  component: EditTrajetStepModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    editingTrajetIdx: 1,
    newTrajetTime: '12:30',
    setNewTrajetTime: () => {},
    newTrajetPlace: 'Laschamps',
    setNewTrajetPlace: () => {},
    newTrajetNote: 'Pause déjeuner + étape pour la nuit',
    setNewTrajetNote: () => {},
    newTrajetColor: '#cf7d3c',
    setNewTrajetColor: () => {},
    darkMode: false,
    onClose: () => {},
    onSubmit: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const AutreCouleur = { name: 'Couleur verte sélectionnée', args: { newTrajetColor: '#5b7042' } }
