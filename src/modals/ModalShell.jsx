import { s } from '../utils.js'
import { useEscapeKey } from '../hooks/useEscapeKey.js'

/**
 * Coquille de modale accessible, partagée par toutes les feuilles (bottom
 * sheets). Remplace le backdrop `<div onClick={onClose}>` dupliqué dans chaque
 * modale (a11y Sonar S1082/S6848 : un onClick sur div ne gérait pas le clavier).
 *
 * - Backdrop cliquable pour fermer, marqué `role="presentation"`.
 * - Fermeture au clavier via **Échap** (document-level), la vraie amélioration
 *   d'accessibilité vs l'ancien onClick souris-seul.
 * - Le contenu (`children`) reste la feuille de la modale, à qui l'appelant
 *   ajoute `role="dialog" aria-modal="true"` et garde son `stopPropagation`.
 *
 * Rendu **visuellement identique** aux anciennes feuilles : mêmes couleur,
 * z-index et animation de backdrop (paramétrés par `z` et `fade`).
 */
export function ModalShell({ onClose, z = 200, fade = true, children }) {
  useEscapeKey(onClose)

  const backdrop = `position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:${z};`
    + `display:flex;flex-direction:column;justify-content:flex-end;`
    + (fade ? 'animation:fadeIn 0.2s ease;' : '')

  return (
    <div role="presentation" onClick={onClose} style={s(backdrop)}>
      {children}
    </div>
  )
}
