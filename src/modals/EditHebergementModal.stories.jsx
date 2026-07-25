import { EditHebergementModal } from './EditHebergementModal.jsx'
import { s } from '../utils.js'

const hebFields = {
  nom: 'La Grange du Carladès',
  adresse: 'Vezels-Roussy (15130)',
  arrivee: 'Jeu 6 · dès 16:00',
  depart: 'Ven 14 · avant 10:00',
  arriveeDate: '2026-08-06',
  arriveeTime: '16:00',
  departDate: '2026-08-14',
  departTime: '10:00',
  capacite: '4–5 personnes · 2 chambres',
  wifiNom: 'LaGrange-Gite',
  wifiPass: 'cantal2026',
  contact: 'Mme Vidal · 06 12 34 56 78',
}

/** Feuille « Modifier l'hébergement » : nom, adresse, moments d'arrivée/départ
 *  (date + heure natives composées en chaîne lisible), capacité, Wi-Fi, contact. */
export default {
  title: 'Modals/EditHebergementModal',
  component: EditHebergementModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    hebFields,
    setHebFields: () => {},
    darkMode: false,
    onClose: () => {},
    onSubmit: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const SansDatesChoisies = {
  name: 'Dates non choisies (chaînes héritées)',
  args: { hebFields: { ...hebFields, arriveeDate: '', arriveeTime: '', departDate: '', departTime: '' } },
}
