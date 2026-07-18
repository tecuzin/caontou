import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { hasJournalEntry } from './journal.js'
import { tripDate } from './utils.js'

/**
 * Album souvenir de fin de séjour — génère un « carnet de voyage » HTML
 * autonome (CSS inline, palette crème/vert de l'app) à partir des données déjà
 * présentes dans le store : journal de bord + photos regroupées par journée.
 *
 * Module pur (testable sans Capacitor) pour la construction du HTML ; seul le
 * partage (`shareAlbum`) touche le natif, sur le même modèle que backup.js.
 * Aucune dépendance npm : le HTML est assemblé à la main, échappé pour éviter
 * toute injection de texte utilisateur.
 */

/** Échappe un texte pour l'insérer sans risque dans du HTML. */
export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * True s'il y a de quoi faire un album : au moins une entrée de journal remplie
 * ou au moins une photo dans un groupe.
 */
export function albumHasContent(days, journal = {}, photosByDay = []) {
  const hasJournal = days.some((d) => hasJournalEntry(journal[`${d.dow} ${d.num}`]))
  const hasPhotos = photosByDay.some((g) => g.photos && g.photos.length)
  return hasJournal || hasPhotos
}

/** Formate la plage de dates du séjour en français (« 5 – 15 août 2026 »). */
function formatDateRange(trip) {
  if (!trip?.start || !trip?.end) return ''
  const start = tripDate(trip.start)
  const end = tripDate(trip.end)
  const startTxt = start.toLocaleDateString('fr-FR', { day: 'numeric' })
  const endTxt = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${startTxt} – ${endTxt}`
}

/** Rend un paragraphe libellé (❌ si vide) — texte échappé. */
function renderField(label, value) {
  const v = (value || '').trim()
  if (!v) return ''
  const body = escapeHtml(v).replace(/\n/g, '<br>')
  return `<p class="field">${label ? `<span class="label">${escapeHtml(label)}</span> ` : ''}${body}</p>`
}

/**
 * Construit le document HTML complet et autonome de l'album.
 * @param {object} p
 * @param {object} p.trip           paramètres du voyage (destination, dates)
 * @param {Array}  p.days           planning (dow/num/title)
 * @param {object} p.journal        entrées de journal par clé `${dow} ${num}`
 * @param {Array}  p.photosByDay    groupes { key, label, photos } (groupPhotosByDay)
 * @param {object} p.srcMap         id de photo -> URL affichable (seules les
 *                                  data-URL sont embarquées, le reste ignoré)
 * @returns {string} document HTML autonome (à écrire dans un fichier / partager)
 */
export function buildAlbumHtml({ trip = {}, days = [], journal = {}, photosByDay = [], srcMap = {} }) {
  const dest = escapeHtml(trip.destination || 'Notre séjour')
  const dates = escapeHtml(formatDateRange(trip))
  const photoGroups = new Map(photosByDay.map((g) => [g.key, g]))

  const sections = []
  days.forEach((d) => {
    const key = `${d.dow} ${d.num}`
    const entry = journal[key]
    const group = photoGroups.get(key)
    const photos = (group?.photos || []).filter((meta) => {
      const src = srcMap[meta.id]
      return typeof src === 'string' && src.startsWith('data:')
    })
    if (!hasJournalEntry(entry) && !photos.length) return

    const parts = [`<h2>${escapeHtml(`${d.dow} ${d.num} — ${d.title}`)}</h2>`]
    if (entry?.mood) parts.push(`<p class="mood">${escapeHtml(entry.mood)}</p>`)
    parts.push(renderField('', entry?.text))
    parts.push(renderField('⭐ Moment préféré :', entry?.best))
    parts.push(renderField('💬 Phrase du jour :', entry?.quote))
    if (photos.length) {
      const thumbs = photos
        .map((meta) => `<img src="${escapeHtml(srcMap[meta.id])}" alt="">`)
        .join('')
      parts.push(`<div class="photos">${thumbs}</div>`)
    }
    sections.push(`<section class="day">${parts.filter(Boolean).join('')}</section>`)
  })

  const body = sections.length
    ? sections.join('\n')
    : '<section class="day"><p class="field">Aucun souvenir enregistré pour le moment.</p></section>'

  // Palette on-brand (crème/vert) — uniquement des couleurs existantes de l'app.
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Album souvenir — ${dest}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #f4ecdc; color: #2f2a22; font-family: -apple-system, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 24px 16px 40px; }
.wrap { max-width: 640px; margin: 0 auto; }
.cover { background: #4a5d3a; color: #fffaf0; border-radius: 20px; padding: 40px 24px; text-align: center; box-shadow: 0 8px 20px rgba(74,93,58,0.2); margin-bottom: 24px; }
.cover .emoji { font-size: 44px; }
.cover h1 { font-size: 26px; margin-top: 12px; }
.cover .dates { font-size: 15px; color: #efe6d4; margin-top: 8px; }
.day { background: #fffdf8; border: 1px solid #efe6d4; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(74,93,58,0.1); }
.day h2 { font-size: 19px; color: #4a5d3a; margin-bottom: 12px; }
.mood { font-size: 22px; margin-bottom: 8px; }
.field { font-size: 15px; margin-bottom: 8px; }
.field .label { font-weight: 700; color: #9c6b4a; }
.photos { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 12px; }
.photos img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 14px; display: block; background: #efe6d4; }
footer { text-align: center; font-size: 13px; color: #6b6354; margin-top: 24px; }
</style>
</head>
<body>
<div class="wrap">
<header class="cover">
<div class="emoji">📕</div>
<h1>${dest}</h1>
${dates ? `<div class="dates">${dates}</div>` : ''}
</header>
${body}
<footer>Album souvenir · Cantou 🏔️</footer>
</div>
</body>
</html>`
}

