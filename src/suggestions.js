import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'

/**
 * Formate la liste des suggestions en message texte lisible directement
 * dans Telegram/WhatsApp — pas de JSON à parser côté humain.
 */
export function formatSuggestionsMessage(suggestions, now = new Date()) {
  if (!suggestions.length) return ''
  const lines = suggestions.map((sug, i) => {
    const date = new Date(sug.createdAt).toLocaleDateString('fr-FR')
    return `${i + 1}. [${date}] ${sug.text}`
  })
  const sentAt = now.toLocaleDateString('fr-FR') + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `💡 Suggestions Cantou (${suggestions.length})\n\n${lines.join('\n')}\n\nEnvoyé depuis l'app le ${sentAt}`
}

/**
 * Partage les suggestions en texte brut (natif Android via Share, ou
 * Web Share API, sinon copie dans le presse-papiers en dernier recours).
 */
export async function shareSuggestions(suggestions) {
  const text = formatSuggestionsMessage(suggestions)
  if (!text) return
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ title: 'Suggestions Cantou', text })
    } else if (navigator.share) {
      await navigator.share({ title: 'Suggestions Cantou', text })
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
  } catch { }
}
