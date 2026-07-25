import { AttachPhotoButton } from './AttachPhotoButton.jsx'
import { s } from '../utils.js'

/**
 * Bouton « 📸 » pour attacher une photo à n'importe quel élément. La photo prise
 * rejoint la galerie Souvenirs, étiquetée avec `label`. Rien si `capturePhoto`
 * est absent (permet de le masquer là où la capture n'est pas branchée).
 */
export default {
  title: 'Composants/AttachPhotoButton',
  component: AttachPhotoButton,
  tags: ['autodocs'],
  args: { sx: s, capturePhoto: () => alert('capturePhoto()'), label: 'Château de Messilhac' },
  argTypes: { sx: { table: { disable: true } }, capturePhoto: { table: { disable: true } } },
}

export const Icone = { args: { text: '📸' } }
export const AvecTexte = { name: 'Avec libellé', args: { text: '📸 Photo' } }
export const SansCapture = { name: 'Sans capturePhoto (masqué)', args: { capturePhoto: undefined } }
