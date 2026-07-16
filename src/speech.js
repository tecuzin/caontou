/**
 * Dictée vocale du récit du jour (journal de bord) via la Web Speech API.
 * Disponible dans la WebView Android (webkitSpeechRecognition) et Chrome ;
 * absente sur certains navigateurs → l'UI masque le bouton dans ce cas.
 */

/** Constructeur de reconnaissance vocale disponible sur la plateforme, ou null. */
export function getRecognitionCtor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

/** True si la dictée vocale est utilisable ici. */
export function isSpeechSupported() {
  return !!getRecognitionCtor()
}

/**
 * Démarre une session de dictée. Retourne un contrôleur `{ stop }`, ou null si
 * la plateforme ne sait pas dicter / si le démarrage échoue.
 * - `onSegment(text)` : appelé pour chaque bribe finalisée (à concaténer au récit).
 * - `onEnd()`         : la reconnaissance s'est arrêtée (fin naturelle ou stop()).
 * - `onError(code)`   : erreur ('not-allowed' = micro refusé, 'unsupported', …).
 */
export function startDictation({ lang = 'fr-FR', onSegment, onEnd, onError } = {}) {
  const Ctor = getRecognitionCtor()
  if (!Ctor) { onError?.('unsupported'); return null }
  const rec = new Ctor()
  rec.lang = lang
  rec.continuous = true
  rec.interimResults = false
  rec.onresult = (ev) => {
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i]
      if (r && r.isFinal) {
        const t = r[0]?.transcript?.trim()
        if (t) onSegment?.(t)
      }
    }
  }
  rec.onerror = (ev) => onError?.(ev?.error || 'error')
  rec.onend = () => onEnd?.()
  try { rec.start() } catch { onError?.('start-failed'); return null }
  return { stop: () => { try { rec.stop() } catch { /* déjà arrêté */ } } }
}

/** Concatène une bribe dictée au récit existant (espace de séparation propre). */
export function appendSegment(base, segment) {
  const b = (base || '').trimEnd()
  const s = (segment || '').trim()
  if (!s) return base || ''
  return b ? `${b} ${s}` : s
}
