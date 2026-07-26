import { DrawPad } from './DrawPad.jsx'
import { s } from '../utils.js'

/** Coin dessin libre : canvas tactile pour les enfants les jours de pluie,
 *  avec palette maison, gomme et envoi du dessin vers la galerie souvenirs. */
export default {
  title: 'Écrans/DrawPad',
  component: DrawPad,
  tags: ['autodocs'],
  args: { sx: s },
  argTypes: { sx: { table: { disable: true } }, onSave: { action: 'onSave' } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}

/** Sans `onSave` (mode bac à sable) : le bouton d'enregistrement disparaît. */
export const SansEnregistrement = { args: { onSave: undefined } }
