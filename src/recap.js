import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { eur } from './utils.js'

/**
 * Bilan de séjour — agrège les données déjà présentes dans le store en une
 * synthèse partageable. `buildRecapText` est pur (testable) ; `shareRecap`
 * ouvre la feuille de partage système.
 */

/**
 * Agrège les tranches du store en objet « recap » consommé par l'écran Bilan
 * et par buildRecapText. Fonction pure (extraite d'App.jsx) — testable isolément.
 */
export function computeRecap({ days, spent, budgetTotal, spentPct, budgetCats, savedCount, packPct, coursesPct, meals, photos, ratings = {}, visits = [] }) {
  const rated = visits
    .map((v) => ({ name: v.name, emoji: v.emoji, stars: ratings[v.id]?.stars || 0, note: (ratings[v.id]?.note || '').trim() }))
    .filter((r) => r.stars > 0)
    .sort((a, b) => b.stars - a.stars)
  return {
    daysCount: days.length,
    spent, budgetTotal, spentPct,
    topCategories: budgetCats.map((c) => ({ name: c.name, amt: c.amt })),
    savedVisits: savedCount,
    packPct, coursesPct,
    mealsPlanned: meals.length,
    photosCount: photos.length,
    ratedCount: rated.length,
    topRated: rated.filter((r) => r.stars >= 4).slice(0, 5),
    toAvoid: rated.filter((r) => r.stars <= 2),
  }
}

/** Formate le bilan en texte partageable (Telegram/WhatsApp). */
export function buildRecapText(d) {
  const lines = [
    '📊 Notre séjour dans le Cantal',
    '',
    `📅 ${d.daysCount} jour${d.daysCount > 1 ? 's' : ''} sur place`,
    `💶 Budget : ${eur(d.spent)} dépensés sur ${eur(d.budgetTotal)} (${d.spentPct} %)`,
  ]
  if (d.topCategories?.length) {
    const top = d.topCategories.slice(0, 3).map((c) => `${c.name} ${eur(c.amt)}`).join(' · ')
    lines.push(`   → ${top}`)
  }
  lines.push(
    `❤️ ${d.savedVisits} visite${d.savedVisits > 1 ? 's' : ''} coup de cœur`,
    `🧳 Préparatifs : ${d.packPct} % · 🛒 Courses : ${d.coursesPct} %`,
    `🍽️ ${d.mealsPlanned} repas planifiés`,
  )
  if (d.photosCount) lines.push(`📸 ${d.photosCount} photo${d.photosCount > 1 ? 's' : ''} souvenir`)
  if (d.topRated?.length) {
    lines.push(`⭐ Coups de cœur : ${d.topRated.map((r) => `${r.name} (${r.stars}★)`).join(', ')}`)
  }
  lines.push('', 'Vivement la prochaine aventure ! 🏔️')
  return lines.join('\n')
}

/** Partage le bilan en texte via la feuille système. */
export async function shareRecap(d) {
  const text = buildRecapText(d)
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ title: 'Bilan du séjour Cantou', text })
    } else if (navigator.share) {
      await navigator.share({ title: 'Bilan du séjour Cantou', text })
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
  } catch { }
}
