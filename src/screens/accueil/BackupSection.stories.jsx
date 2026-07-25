import { BackupSection } from './BackupSection.jsx'
import { s } from '../../utils.js'

/** Section « Sauvegarde & données » de l'accueil : export/import JSON, autotest,
 *  quoi de neuf, et date de dernière sauvegarde. */
export default {
  title: 'Composants/Accueil/BackupSection',
  component: BackupSection,
  tags: ['autodocs'],
  args: {
    sx: s, formatLastBackup: () => 'il y a 2 h',
    setExportCopied: () => {}, setShowExport: () => {}, setShowImport: () => {},
    runSelfTestAndShow: () => {}, openChangelog: () => {},
  },
  argTypes: {
    sx: { table: { disable: true } }, formatLastBackup: { table: { disable: true } },
    setExportCopied: { table: { disable: true } }, setShowExport: { table: { disable: true } }, setShowImport: { table: { disable: true } },
    runSelfTestAndShow: { table: { disable: true } }, openChangelog: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
}

export const JamaisSauvegarde = { name: 'Jamais sauvegardé', args: { lastBackupAt: null } }
export const SauvegardeRecente = { name: 'Sauvegarde récente', args: { lastBackupAt: Date.now() - 2 * 3600 * 1000 } }
