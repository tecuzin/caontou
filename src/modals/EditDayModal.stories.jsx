import { EditDayModal } from './EditDayModal.jsx'

/** Modale « Éditer jour » : titre + sous-titre. Rend `null` si `editIdx` est `null`. */
export default {
  title: 'Modals/EditDayModal',
  component: EditDayModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    editIdx: 1,
    editTitle: 'Cap sur le Cantal',
    editSub: 'Laschamps → Vezels-Roussy',
    darkMode: false,
    setEditTitle: () => {},
    setEditSub: () => {},
    onSubmit: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const ChampsVides = { name: 'Champs vides', args: { editIdx: 0, editTitle: '', editSub: '' } }
