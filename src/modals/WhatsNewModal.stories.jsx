import { WhatsNewModal } from './WhatsNewModal.jsx'
import { s } from '../utils.js'

const entries = [
  { build: 114, version: '1.3.0', items: [
    '🧺 Marchés du Carladès : jours, horaires et itinéraire dans l’onglet Courses',
    '❓ Quiz du Carladès pour les enfants, dans la section Jeux de l’accueil',
  ] },
  { build: 113, version: '1.2.4', items: [
    '📔 Dictée vocale du journal de bord',
    '🗳️ Vote familial « on fait quoi demain ? »',
  ] },
]

/** « Quoi de neuf ? » — feuille affichée au premier lancement d'un nouveau build.
 *  Ne rend rien si `isOpen` est faux ou si `entries` est vide. */
export default {
  title: 'Modals/WhatsNewModal',
  component: WhatsNewModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    entries,
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const UnSeulBuild = { name: 'Un seul build', args: { entries: [entries[0]] } }
