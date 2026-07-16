import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'

/**
 * Journal de bord du séjour — une entrée par jour (humeur, moment préféré,
 * phrase du jour), stockée dans le store sous `journal`, clé `${dow} ${num}`.
 */

export const MOODS = ['😍', '😊', '🙂', '😴', '🌧️']

/** True si l'entrée contient au moins un champ rempli. */
export function hasJournalEntry(entry) {
  return !!(entry && (entry.text?.trim() || entry.best?.trim() || entry.quote?.trim() || entry.mood))
}

/** Court extrait d'une entrée pour l'aperçu (Souvenirs). */
export function journalSnippet(entry, max = 90) {
  const raw = (entry?.text || entry?.best || entry?.quote || '').trim().replace(/\s+/g, ' ')
  return raw.length > max ? `${raw.slice(0, max - 1)}…` : raw
}

/** Compile le journal complet en texte partageable. */
export function buildJournalText(days, journal) {
  const parts = []
  days.forEach((d) => {
    const key = `${d.dow} ${d.num}`
    const e = journal[key]
    if (!hasJournalEntry(e)) return
    const lines = [`${d.dow} ${d.num} — ${d.title}`]
    if (e.mood) lines.push(`Humeur : ${e.mood}`)
    if (e.text?.trim()) lines.push(e.text.trim())
    if (e.best?.trim()) lines.push(`⭐ Moment préféré : ${e.best.trim()}`)
    if (e.quote?.trim()) lines.push(`💬 Phrase du jour : ${e.quote.trim()}`)
    parts.push(lines.join('\n'))
  })
  if (!parts.length) return ''
  return `📔 Journal de bord — Cantou, Carladès\n\n${parts.join('\n\n')}`
}

/** Partage le journal en texte (Telegram/WhatsApp via la feuille système). */
export async function shareJournal(days, journal) {
  const text = buildJournalText(days, journal)
  if (!text) return
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ title: 'Journal de bord Cantou', text })
    } else if (navigator.share) {
      await navigator.share({ title: 'Journal de bord Cantou', text })
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
  } catch { }
}
