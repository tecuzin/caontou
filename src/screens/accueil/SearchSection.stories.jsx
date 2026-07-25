import { SearchSection } from './SearchSection.jsx'
import { s } from '../../utils.js'
import { VISITS_INITIAL, MEALS_INITIAL, DAYS_INITIAL, RESTOS_INITIAL } from '../../data.js'

/** Recherche globale de l'accueil : cherche dans tout le contenu du séjour
 *  (visites, repas, jours, restos…) et navigue vers le résultat. */
export default {
  title: 'Composants/Accueil/SearchSection',
  component: SearchSection,
  tags: ['autodocs'],
  args: {
    sx: s, setTab: () => {}, setSub: () => {}, setDay: () => {},
    storeData: { visits: VISITS_INITIAL, meals: MEALS_INITIAL, days: DAYS_INITIAL, restos: RESTOS_INITIAL, expenses: [] },
  },
  argTypes: {
    sx: { table: { disable: true } }, storeData: { table: { disable: true } },
    setTab: { table: { disable: true } }, setSub: { table: { disable: true } }, setDay: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
}

export const ParDefaut = {}
