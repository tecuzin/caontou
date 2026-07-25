import { OfflineCheck } from './OfflineCheck.jsx'
import { s } from '../utils.js'
import {
  TRIP_INITIAL, DAYS_INITIAL, MEALS_INITIAL, VISITS_INITIAL,
  LOGI_INITIAL, COURSES_INITIAL,
} from '../data.js'

// `storeData` est une FONCTION : l'écran appelle storeData() et passe le
// résultat à offlineChecks().
const storeComplet = () => ({
  trip: TRIP_INITIAL, days: DAYS_INITIAL, meals: MEALS_INITIAL, visits: VISITS_INITIAL,
  logi: LOGI_INITIAL, courses: COURSES_INITIAL, hebergement: { name: 'Gîte de Vezels-Roussy' },
})

/** Écran « Prêt hors-ligne ? » : diagnostics de disponibilité locale,
 *  fonctions exigeant du réseau, et pré-chargement des tuiles de carte. */
export default {
  title: 'Écrans/OfflineCheck',
  component: OfflineCheck,
  tags: ['autodocs'],
  args: { sx: s, storeData: storeComplet },
  argTypes: { sx: { table: { disable: true } }, storeData: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}

export const PresquePret = {
  name: 'Presque prêt (données manquantes)',
  args: { storeData: () => ({ trip: TRIP_INITIAL, visits: VISITS_INITIAL }) },
}
