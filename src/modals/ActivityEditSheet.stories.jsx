import { ActivityEditSheet } from './ActivityEditSheet.jsx'
import { s } from '../utils.js'

/** Feuille « Éditer activité » du planning : horaire + titre. */
export default {
  title: 'Modals/ActivityEditSheet',
  component: ActivityEditSheet,
  tags: ['autodocs'],
  args: {
    sx: s,
    time: '16:00',
    title: 'Courses à Aurillac',
    setTime: () => {},
    setTitle: () => {},
    onSubmit: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
