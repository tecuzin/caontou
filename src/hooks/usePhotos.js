import { useState, useRef, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { photoId, dayKeyForDate } from '../photos.js'

const PHOTO_DIR = 'cantou-photos'

/**
 * Photos du séjour : fichiers JPEG dans Directory.Data (via Filesystem),
 * métadonnées dans le store. `srcMap` fournit une URL affichable par photo
 * (convertFileSrc en natif, data-URL en web).
 */
export function usePhotos(initial, trip, days) {
  const [photos, setPhotos] = useState(initial || [])
  const [srcMap, setSrcMap] = useState({})
  const dirReady = useRef(false)

  const ensureDir = async () => {
    if (dirReady.current) return
    try { await Filesystem.mkdir({ path: PHOTO_DIR, directory: Directory.Data, recursive: true }) } catch { }
    dirReady.current = true
  }

  /**
   * Prend une photo (source='camera') ou importe depuis la galerie ('photos').
   * `extra` enrichit la métadonnée (ex. { kind: 'receipt' } pour un reçu, exclu
   * de la galerie souvenirs).
   */
  const capturePhoto = async (source = 'camera', extra = {}) => {
    try {
      const shot = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        quality: 80,
        correctOrientation: true,
      })
      if (!shot?.base64String) return null
      await ensureDir()
      const id = photoId()
      const file = `${PHOTO_DIR}/${id}.jpeg`
      await Filesystem.writeFile({ path: file, data: shot.base64String, directory: Directory.Data })
      const meta = { id, file, day: dayKeyForDate(trip, days), takenAt: new Date().toISOString(), ...extra }
      setPhotos((p) => [...p, meta])
      setSrcMap((m) => ({ ...m, [id]: `data:image/jpeg;base64,${shot.base64String}` }))
      return meta
    } catch {
      return null // permission refusée ou annulation utilisateur
    }
  }

  const deletePhoto = async (id) => {
    const meta = photos.find((p) => p.id === id)
    setPhotos((p) => p.filter((x) => x.id !== id))
    setSrcMap((m) => { const n = { ...m }; delete n[id]; return n })
    if (meta) { try { await Filesystem.deleteFile({ path: meta.file, directory: Directory.Data }) } catch { } }
  }

  /** Charge (si besoin) l'URL affichable d'une photo dans srcMap. */
  const loadSrc = useCallback(async (meta) => {
    if (srcMap[meta.id]) return
    try {
      if (Capacitor.isNativePlatform()) {
        const { uri } = await Filesystem.getUri({ path: meta.file, directory: Directory.Data })
        setSrcMap((m) => ({ ...m, [meta.id]: Capacitor.convertFileSrc(uri) }))
      } else {
        const { data } = await Filesystem.readFile({ path: meta.file, directory: Directory.Data })
        setSrcMap((m) => ({ ...m, [meta.id]: `data:image/jpeg;base64,${data}` }))
      }
    } catch { }
  }, [srcMap])

  /** Partage toutes les photos d'une journée (feuille système → Telegram…). */
  const shareDay = async (metas, label) => {
    if (!metas.length) return
    const text = `${label} — ${metas.length} photo${metas.length > 1 ? 's' : ''} du séjour dans le Cantal 🏔️`
    try {
      if (Capacitor.isNativePlatform()) {
        const files = []
        for (const meta of metas) {
          const { uri } = await Filesystem.getUri({ path: meta.file, directory: Directory.Data })
          files.push(uri)
        }
        await Share.share({ title: 'Photos Cantou', text, files, dialogTitle: 'Partager cette journée' })
      } else if (navigator.share) {
        await navigator.share({ title: 'Photos Cantou', text })
      }
    } catch { }
  }

  return { photos, setPhotos, srcMap, capturePhoto, deletePhoto, loadSrc, shareDay }
}
