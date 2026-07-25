import { TodayCard } from './TodayCard.jsx'
import { s } from '../../utils.js'

/** Carte « Aujourd'hui » de l'accueil : jour en cours (programme, repas, météo),
 *  raccourci vers le planning du jour. */
export default {
  title: 'Composants/Accueil/TodayCard',
  component: TodayCard,
  tags: ['autodocs'],
  args: {
    sx: s, setTab: () => {}, setDay: () => {},
    today: {
      dayIdx: 2,
      d: { dow: 'Ven', num: 7, title: 'Mise en jambes', sub: 'Autour du gîte · Carladès', items: [
        { time: '10:30', title: 'Rocher de Ronesque', note: 'Panorama 360°' },
        { time: '12:30', title: 'Pique-nique au sommet', note: '' },
      ] },
      meal: { dish: 'Truffade maison + salade' },
      w: { hi: 24, lo: 12, icon: '☀️' },
    },
  },
  argTypes: { sx: { table: { disable: true } }, setTab: { table: { disable: true } }, setDay: { table: { disable: true } } },
  parameters: { layout: 'padded' },
}

export const ParDefaut = {}
