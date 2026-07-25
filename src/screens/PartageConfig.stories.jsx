import { PartageConfig } from './PartageConfig.jsx'
import { s } from '../utils.js'
import { encodeSharePayload } from '../share-config.js'
import { TRIP_INITIAL } from '../data.js'

const payloadText = encodeSharePayload({
  trip: TRIP_INITIAL,
  saved: { 1: true, 5: true, 8: true },
  budgetTotal: 1800,
  features: { extra_search: true, extra_sky: false },
})

// `setters` = ce que consomme applySharedConfig() : setTrip, setSaved,
// setBudgetTotal, setFeatures. Ici des no-op pour la démo du catalogue.
const setters = {
  setTrip: () => {}, setSaved: () => {}, setBudgetTotal: () => {}, setFeatures: () => {},
}

/** Écran Partager la config : QR code + texte copiable (envoi), zone de collage
 *  + application de la config reçue (réception). 100 % hors-ligne. */
export default {
  title: 'Écrans/PartageConfig',
  component: PartageConfig,
  tags: ['autodocs'],
  args: { sx: s, payloadText, onShare: () => {}, setters },
  argTypes: {
    sx: { table: { disable: true } },
    onShare: { table: { disable: true } },
    setters: { table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}

export const SansPartageSysteme = {
  name: 'Sans bouton Partager',
  args: { onShare: null },
}
