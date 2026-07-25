import { CarSpot } from './CarSpot.jsx'
import { s } from '../utils.js'

/**
 * Carte « Mémo voiture » : mémorise l'endroit où on s'est garé (GPS) et propose
 * d'y retourner. Deux états selon qu'une position est enregistrée (`carSpot`).
 */
export default {
  title: 'Composants/CarSpot',
  component: CarSpot,
  tags: ['autodocs'],
  args: { sx: s, parkCar: () => {}, findCar: () => {}, forgetCar: () => {} },
  argTypes: {
    sx: { table: { disable: true } },
    parkCar: { table: { disable: true } }, findCar: { table: { disable: true } }, forgetCar: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
}

export const NonGare = { name: 'Pas encore garé', args: { carSpot: null } }
export const Gare = {
  name: 'Position mémorisée',
  args: { carSpot: { at: Date.now() - 20 * 60 * 1000, lat: 44.9256, lng: 2.4432 } },
}
