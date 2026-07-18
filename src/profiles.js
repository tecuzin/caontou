/**
 * Multi-séjours / modèles réutilisables.
 *
 * Un « profil » est un instantané complet du store `cantou.v1` (voir
 * currentStoreData() dans App.jsx et STORE_KEYS dans backup.js), sauvegardé
 * sous un nom lisible. Les profils vivent dans une clé localStorage SÉPARÉE
 * (`cantou.profiles`) : ils ne touchent JAMAIS `cantou.v1`. Charger un profil
 * réécrit `cantou.v1` puis recharge l'app (logique orchestrée dans l'écran).
 *
 * Forme d'un profil : { id, name, savedAt, data }
 *   - id      : identifiant unique (Date.now au moment de l'ajout)
 *   - name    : nom lisible saisi par l'utilisateur
 *   - savedAt : date ISO de la sauvegarde
 *   - data    : instantané complet d'un store cantou.v1
 *
 * Ce module est pur (fonctions sur le tableau) sauf les deux fines enveloppes
 * localStorage load/save en bas.
 */

export const PROFILES_KEY = 'cantou.profiles'

/** Ajoute un profil au tableau (immuable). Retourne un nouveau tableau. */
export function addProfile(list, { name, data }) {
  const profile = {
    id: Date.now(),
    name: String(name || '').trim() || 'Séjour sans nom',
    savedAt: new Date().toISOString(),
    data,
  }
  return [...list, profile]
}

/** Renomme un profil par id (immuable). */
export function renameProfile(list, id, name) {
  const clean = String(name || '').trim()
  if (!clean) return list
  return list.map((p) => (p.id === id ? { ...p, name: clean } : p))
}

/** Supprime un profil par id (immuable). */
export function removeProfile(list, id) {
  return list.filter((p) => p.id !== id)
}

/** Retrouve un profil par id, sinon undefined. */
export function findProfile(list, id) {
  return list.find((p) => p.id === id)
}

/* ------------------------------------------------------------------ *
 * Fines enveloppes localStorage (non testées — effets de bord).
 * ------------------------------------------------------------------ */

/** Charge le tableau de profils depuis localStorage (toujours un tableau). */
export function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Persiste le tableau de profils dans localStorage. */
export function saveProfiles(list) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(list))
  } catch { }
}
