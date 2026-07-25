import { ChangelogModal } from './ChangelogModal.jsx'
import { s } from '../utils.js'

/** Historique des versions : liste tous les builds du `CHANGELOG` et leurs
 *  nouveautés, le build courant étant marqué « · actuel ». */
export default {
  title: 'Modals/ChangelogModal',
  component: ChangelogModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    currentBuild: 114,
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const SansBuildCourant = { name: 'Sans build courant', args: { currentBuild: null } }
