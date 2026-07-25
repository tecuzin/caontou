import { DayEditSheet } from './DayEditSheet.jsx'
import { s } from '../utils.js'

/** Feuille « Éditer jour » du planning : titre + sous-titre, suppression optionnelle. */
export default {
  title: 'Modals/DayEditSheet',
  component: DayEditSheet,
  tags: ['autodocs'],
  args: {
    sx: s,
    title: 'Cap sur le Cantal',
    sub: 'Laschamps → Vezels-Roussy',
    canDelete: true,
    setTitle: () => {},
    setSub: () => {},
    onSubmit: () => {},
    onDelete: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const SansSuppression = { name: 'Suppression impossible', args: { canDelete: false } }
