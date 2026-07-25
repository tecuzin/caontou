import { ImportModal } from './ImportModal.jsx'
import { s } from '../utils.js'

const previewData = {
  expenses: [{ label: 'Acompte gîte', cat: 'Hébergement', amt: 360 }, { label: 'Essence', cat: 'Transport', amt: 95 }],
  meals: [{ id: 1, day: 'Jeu 6', dish: 'Pates au pesto' }],
  visits: [{ id: 1, name: 'Pas de Cère' }, { id: 8, name: 'Rocher de Ronesque' }],
  days: [{ dow: 'Mer', num: 5 }, { dow: 'Jeu', num: 6 }, { dow: 'Ven', num: 7 }],
}
const validJson = JSON.stringify({ app: 'cantou', schema: 'cantou.v1', exportedAt: '2026-07-24T10:00:00.000Z', data: previewData }, null, 2)

/** Feuille « Importer des données » : coller un export Cantou ou choisir un
 *  fichier JSON, aperçu du contenu, puis remplacement complet du store. */
export default {
  title: 'Modals/ImportModal',
  component: ImportModal,
  tags: ['autodocs'],
  args: {
    sx: s,
    isOpen: true,
    importText: validJson,
    setImportText: () => {},
    importError: '',
    importPreview: previewData,
    applyImport: () => {},
    doParseImport: () => {},
    darkMode: false,
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ExportValide = { name: 'Export valide (aperçu)' }
export const Vide = { name: 'Champ vide', args: { importText: '', importPreview: null } }
export const Erreur = {
  name: 'JSON invalide',
  args: { importText: '{ oups', importPreview: null, importError: 'Ce n’est pas un export Cantou valide.' },
}
