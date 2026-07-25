import { Onboarding } from './Onboarding.jsx'
import { s } from '../utils.js'
import { TRIP_INITIAL } from '../data.js'

/** Écran d'accueil au 1er lancement : présentation + choix des modules à activer. */
export default {
  title: 'Écrans/Onboarding',
  component: Onboarding,
  tags: ['autodocs'],
  args: { sx: s, trip: TRIP_INITIAL, isOn: () => true, toggleFeature: () => {}, onFinish: () => {}, onSkip: () => {} },
  argTypes: { sx: { table: { disable: true } }, isOn: { table: { disable: true } }, toggleFeature: { table: { disable: true } }, onFinish: { table: { disable: true } }, onSkip: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
