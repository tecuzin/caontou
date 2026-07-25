import { Reglages } from './Reglages.jsx'
import { s } from '../utils.js'

/** Écran Réglages : activer/désactiver les modules (features), relancer
 *  l'assistant, gérer le tracking de parcours. */
export default {
  title: 'Écrans/Reglages',
  component: Reglages,
  tags: ['autodocs'],
  args: {
    sx: s, isOn: () => true, toggleFeature: () => {}, relaunchOnboarding: () => {},
    trackingCount: 12, onShareTracking: () => {}, onResetTracking: () => {},
  },
  argTypes: { sx: { table: { disable: true } }, isOn: { table: { disable: true } }, toggleFeature: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
