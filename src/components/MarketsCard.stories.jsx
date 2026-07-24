import { MarketsCard } from './MarketsCard.jsx'
import { s } from '../utils.js'

/**
 * Fiche « Marchés du Carladès » (contenu statique hors-ligne) affichée en tête
 * de l'onglet Courses : Vic-sur-Cère & Aurillac, jours/horaires + « Y aller ».
 */
export default {
  title: 'Composants/MarketsCard',
  component: MarketsCard,
  tags: ['autodocs'],
  args: { sx: s },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'padded' },
}

export const Defaut = { name: 'Par défaut' }
