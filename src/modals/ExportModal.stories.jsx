import { ExportModal } from './ExportModal.jsx'
import { s } from '../utils.js'

// Sous-ensemble représentatif du store `cantou.v1` (l'export réel contient les
// ~34 clés listées dans backup.js).
const storeData = {
  saved: [1, 6, 8],
  checks: { 'jeu-6-0': true },
  expenses: [
    { label: 'Acompte gîte', cat: 'Hébergement', amt: 360 },
    { label: 'Courses Aurillac', cat: 'Nourriture', amt: 87.4 },
  ],
  meals: [{ id: 1, day: 'Jeu 6', dish: 'Pates au pesto (soir arrivee)' }],
  budgetTotal: 1800,
  trip: { start: '2026-08-05', end: '2026-08-15', origin: 'Beauvais', etape: 'Laschamps', destination: 'Vezels-Roussy (Cantal)' },
  familyMembers: ['David', 'Marie', 'Lina'],
}

/** Feuille « Exporter les données » : JSON complet du store, avec partage natif,
 *  copie presse-papiers et téléchargement. */
export default {
  title: 'Modals/ExportModal',
  component: ExportModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    currentStoreData: () => storeData,
    STORE_KEY: 'cantou.v1',
    darkMode: false,
    onClose: () => {},
    onExportCopied: () => {},
  },
  argTypes: { sx: { table: { disable: true } }, currentStoreData: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const StoreVide = { name: 'Store vide', args: { currentStoreData: () => ({}) } }
