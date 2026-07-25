import { Hebergement } from './Hebergement.jsx'
import { s } from '../utils.js'

const hebergement = {
  nom: 'Notre gîte en Carladès', adresse: 'Vezels-Roussy (15130)',
  arrivee: 'Mer 5 · dès 16 h', depart: 'Sam 15 · avant 10 h',
  capacite: '4–5 personnes · 2 chambres · lit bébé fourni',
  wifiNom: 'LaGrange-Gite', wifiPass: 'puymary15', contact: 'Mme Vidal · 06 12 34 56 78',
  note: '🔥 La maison a son cantou (cheminée traditionnelle).',
}

/** Écran Hébergement : infos du gîte (adresse + « Aller au gîte », arrivée/départ,
 *  capacité, Wi-Fi, contact, équipements) + numéros d'urgence. */
export default {
  title: 'Écrans/Hebergement',
  component: Hebergement,
  tags: ['autodocs'],
  args: { sx: s, hebergement, openHebEdit: () => {} },
  argTypes: { sx: { table: { disable: true } }, openHebEdit: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
