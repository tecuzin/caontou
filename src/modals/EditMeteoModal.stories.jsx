import { EditMeteoModal } from './EditMeteoModal.jsx'
import { s } from '../utils.js'

/** Édition rapide d'une journée météo (température, icône, description).
 *  Ne rend rien si `isOpen` est faux ou `editIdx` est `null`. */
export default {
  title: 'Modals/EditMeteoModal',
  component: EditMeteoModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    editIdx: 2,
    editMeteoDay: 'Sam 8',
    editMeteoTemp: '24',
    setEditMeteoTemp: () => {},
    editMeteoIcon: '☀️',
    setEditMeteoIcon: () => {},
    editMeteoDesc: 'Grand soleil',
    setEditMeteoDesc: () => {},
    darkMode: false,
    onClose: () => {},
    onSubmit: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const JourPluvieux = {
  name: 'Jour pluvieux',
  args: { editMeteoTemp: '13', editMeteoIcon: '🌧️', editMeteoDesc: 'Averses en matinée' },
}
