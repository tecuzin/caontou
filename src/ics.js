import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

/**
 * Génération d'événements iCalendar (.ics) 100 % offline — pour partager une
 * activité du planning avec des proches (Google Calendar, Apple, Outlook
 * importent nativement le format).
 */

/** Échappe les caractères réservés du format iCalendar (RFC 5545). */
export function escapeIcs(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** "2026-08-07" + "10:30" → "20260807T103000" (heure locale flottante). */
function icsDateTime(dateIso, time) {
  const d = dateIso.replace(/-/g, '')
  const m = String(time || '').match(/(\d{1,2}):(\d{2})/)
  if (!m) return null
  return `${d}T${m[1].padStart(2, '0')}${m[2]}00`
}

/**
 * Construit un fichier .ics pour un événement.
 * @param {object} ev — { title, dateIso ('yyyy-mm-dd'), time ('HH:MM' ou ''),
 *   durationMin (défaut 120), location, description }
 */
export function buildIcs(ev) {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}@cantou`
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cantou//Vacances Cantal//FR',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
  ]
  const start = icsDateTime(ev.dateIso, ev.time)
  if (start) {
    lines.push(`DTSTART:${start}`)
    const m = ev.time.match(/(\d{1,2}):(\d{2})/)
    const endDate = new Date(2000, 0, 1, parseInt(m[1]), parseInt(m[2]) + (ev.durationMin ?? 120))
    const hh = String(endDate.getHours()).padStart(2, '0')
    const mm = String(endDate.getMinutes()).padStart(2, '0')
    lines.push(`DTEND:${ev.dateIso.replace(/-/g, '')}T${hh}${mm}00`)
  } else {
    // Pas d'horaire → événement « journée entière »
    lines.push(`DTSTART;VALUE=DATE:${ev.dateIso.replace(/-/g, '')}`)
  }
  lines.push(`SUMMARY:${escapeIcs(ev.title)}`)
  if (ev.location) lines.push(`LOCATION:${escapeIcs(ev.location)}`)
  if (ev.description) lines.push(`DESCRIPTION:${escapeIcs(ev.description)}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

/**
 * Partage un .ics via la feuille de partage système (natif) ou Web Share /
 * téléchargement (web). Même pattern que shareExport (backup.js).
 */
export async function shareIcs(content, filename = 'cantou-evenement.ics') {
  try {
    if (Capacitor.isNativePlatform()) {
      await Filesystem.writeFile({ path: filename, data: content, directory: Directory.Cache, encoding: Encoding.UTF8 })
      const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache })
      await Share.share({ title: 'Événement Cantou', text: 'Invitation — séjour dans le Cantal', url: uri, dialogTitle: "Partager l'événement" })
    } else if (navigator.canShare && navigator.share) {
      const file = new File([content], filename, { type: 'text/calendar' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Événement Cantou' })
        return
      }
      await navigator.share({ title: 'Événement Cantou', text: content })
    } else {
      const blob = new Blob([content], { type: 'text/calendar' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    }
  } catch { }
}
