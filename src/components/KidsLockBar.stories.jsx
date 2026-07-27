import { KidsLockBar } from './KidsLockBar.jsx'
import { makeUnlockChallenge } from '../kids-lock.js'
import { s } from '../utils.js'

/**
 * Bandeau du mode « prêté aux enfants » : rappelle que l'app est verrouillée
 * et propose le défi de déverrouillage (une multiplication, hors de portée
 * d'un jeune enfant mais sans code à retenir pour les parents).
 */
export default {
  title: 'Composants/KidsLockBar',
  component: KidsLockBar,
  tags: ['autodocs'],
  args: { sx: s, challenge: makeUnlockChallenge(42), onUnlock: () => {} },
  argTypes: { sx: { table: { disable: true } }, onUnlock: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = { name: 'Verrouillé' }
export const AutreDefi = { name: 'Autre défi (graine différente)', args: { challenge: makeUnlockChallenge(7) } }
