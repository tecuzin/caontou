import { Postcard } from './Postcard.jsx'
import { s } from '../utils.js'

/** Composeur de carte postale « Carladès » : photo + cadre + légende + date,
 *  rendus sur un <canvas> hors-ligne, partageable via la feuille système.
 *  Overlay plein écran. Sans `src`, le canvas rend le fond décoratif seul. */
export default {
  title: 'Écrans/Postcard',
  component: Postcard,
  tags: ['autodocs'],
  args: {
    sx: s,
    src: '',
    place: 'Carladès · Cantal',
    date: '7 août 2026',
    defaultCaption: 'Panorama depuis le rocher de Ronesque',
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } }, onClose: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}

export const SansLegende = { name: 'Sans légende', args: { defaultCaption: '' } }
