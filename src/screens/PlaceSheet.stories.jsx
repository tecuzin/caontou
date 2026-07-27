import { PlaceSheet } from './PlaceSheet.jsx'
import { s } from '../utils.js'

/**
 * Fiche de visite — infos pratiques d'une sortie, consultables **sans réseau**
 * sur place. Les champs non renseignés ne s'affichent pas : sur le terrain, un
 * trou vaut mieux qu'une information inventée.
 */
export default {
  title: 'Écrans/PlaceSheet',
  component: PlaceSheet,
  tags: ['autodocs'],
  args: { sx: s },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const FicheComplete = {
  name: 'Fiche complète',
  args: {
    sheet: {
      id: 'demo', emoji: '💧', name: 'Exemple de fiche', town: 'Carladès',
      summary: 'Une balade courte le long de la rivière.',
      access: 'Parking gratuit au départ du sentier.',
      duration: '1 h 30 aller-retour', difficulty: 'Facile · 80 m de dénivelé',
      withKids: 'Poussette déconseillée (escaliers)', safety: 'Passerelles avec garde-corps ; tenir les petits.',
      season: 'Praticable d’avril à octobre',
      coords: { lat: 44.98, lng: 2.63 },
      sources: ['https://exemple.fr/fiche'],
    },
  },
}

export const FichePartielle = {
  name: 'Champs manquants (non affichés)',
  args: {
    sheet: {
      id: 'partiel', emoji: '🪨', name: 'Fiche incomplète', town: 'Carladès',
      summary: 'Seules les infos vérifiées apparaissent.',
      access: 'Depuis la D57.', duration: '', difficulty: '   ', withKids: '', safety: '', season: '',
      coords: null, sources: ['https://exemple.fr/source'],
    },
  },
}

export const Introuvable = { name: 'Fiche absente', args: { sheet: null } }
