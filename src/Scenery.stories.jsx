import { Ridge, Panorama, GiteScene } from './Scenery.jsx'

/**
 * Décors SVG maison (aucune image) : crêtes, panorama de montagne et scène du
 * gîte. Utilisés en en-tête d'écrans. Purs, sans dépendance.
 */
export default {
  title: 'Composants/Scenery',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export const PanoramaMontagne = { name: 'Panorama', render: () => <Panorama /> }
export const Gite = { name: 'GiteScene', render: () => <GiteScene /> }
export const Crete = {
  name: 'Ridge (crête)',
  render: () => (
    <div style={{ position: 'relative', height: 120, width: 320, background: '#dbe7d2', borderRadius: 12, overflow: 'hidden' }}>
      <Ridge opacity={0.25} />
    </div>
  ),
}
