import { useState, useEffect } from 'react'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { measureStorage } from '../storage-usage.js'

/**
 * Occupation du stockage (store texte + poids des photos).
 *
 * Mesurée **uniquement quand l'écran Réglages est ouvert** : c'est un `stat()`
 * par fichier photo, hors de question de le refaire à chaque render. Le hook
 * ne renvoie donc rien tant que l'utilisateur n'est pas allé voir.
 *
 * @param {boolean} active  true quand l'écran concerné est affiché
 * @param {Array} photos    métadonnées des photos (pour mesurer les fichiers)
 */
export function useStorageUsage(active, photos) {
  const [storage, setStorage] = useState(null)

  useEffect(() => {
    if (!active) return
    let alive = true
    measureStorage({
      photos,
      statFile: async (file) => (await Filesystem.stat({ path: file, directory: Directory.Data })).size,
    })
      .then((m) => { if (alive) setStorage(m) })
      .catch(() => { /* mesure indisponible : on n'affiche simplement rien */ })
    return () => { alive = false }
  }, [active, photos])

  return storage
}
