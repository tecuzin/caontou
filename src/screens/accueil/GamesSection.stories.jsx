import { GamesSection } from './GamesSection.jsx'
import { KIDS_GAMES } from '../../data.js'
import { s } from '../../utils.js'

/** Section « Jeux avec les enfants » de l'accueil : Bingo, Quiz du Carladès, et
 *  idées de jeux repliables. */
export default {
  title: 'Composants/Accueil/GamesSection',
  component: GamesSection,
  tags: ['autodocs'],
  args: { sx: s, kidsGames: KIDS_GAMES, setSub: () => {} },
  argTypes: { sx: { table: { disable: true } }, setSub: { table: { disable: true } } },
  parameters: { layout: 'padded' },
}

export const ParDefaut = {}
