import { SelftestModal } from './SelftestModal.jsx'
import { s } from '../utils.js'

const results = [
  { name: 'Stockage local accessible', pass: true, detail: 'OK' },
  { name: 'Données du séjour chargées', pass: true, detail: 'OK' },
  { name: 'Budget cohérent', pass: true, detail: 'OK' },
  { name: 'Planning non vide', pass: true, detail: 'OK' },
]

/** Feuille « Auto-diagnostic » : résultats des vérifications rapides embarquées,
 *  exécutées directement sur le téléphone. Toujours rendue (pas de `isOpen`). */
export default {
  title: 'Modals/SelftestModal',
  component: SelftestModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    results,
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ToutVert = { name: 'Toutes les vérifications OK' }
export const AvecEchecs = {
  name: 'Avec des échecs',
  args: {
    results: [
      ...results.slice(0, 2),
      { name: 'Budget cohérent', pass: false, detail: 'Total des dépenses supérieur au budget défini' },
      { name: 'Photos accessibles', pass: false, detail: 'Dossier introuvable (permission refusée)' },
    ],
  },
}
