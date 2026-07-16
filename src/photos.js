/**
 * Galerie photo du séjour — helpers purs (testables sans Capacitor).
 * Les fichiers image vivent dans Directory.Data (Filesystem), seules les
 * métadonnées { id, file, day, takenAt } vont dans le store `cantou.v1`.
 */

export const OTHER_DAY_KEY = 'autres'

/** Identifiant unique d'une photo. */
export function photoId() {
  return crypto.randomUUID()
}

/**
 * Clé de journée (`"Mer 5"`) pour une date donnée, en croisant la fenêtre du
 * voyage (mois/année dérivés de trip.start, comme le tableau « Aujourd'hui »).
 * Retourne OTHER_DAY_KEY si la date ne tombe sur aucun jour du planning.
 */
export function dayKeyForDate(trip, days, date = new Date()) {
  const [ty, tm] = trip.start.split('-').map(Number)
  const match = days.find((d) => {
    const dd = new Date(ty, tm - 1, d.num)
    return dd.getFullYear() === date.getFullYear() && dd.getMonth() === date.getMonth() && dd.getDate() === date.getDate()
  })
  return match ? `${match.dow} ${match.num}` : OTHER_DAY_KEY
}

/**
 * Regroupe les photos par journée, dans l'ordre du planning, avec un groupe
 * « Autres photos » en fin pour celles hors séjour.
 * @returns {Array<{ key, label, photos }>} — seulement les groupes non vides.
 */
export function groupPhotosByDay(photos, days) {
  // Les reçus (attachés à une dépense) ne font pas partie de la galerie souvenirs.
  photos = photos.filter((p) => p.kind !== 'receipt')
  const groups = []
  days.forEach((d) => {
    const key = `${d.dow} ${d.num}`
    const list = photos.filter((p) => p.day === key)
    if (list.length) groups.push({ key, label: `${d.dow} ${d.num} — ${d.title}`, photos: list })
  })
  const others = photos.filter((p) => p.day === OTHER_DAY_KEY || !days.some((d) => `${d.dow} ${d.num}` === p.day))
  if (others.length) groups.push({ key: OTHER_DAY_KEY, label: 'Autres photos', photos: others })
  return groups
}