/** Nom de fichier horodaté pour l'album. */
export function albumFilename(date = new Date()) {
  const ts = date.toISOString().slice(0, 10)
  return `cantou-album-${ts}.html`
}

/** Déclenche un téléchargement navigateur du HTML de l'album. */
export function downloadAlbum(html, filename) {
  try {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  } catch { }
}

/**
 * Sur natif, les photos sont référencées dans srcMap par une URL locale
 * (convertFileSrc), pas une data-URL — donc non embarquables dans un HTML
 * partagé. On lit alors les fichiers en base64 pour produire un srcMap 100 %
 * data-URL, afin que l'album reste autonome et lisible hors ligne.
 */
export async function buildNativeSrcMap(photosByDay, srcMap = {}) {
  const out = { ...srcMap }
  for (const group of photosByDay) {
    for (const meta of group.photos || []) {
      if (typeof out[meta.id] === 'string' && out[meta.id].startsWith('data:')) continue
      try {
        const { data } = await Filesystem.readFile({ path: meta.file, directory: Directory.Data })
        out[meta.id] = `data:image/jpeg;base64,${data}`
      } catch { }
    }
  }
  return out
}

/**
 * Partage/sauvegarde l'album HTML. Fonctionne hors ligne.
 * Natif Android : écrit le fichier dans le cache puis ouvre la feuille de
 * partage système (Telegram/WhatsApp/Fichiers…). Web : Web Share API avec
 * fichier si possible, sinon téléchargement.
 */
export async function shareAlbum(html, filename = albumFilename()) {
  try {
    if (Capacitor.isNativePlatform()) {
      await Filesystem.writeFile({ path: filename, data: html, directory: Directory.Cache, encoding: Encoding.UTF8 })
      const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache })
      await Share.share({ title: 'Album souvenir Cantou', text: 'Notre carnet de voyage 📕', url: uri, dialogTitle: "Partager l'album" })
    } else if (navigator.canShare && navigator.share) {
      const file = new File([html], filename, { type: 'text/html' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Album souvenir Cantou' })
      } else {
        downloadAlbum(html, filename)
      }
    } else {
      downloadAlbum(html, filename)
    }
  } catch { }
}
