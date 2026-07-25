import { Badges } from './Badges.jsx'
import { s } from '../utils.js'
import { VISITS_INITIAL } from '../data.js'

/** Écran « Mes badges » : gamification enfants (badges verrouillés/débloqués
 *  calculés depuis visites, défis, bingo, photos, journal). `storeData` est une
 *  FONCTION renvoyant le store. */
export default {
  title: 'Écrans/Badges',
  component: Badges,
  tags: ['autodocs'],
  args: {
    sx: s,
    storeData: () => ({
      saved: { 1: true, 4: true, 5: true }, visits: VISITS_INITIAL,
      challengesDone: { '2026-08-07': true }, bingo: { 0: true, 1: true, 2: true },
      photos: [{ id: 'a' }, { id: 'b' }], journal: { 'Ven 7': { text: 'Super jour' } }, ratings: {},
    }),
  },
  argTypes: { sx: { table: { disable: true } }, storeData: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
