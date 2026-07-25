import { ActivityAddSheet } from './ActivityAddSheet.jsx'
import { s } from '../utils.js'

/** Feuille « Ajouter activité » au planning : horaire, titre et pastille de couleur. */
export default {
  title: 'Modals/ActivityAddSheet',
  component: ActivityAddSheet,
  tags: ['autodocs'],
  args: {
    sx: s,
    time: '10:30',
    title: 'Rocher de Ronesque',
    color: '#5b7042',
    setTime: () => {},
    setTitle: () => {},
    setColor: () => {},
    onSubmit: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const Vide = { name: 'Formulaire vierge', args: { time: '', title: '', color: '' } }
