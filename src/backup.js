import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

// Les 15 clés du store cantou.v1 — utilisées pour construire l'export et
// reconnaître un JSON importé comme un export Cantou valide.
export const STORE_KEYS = ['saved', 'checks', 'expenses', 'meals', 'shoppingItems', 'days', 'visits', 'meteo', 'trajets', 'trajetSteps', 'trip', 'logi', 'courses', 'budgetTotal', 'hebergement', 'trajetCheckItems']

/** Construit le JSON d'export (enveloppe app/schema/exportedAt + données). */
export function buildExport(data, schema) {
  return JSON.stringify({
    app: 'cantou',
    schema,
    exportedAt: new Date().toISOString(),
    data,
  }, null, 2)
}

/** Nom de fichier horodaté pour un export. */
export function exportFilename(date = new Date()) {
  const ts = date.toISOString().slice(0, 16).replace(/[T:]/g, '-')
  return `cantou-export-${ts}.json`
}

/**
 * Valide un texte JSON importé. Retourne { data } si c'est un export Cantou
 * reconnu (enveloppé { app:'cantou', data:{…} } ou store brut), sinon
 * { error } avec un message explicite pour l'utilisateur.
 */
export function parseImport(text) {
  if (!text.trim()) return { data: null, error: '' }
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return { data: null, error: 'JSON invalide — vérifier le contenu collé.' }
  }
  const data = parsed && parsed.app === 'cantou' && parsed.data ? parsed.data : parsed
  if (!data || typeof data !== 'object' || !STORE_KEYS.some((k) => k in data)) {
    return { data: null, error: 'Ce JSON ne ressemble pas à un export Cantou.' }
  }
  return { data, error: '' }
}

/** Déclenche un téléchargement navigateur du contenu comme fichier .json. */
export function downloadExport(content, filename) {
  try {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  } catch { }
}

/**
 * Partage natif du fichier d'export vers Telegram/WhatsApp/etc.
 * Natif Android : écrit dans le cache puis ouvre le sheet de partage système.
 * Web : Web Share API (fichier si possible, sinon texte), sinon téléchargement.
 */
export async function shareExport(content, filename) {
  try {
    if (Capacitor.isNativePlatform()) {
      await Filesystem.writeFile({ path: filename, data: content, directory: Directory.Cache, encoding: Encoding.UTF8 })
      const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache })
      await Share.share({ title: 'Export Cantou', text: 'Sauvegarde des données Cantou', url: uri, dialogTitle: 'Envoyer la sauvegarde' })
    } else if (navigator.canShare && navigator.share) {
      const file = new File([content], filename, { type: 'application/json' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Export Cantou' })
      } else {
        await navigator.share({ title: 'Export Cantou', text: content })
      }
    } else {
      downloadExport(content, filename)
    }
  } catch { }
}
