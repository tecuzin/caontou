import { SavedIndicator } from './SavedIndicator.jsx'
import { s } from '../utils.js'

/**
 * Pastille « ✓ Enregistré sur ce téléphone », visible ~2 s après chaque
 * écriture. L'app n'ayant aucun cloud, rien ne disait à l'utilisateur que sa
 * saisie était conservée. `role="status"` + `aria-live="polite"` : annoncé
 * aux lecteurs d'écran sans voler le focus.
 */
export default {
  title: 'Composants/SavedIndicator',
  component: SavedIndicator,
  tags: ['autodocs'],
  args: { sx: s, savedAt: Date.now(), duration: 60000 },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

// Durée allongée dans le catalogue, sinon la pastille disparaît avant lecture.
export const Visible = { name: 'Visible (durée allongée pour le catalogue)' }
export const Absent = { name: 'Aucune sauvegarde (ne rend rien)', args: { savedAt: null } }
