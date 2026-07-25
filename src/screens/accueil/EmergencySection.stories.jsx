import { EmergencySection } from './EmergencySection.jsx'
import { EMERGENCY_NUMBERS } from '../../data.js'
import { s } from '../../utils.js'

/** Bloc numéros d'urgence (cliquables `tel:`) + bouton « Ma position ». Utile en
 *  zone de montagne isolée, consultable 100 % hors-ligne. */
export default {
  title: 'Composants/Accueil/EmergencySection',
  component: EmergencySection,
  tags: ['autodocs'],
  args: { sx: s, emergencyNumbers: EMERGENCY_NUMBERS, openMyPosition: () => {} },
  argTypes: { sx: { table: { disable: true } }, openMyPosition: { table: { disable: true } } },
  parameters: { layout: 'padded' },
}

export const ParDefaut = {}
