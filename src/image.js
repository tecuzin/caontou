/* ------------------------------------------------------------------ *
 * Redimensionnement d'image côté client (avant stockage).
 * `fitDimensions` est pure (testable) ; `resizeBase64Jpeg` utilise un
 * canvas dans la WebView et retombe TOUJOURS sur l'original en cas
 * d'échec — on ne perd jamais une photo.
 * ------------------------------------------------------------------ */

/**
 * Dimensions cibles en bornant le plus grand côté à `maxEdge`, sans jamais
 * agrandir (ratio conservé). Renvoie {w:0,h:0} si dimensions invalides.
 */
export function fitDimensions(w, h, maxEdge) {
  if (!w || !h || w < 0 || h < 0) return { w: 0, h: 0 }
  const longest = Math.max(w, h)
  if (longest <= maxEdge) return { w: Math.round(w), h: Math.round(h) }
  const scale = maxEdge / longest
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Redimensionne une image base64 JPEG : borne le plus grand côté à `maxEdge`
 * et ré-encode en JPEG à `quality`. Réduit l'empreinte disque, la mémoire et
 * le temps d'affichage des souvenirs. En l'absence de canvas/DOM, d'échec de
 * décodage ou si l'image est déjà plus petite que la cible sans gain, renvoie
 * la base64 d'origine.
 * @param {string} base64  base64 JPEG (sans préfixe data:)
 * @returns {Promise<string>} base64 JPEG (sans préfixe data:)
 */
export async function resizeBase64Jpeg(base64, { maxEdge = 1600, quality = 0.8 } = {}) {
  if (!base64 || typeof document === 'undefined' || typeof Image === 'undefined') return base64
  try {
    const img = await loadImage(`data:image/jpeg;base64,${base64}`)
    const srcW = img.naturalWidth || img.width
    const srcH = img.naturalHeight || img.height
    const { w, h } = fitDimensions(srcW, srcH, maxEdge)
    if (!w || !h) return base64
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext && canvas.getContext('2d')
    if (!ctx) return base64
    ctx.drawImage(img, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    const comma = dataUrl.indexOf(',')
    if (comma < 0) return base64
    const out = dataUrl.slice(comma + 1)
    // Ne garder le redimensionné que s'il est réellement plus léger.
    return out && out.length < base64.length ? out : base64
  } catch {
    return base64
  }
}
