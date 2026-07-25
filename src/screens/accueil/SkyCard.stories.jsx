import { SkyCard } from './SkyCard.jsx'
import { s } from '../../utils.js'

/** Carte « Ciel du jour » : lever/coucher du soleil et phase de lune, calculés
 *  localement (hors-ligne) pour une date donnée. */
export default {
  title: 'Composants/Accueil/SkyCard',
  component: SkyCard,
  tags: ['autodocs'],
  args: { sx: s },
  argTypes: { sx: { table: { disable: true } }, date: { control: 'date' } },
  parameters: { layout: 'padded' },
}

export const Aujourdhui = { name: "Aujourd'hui" }
export const UnJourDEte = { name: 'Un jour d\'été', args: { date: new Date('2026-08-10T12:00:00') } }
