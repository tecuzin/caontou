/**
 * Bouton « 📸 » réutilisable pour attacher une photo à n'importe quel élément.
 * La photo prise rejoint automatiquement la galerie Souvenirs (les métadonnées
 * portent un `label` = l'élément d'origine, affiché en légende). Redimensionnée
 * avant stockage (voir usePhotos/image.js). Rien si `capturePhoto` est absent.
 */
export function AttachPhotoButton({ sx, capturePhoto, label, text = '📸', style }) {
  if (!capturePhoto) return null
  return (
    <button
      data-testid="btn-attach-photo"
      onClick={(e) => { e.stopPropagation(); capturePhoto('camera', label ? { label } : {}) }}
      aria-label={label ? `Ajouter une photo — ${label}` : 'Ajouter une photo'}
      style={sx(style || 'border:none;background:#f1e9da;color:#6b6354;font-weight:700;font-family:Quicksand;cursor:pointer;border-radius:8px;padding:4px 9px;font-size:12px;')}
    >
      {text}
    </button>
  )
}
