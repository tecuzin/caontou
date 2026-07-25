import { EditMeteoFullModal } from './EditMeteoFullModal.jsx'
import { s } from '../utils.js'

/** Feuille météo complète : jour, numéro, icône, températures max/min et pluie.
 *  Sert à la fois à ajouter (`editingMeteoIdx === null`) et à éditer un jour. */
export default {
  title: 'Modals/EditMeteoFullModal',
  component: EditMeteoFullModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    editingMeteoIdx: 3,
    newMeteoDay: 'Sam',
    setNewMeteoDay: () => {},
    newMeteoNum: '8',
    setNewMeteoNum: () => {},
    newMeteoIcon: '☀️',
    setNewMeteoIcon: () => {},
    newMeteoHi: '24',
    setNewMeteoHi: () => {},
    newMeteoLo: '12',
    setNewMeteoLo: () => {},
    newMeteoRain: '10 %',
    setNewMeteoRain: () => {},
    darkMode: false,
    onClose: () => {},
    onSubmit: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const Edition = { name: 'Édition d’un jour' }
export const Ajout = {
  name: 'Ajout d’un jour (formulaire vide)',
  args: {
    editingMeteoIdx: null,
    newMeteoDay: '', newMeteoNum: '', newMeteoIcon: '', newMeteoHi: '', newMeteoLo: '', newMeteoRain: '',
  },
}
