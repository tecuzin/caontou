import { EditActivityModal } from './EditActivityModal.jsx'

const activities = [
  { day: 1, time: '11:00', label: 'Pause à Murat' },
  { day: 1, time: '16:00', label: 'Courses à Aurillac' },
  { day: 2, time: '10:30', label: 'Rocher de Ronesque' },
]

/** Modale « Éditer activité » : libellé + horaire, avec suppression. Rend `null` si `editIdx` est `null`. */
export default {
  title: 'Modals/EditActivityModal',
  component: EditActivityModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    editIdx: 2,
    activities,
    editActivityLabel: 'Rocher de Ronesque',
    editActivityTime: '10:30',
    darkMode: false,
    setEditActivityLabel: () => {},
    setEditActivityTime: () => {},
    onSubmit: () => {},
    onDelete: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const ChampsVides = { name: 'Champs vides', args: { editIdx: 0, editActivityLabel: '', editActivityTime: '' } }
