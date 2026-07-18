/**
 * Partage de configuration entre téléphones de la famille, **hors-ligne**.
 * On n'échange qu'un sous-ensemble compact (voyage, visites favorites, budget,
 * fonctions activées) — pas les photos ni les dépenses — assez petit pour tenir
 * dans un QR code / un simple copier-coller. Le reste du séjour se personnalise
 * ensuite sur chaque appareil.
 */

/** Sous-ensemble partageable, clés courtes pour rester compact. */
export function buildSharePayload(store) {
  const s = store || {}
  const savedIds = s.saved ? Object.keys(s.saved).filter((k) => s.saved[k]).map(Number) : []
  return { t: s.trip || null, v: savedIds, b: s.budgetTotal ?? null, f: s.features || {} }
}

/** Sérialise le payload (avec marqueur d'app) en texte transportable. */
export function encodeSharePayload(store) {
  return JSON.stringify({ app: 'cantou-cfg', ...buildSharePayload(store) })
}

/**
 * Parse un texte reçu. Retourne { data, error } — data normalisé
 * ({ trip, savedIds, budgetTotal, features }) ou null + message si invalide.
 */
export function parseSharePayload(text) {
  if (!text || !text.trim()) return { data: null, error: '' }
  let p
  try { p = JSON.parse(text) } catch { return { data: null, error: 'Format illisible — vérifie le texte collé.' } }
  if (!p || p.app !== 'cantou-cfg') return { data: null, error: 'Ce n\'est pas une config Cantou.' }
  return {
    data: {
      trip: p.t && typeof p.t === 'object' ? p.t : null,
      savedIds: Array.isArray(p.v) ? p.v.map(Number).filter(Number.isFinite) : [],
      budgetTotal: typeof p.b === 'number' ? p.b : null,
      features: p.f && typeof p.f === 'object' ? p.f : {},
    },
    error: '',
  }
}

/** Partage le texte de config via la feuille système (Telegram/WhatsApp…). */
export async function shareConfig(text) {
  if (!text) return
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import('@capacitor/share')
      await Share.share({ title: 'Config Cantou', text })
    } else if (navigator.share) {
      await navigator.share({ title: 'Config Cantou', text })
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
  } catch { /* partage annulé/indispo */ }
}

/** Applique une config parsée via les setters de l'app. */
export function applySharedConfig(data, setters = {}) {
  if (!data) return
  const { setTrip, setSaved, setBudgetTotal, setFeatures } = setters
  if (data.trip && setTrip) setTrip(data.trip)
  if (data.budgetTotal != null && setBudgetTotal) setBudgetTotal(data.budgetTotal)
  if (data.features && setFeatures) setFeatures(data.features)
  if (Array.isArray(data.savedIds) && setSaved) {
    setSaved(Object.fromEntries(data.savedIds.map((id) => [id, true])))
  }
}
