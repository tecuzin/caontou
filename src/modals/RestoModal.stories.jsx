import { RestoModal } from './RestoModal.jsx'
import { s } from '../utils.js'

const fields = {
  name: 'Auberge du Carladès',
  place: 'Vic-sur-Cère',
  tel: '04 71 47 50 00',
  resa: 'Sam 8 · 20 h · 4 couverts',
  reserved: false,
}

/** Ajout / édition d'un resto : nom, lieu (→ Maps), téléphone (→ appel),
 *  note de réservation et bascule « réservé ». Suppression visible en édition. */
export default {
  title: 'Modals/RestoModal',
  component: RestoModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    editing: false,
    fields,
    setField: () => {},
    onClose: () => {},
    onSubmit: () => {},
    onDelete: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const Ajout = { name: 'Ajouter un resto' }
export const EditionReserve = {
  name: 'Édition · déjà réservé',
  args: { editing: true, fields: { ...fields, reserved: true } },
}
