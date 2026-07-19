/**
 * Composition d'une carte postale « Carladès » à partir d'une photo, dessinée
 * sur un <canvas> — 100 % hors-ligne, sans dépendance. La géométrie
 * (`postcardLayout`) et le dessin (`drawPostcard`, via un contexte 2D) sont
 * purs et testables (avec un contexte factice). Le partage/DOM reste au composant.
 */

export const POSTCARD_W = 1200
export const POSTCARD_H = 900

/** Positions (photo, bandeau légende) pour une carte postale de w×h pixels. */
export function postcardLayout(width = POSTCARD_W, height = POSTCARD_H) {
  const border = Math.round(width * 0.03)
  const captionH = Math.round(height * 0.2)
  const photo = { x: border, y: border, w: width - 2 * border, h: height - captionH - 2 * border }
  const caption = { x: border, y: photo.y + photo.h + Math.round(border / 2), w: width - 2 * border, h: captionH }
  return { border, captionH, photo, caption }
}

/** Tronque un texte à `max` caractères (avec … s'il déborde). */
export function truncate(str, max = 60) {
  const s = (str || '').toString().trim()
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s
}

/**
 * Dessine la carte postale sur un contexte 2D. `img` est un élément image déjà
 * chargé (ou null). Renvoie le layout utilisé. Ne touche pas au DOM.
 */
export function drawPostcard(ctx, img, opts = {}) {
  const { width = POSTCARD_W, height = POSTCARD_H, caption = '', place = 'Carladès · Cantal', date = '' } = opts
  const L = postcardLayout(width, height)

  // Fond crème (cadre)
  ctx.fillStyle = '#fffaf0'
  ctx.fillRect(0, 0, width, height)

  // Photo (remplit la zone ; le cadrage précis est géré par l'appelant si besoin)
  if (img) ctx.drawImage(img, L.photo.x, L.photo.y, L.photo.w, L.photo.h)

  // Bandeau lieu (en haut de la photo)
  ctx.fillStyle = '#4a5d3a'
  ctx.font = `700 ${Math.round(height * 0.045)}px Quicksand, sans-serif`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(truncate(place, 40), L.photo.x + L.border, L.photo.y + Math.round(height * 0.075))

  // Légende (bandeau bas)
  ctx.fillStyle = '#2f2a22'
  ctx.font = `700 ${Math.round(height * 0.05)}px Quicksand, sans-serif`
  ctx.fillText(truncate(caption, 60), L.caption.x, L.caption.y + Math.round(L.captionH * 0.45))

  // Date (sous la légende)
  if (date) {
    ctx.fillStyle = '#6b6354'
    ctx.font = `400 ${Math.round(height * 0.032)}px 'Nunito Sans', sans-serif`
    ctx.fillText(truncate(date, 40), L.caption.x, L.caption.y + Math.round(L.captionH * 0.8))
  }

  return L
}
