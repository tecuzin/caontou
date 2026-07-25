import { EditTripModal } from './EditTripModal.jsx'
import { s } from '../utils.js'

/** Paramètres du voyage : dates de départ/retour, ville de départ, étape de nuit
 *  optionnelle et destination. Pilote le compte à rebours et les cartes. */
export default {
  title: 'Modals/EditTripModal',
  component: EditTripModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    newTripStart: '2026-08-05',
    setNewTripStart: () => {},
    newTripEnd: '2026-08-15',
    setNewTripEnd: () => {},
    newTripOrigin: 'Beauvais',
    setNewTripOrigin: () => {},
    newTripEtape: 'Laschamps',
    setNewTripEtape: () => {},
    newTripDest: 'Vezels-Roussy (Cantal)',
    setNewTripDest: () => {},
    darkMode: false,
    onClose: () => {},
    onSubmit: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const SansEtape = { name: 'Sans étape de nuit', args: { newTripEtape: '' } }
