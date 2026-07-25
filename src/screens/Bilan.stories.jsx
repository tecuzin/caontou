import { Bilan } from './Bilan.jsx'
import { s } from '../utils.js'

const recap = {
  daysCount: 10, spent: 640, budgetTotal: 1800, spentPct: 36,
  topCategories: [{ name: 'Hébergement', amt: 360 }, { name: 'Nourriture', amt: 160 }, { name: 'Transport', amt: 120 }],
  savedVisits: 4, packPct: 70, coursesPct: 50, mealsPlanned: 11, photosCount: 12, ratedCount: 3,
  topRated: [{ name: 'Pas de Cère', emoji: '🌉', stars: 5, note: 'Magnifique balade' }, { name: 'Le Lioran', emoji: '🚠', stars: 4, note: '' }],
  toAvoid: [],
}

/** Écran Bilan du séjour : synthèse partageable (jours, budget, visites, photos,
 *  coups de cœur). */
export default {
  title: 'Écrans/Bilan',
  component: Bilan,
  tags: ['autodocs'],
  args: { sx: s, recap, onShare: () => {} },
  argTypes: { sx: { table: { disable: true } }, onShare: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
