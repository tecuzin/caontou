import { VoteModal } from './VoteModal.jsx'
import { s } from '../utils.js'

const visits = [
  { id: 1, emoji: '🌉', name: 'Pas de Cère — sentier des passerelles', cat: 'Nature', dist: '30 min' },
  { id: 2, emoji: '🚠', name: 'Le Lioran — télécabine du Plomb du Cantal', cat: 'Nature', dist: '45 min' },
  { id: 6, emoji: '🏰', name: 'Château de Messilhac (Renaissance)', cat: 'Patrimoine', dist: '15 min' },
  { id: 8, emoji: '⛰️', name: 'Rocher de Ronesque (panorama 360°)', cat: 'Nature', dist: '12 min' },
  { id: 10, emoji: '🎡', name: 'Parc de loisirs de Vic-sur-Cère', cat: 'Famille', dist: '30 min' },
]
const days = [
  { dow: 'Mer', num: 5, title: 'Le grand départ' },
  { dow: 'Jeu', num: 6, title: 'Cap sur le Cantal' },
  { dow: 'Ven', num: 7, title: 'Première balade' },
]

/** Vote familial « on fait quoi demain ? » — pass-and-play sur un seul téléphone :
 *  sélection de 2 à 4 candidates, vote de chacun à tour de rôle, puis résultat
 *  ajoutable au planning. La story s'ouvre sur la phase « setup » (état interne). */
export default {
  title: 'Modals/VoteModal',
  component: VoteModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    visits,
    savedVisitIds: [1, 8],
    familyMembers: ['David', 'Marie', 'Lina'],
    setFamilyMembers: () => {},
    days,
    addActivity: () => {},
    onWinner: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = { name: 'Préparation du vote' }
export const SansFavorisNiVotants = {
  name: 'Aucun favori ni votant (bouton désactivé)',
  args: { savedVisitIds: [], familyMembers: [] },
}
