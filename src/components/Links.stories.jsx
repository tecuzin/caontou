import { TelLink, MapLink, DriveLink } from './Links.jsx'
import { s } from '../utils.js'

/**
 * Liens actionnables réutilisables — délèguent à l'OS (téléphone / Google Maps).
 * Chacun ne rend **rien** si sa donnée est vide (numéro/lieu absent).
 */
export default {
  title: 'Composants/Liens',
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Trois liens : `TelLink` (appel), `MapLink` (voir sur Maps), `DriveLink` (itinéraire voiture 🚗). Tous prennent le helper de style `sx` du projet.' } },
  },
}

export const Telephone = { render: () => <TelLink sx={s} num="06 12 34 56 78" /> }
export const Lieu = { render: () => <MapLink sx={s} place="Vezels-Roussy (15130)" /> }
export const Itineraire = { render: () => <DriveLink sx={s} place={{ lat: 45.02, lng: 2.66, name: 'Pas de Cère' }} label="Y aller" /> }

export const Ensemble = {
  name: 'Les trois ensemble',
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <TelLink sx={s} num="0612345678" />
      <MapLink sx={s} place="Aurillac" />
      <DriveLink sx={s} place="Aurillac" />
    </div>
  ),
}

export const Vide = {
  name: 'Données vides (ne rend rien)',
  render: () => (
    <div style={{ color: '#9a917f' }}>
      <TelLink sx={s} num="" /><MapLink sx={s} place="" /><DriveLink sx={s} place="" />
      (aucun lien affiché)
    </div>
  ),
}
