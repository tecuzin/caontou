/**
 * Tracking des parcours de navigation, **100 % local et hors-ligne**, pour
 * optimiser l'UX. On n'enregistre que des évènements de navigation anonymes
 * (`{ t: timestamp, type, key }`) — aucune donnée personnelle, aucun contenu
 * saisi. Stocké sous une clé localStorage **séparée** (`cantou.track`) pour ne
 * pas alourdir le store principal ni les instantanés Undo. Le partage (JSON via
 * la feuille système, ex. Telegram) est **explicite** et à l'initiative de
 * l'utilisateur.
 */
import { Capacitor } from '@capacitor/core'

export const TRACK_KEY = 'cantou.track'
export const TRACK_CAP = 300 // journal en anneau : on ne garde que les N derniers

/** Ajoute un évènement et borne le journal aux `cap` derniers (pur). */
export function appendEvent(events, event, cap = TRACK_CAP) {
  const next = [...(events || []), event]
  return next.length > cap ? next.slice(next.length - cap) : next
}

/** Enveloppe d'export analysable (pur). */
export function buildTrackingExport(events, meta = {}) {
  return {
    app: 'cantou-ux',
    schema: 1,
    build: meta.build ?? null,
    exportedAt: (meta.now ? new Date(meta.now) : new Date()).toISOString(),
    count: (events || []).length,
    events: events || [],
  }
}

/** Résumé rapide pour affichage local : total, par type, par écran (pur). */
export function summarize(events) {
  const byType = {}
  const byKey = {}
  for (const e of events || []) {
    byType[e.type] = (byType[e.type] || 0) + 1
    if (e.key) byKey[e.key] = (byKey[e.key] || 0) + 1
  }
  return { total: (events || []).length, byType, byKey }
}

// --- Persistance (clé séparée) ---
export function loadTrack() {
  try { const raw = localStorage.getItem(TRACK_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
export function saveTrack(events) {
  try { localStorage.setItem(TRACK_KEY, JSON.stringify(events)) } catch { /* quota/prive */ }
}
export function clearTrack() {
  try { localStorage.removeItem(TRACK_KEY) } catch { /* ignore */ }
}

/** Enregistre un évènement de navigation (append + cap + save). */
export function track(type, key) {
  saveTrack(appendEvent(loadTrack(), { t: Date.now(), type, key: String(key ?? '') }))
}

/** Partage le journal de parcours en JSON via la feuille système. */
export async function shareTracking(text) {
  if (!text) return
  try {
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import('@capacitor/share')
      await Share.share({ title: 'Parcours Cantou (UX)', text })
    } else if (navigator.share) {
      await navigator.share({ title: 'Parcours Cantou (UX)', text })
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
  } catch { /* partage annulé/indispo */ }
}
