/**
 * Encodeur QR minimal, **sans dépendance** — mode octet (UTF-8), niveau de
 * correction L, versions 1 à 10, sélection automatique du masque. Suffisant pour
 * partager la config compacte de Cantou (voir share-config.js). Rend une matrice
 * booléenne `boolean[][]` (true = module noir), ou `null` si le texte est trop
 * grand pour la version 10 (l'UI retombe alors sur le texte copiable).
 *
 * Références : ISO/IEC 18004. Tables limitées au niveau L, versions 1-10.
 */

// --- Arithmétique GF(256) (polynôme 0x11d) ---
const EXP = new Array(512)
const LOG = new Array(256)
;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]
})()
export const gmul = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]

/**
 * Polynôme générateur de Reed-Solomon de degré `deg`, en ordre **descendant**
 * (coeff. de x^deg … x^0, terme de tête = 1), conforme à la spec. Exporté pour test.
 */
export function rsGenerator(deg) {
  let poly = [1] // x^0
  for (let i = 0; i < deg; i++) {
    const next = new Array(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gmul(poly[j], EXP[i])
      next[j + 1] ^= poly[j]
    }
    poly = next
  }
  return poly.reverse()
}

/** Alias exporté pour les tests (validation de l'encodeur RS). */
export const rsEncodeForTest = (data, ecLen) => rsEncode(data, ecLen)

/** Codewords de correction d'erreur d'un bloc de données (encodeur systématique LFSR). */
function rsEncode(data, ecLen) {
  const g = rsGenerator(ecLen).slice(1) // coeffs x^(ecLen-1)…x^0, sans le terme de tête
  const res = new Array(ecLen).fill(0)
  for (const d of data) {
    const factor = d ^ res[0]
    res.shift(); res.push(0)
    for (let i = 0; i < ecLen; i++) res[i] ^= gmul(g[i], factor)
  }
  return res
}

// Niveau L, versions 1-10 : [ecPerBlock, [ [nbBlocs, dataParBloc], ... ] ]
const EC_L = {
  1: [7, [[1, 19]]],
  2: [10, [[1, 34]]],
  3: [15, [[1, 55]]],
  4: [20, [[1, 80]]],
  5: [26, [[1, 108]]],
  6: [18, [[2, 68]]],
  7: [20, [[2, 78]]],
  8: [24, [[2, 97]]],
  9: [30, [[2, 116]]],
  10: [18, [[2, 68], [2, 69]]],
}
const totalDataCodewords = (v) => EC_L[v][1].reduce((s, [n, d]) => s + n * d, 0)

// Positions des motifs d'alignement par version (centres).
const ALIGN = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
}

/** Choisit la plus petite version (1-10) qui contient `n` octets au niveau L. */
function pickVersion(n) {
  for (let v = 1; v <= 10; v++) {
    const cci = v <= 9 ? 8 : 16 // bits du compteur de caractères (mode octet)
    const capacityBytes = Math.floor((totalDataCodewords(v) * 8 - 4 - cci) / 8)
    if (n <= capacityBytes) return v
  }
  return null
}

// --- Flux de bits ---
function toUtf8(str) {
  return Array.from(new TextEncoder().encode(str))
}

function buildDataCodewords(bytes, version) {
  const bits = []
  const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1) }
  push(0b0100, 4) // mode octet
  push(bytes.length, version <= 9 ? 8 : 16)
  for (const b of bytes) push(b, 8)
  const totalBits = totalDataCodewords(version) * 8
  for (let i = 0; i < 4 && bits.length < totalBits; i++) bits.push(0) // terminateur
  while (bits.length % 8 !== 0) bits.push(0)
  const codewords = []
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]
    codewords.push(b)
  }
  const pad = [0xec, 0x11]
  let p = 0
  while (codewords.length < totalDataCodewords(version)) codewords.push(pad[p++ % 2])
  return codewords
}

/** Entrelace blocs de données + EC selon la spec. */
function interleave(dataCodewords, version) {
  const [ecLen, groups] = EC_L[version]
  const blocks = []
  let idx = 0
  for (const [nb, dc] of groups) {
    for (let i = 0; i < nb; i++) {
      const data = dataCodewords.slice(idx, idx + dc); idx += dc
      blocks.push({ data, ec: rsEncode(data, ecLen) })
    }
  }
  const result = []
  const maxData = Math.max(...blocks.map((b) => b.data.length))
  for (let i = 0; i < maxData; i++) for (const b of blocks) if (i < b.data.length) result.push(b.data[i])
  for (let i = 0; i < ecLen; i++) for (const b of blocks) result.push(b.ec[i])
  return result
}

// --- Construction de la matrice ---
function sizeForVersion(v) { return 17 + v * 4 }

function placeFinder(m, res, r, c) {
  for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
    const rr = r + i, cc = c + j
    if (rr < 0 || cc < 0 || rr >= m.length || cc >= m.length) continue
    const inb = (i >= 0 && i <= 6 && (j === 0 || j === 6)) || (j >= 0 && j <= 6 && (i === 0 || i === 6)) || (i >= 2 && i <= 4 && j >= 2 && j <= 4)
    m[rr][cc] = inb; res[rr][cc] = true
  }
}

function buildMatrix(finalCodewords, version, mask) {
  const size = sizeForVersion(version)
  const m = Array.from({ length: size }, () => new Array(size).fill(false))
  const res = Array.from({ length: size }, () => new Array(size).fill(false)) // module réservé (fonction)

  placeFinder(m, res, 0, 0)
  placeFinder(m, res, 0, size - 7)
  placeFinder(m, res, size - 7, 0)

  // Timing
  for (let i = 8; i < size - 8; i++) { const v = i % 2 === 0; m[6][i] = v; m[i][6] = v; res[6][i] = true; res[i][6] = true }

  // Alignements
  const centers = ALIGN[version]
  for (const r of centers) for (const c of centers) {
    if ((r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8)) continue
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
      const on = Math.max(Math.abs(i), Math.abs(j)) !== 1
      m[r + i][c + j] = on; res[r + i][c + j] = true
    }
  }

  // Module sombre + zones réservées format
  res[size - 8][8] = true; m[size - 8][8] = true
  for (let i = 0; i <= 8; i++) { if (i !== 6) { res[8][i] = true; res[i][8] = true } }
  for (let i = 0; i < 8; i++) { res[8][size - 1 - i] = true; res[size - 1 - i][8] = true }

  // Info version (v ≥ 7)
  if (version >= 7) {
    const vb = versionInfoBits(version)
    for (let i = 0; i < 18; i++) {
      const bit = (vb >> i) & 1
      const a = Math.floor(i / 3), b = i % 3
      m[size - 11 + b][a] = !!bit; res[size - 11 + b][a] = true
      m[a][size - 11 + b] = !!bit; res[a][size - 11 + b] = true
    }
  }

  // Données en zigzag
  let bitIdx = 0
  const bitAt = (i) => (finalCodewords[i >> 3] >> (7 - (i & 7))) & 1
  const totalBits = finalCodewords.length * 8
  let up = true
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col-- // saute la colonne de timing
    for (let k = 0; k < size; k++) {
      const row = up ? size - 1 - k : k
      for (let c = 0; c < 2; c++) {
        const cc = col - c
        if (res[row][cc]) continue
        let dark = bitIdx < totalBits ? bitAt(bitIdx) === 1 : false
        bitIdx++
        if (maskFn(mask)(row, cc)) dark = !dark
        m[row][cc] = dark
      }
    }
    up = !up
  }

  // Info format (EC L = 01, masque)
  const fb = formatInfoBits(mask)
  for (let i = 0; i <= 5; i++) { m[8][i] = fbit(fb, i); m[size - 1 - i][8] = fbit(fb, i) }
  m[8][7] = fbit(fb, 6); m[8][8] = fbit(fb, 7); m[7][8] = fbit(fb, 8)
  for (let i = 9; i < 15; i++) { m[14 - i][8] = fbit(fb, i) }
  for (let i = 8; i < 15; i++) { m[8][size - 15 + i] = fbit(fb, i) }

  return m
}

const fbit = (bits, i) => ((bits >> i) & 1) === 1

function maskFn(mask) {
  switch (mask) {
    case 0: return (r, c) => (r + c) % 2 === 0
    case 1: return (r) => r % 2 === 0
    case 2: return (r, c) => c % 3 === 0
    case 3: return (r, c) => (r + c) % 3 === 0
    case 4: return (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0
    case 5: return (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0
    case 6: return (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0
    default: return (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
  }
}

// Info format : 15 bits (5 données EC L+masque, 10 BCH), masqués par 0x5412.
function formatInfoBits(mask) {
  const data = (0b01 << 3) | mask // EC L = 01
  let d = data << 10
  const g = 0b10100110111
  for (let i = 14; i >= 10; i--) if ((d >> i) & 1) d ^= g << (i - 10)
  return ((data << 10) | d) ^ 0b101010000010010
}

// Info version : 18 bits (6 données + 12 BCH), générateur 0x1f25.
function versionInfoBits(version) {
  let d = version << 12
  const g = 0b1111100100101
  for (let i = 17; i >= 12; i--) if ((d >> i) & 1) d ^= g << (i - 12)
  return (version << 12) | d
}

// Pénalité d'un masque (règles 1-4) pour choisir le meilleur.
function penalty(m) {
  const n = m.length
  let p = 0
  // Règle 1 : suites ≥5
  for (let r = 0; r < n; r++) for (let axis = 0; axis < 2; axis++) {
    let run = 1
    for (let c = 1; c < n; c++) {
      const a = axis === 0 ? m[r][c] : m[c][r]
      const b = axis === 0 ? m[r][c - 1] : m[c - 1][r]
      if (a === b) { run++; if (run === 5) p += 3; else if (run > 5) p += 1 } else run = 1
    }
  }
  // Règle 2 : blocs 2×2
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) {
    if (m[r][c] === m[r][c + 1] && m[r][c] === m[r + 1][c] && m[r][c] === m[r + 1][c + 1]) p += 3
  }
  // Règle 3 : motif 1:1:3:1:1
  const pat1 = [true, false, true, true, true, false, true, false, false, false, false]
  const pat2 = [false, false, false, false, true, false, true, true, true, false, true]
  for (let r = 0; r < n; r++) for (let c = 0; c <= n - 11; c++) {
    let m1 = true, m2 = true
    for (let k = 0; k < 11; k++) { if (m[r][c + k] !== pat1[k]) m1 = false; if (m[r][c + k] !== pat2[k]) m2 = false }
    if (m1 || m2) p += 40
    let v1 = true, v2 = true
    for (let k = 0; k < 11; k++) { if (m[c + k][r] !== pat1[k]) v1 = false; if (m[c + k][r] !== pat2[k]) v2 = false }
    if (v1 || v2) p += 40
  }
  // Règle 4 : proportion de noir
  let dark = 0
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (m[r][c]) dark++
  const ratio = (dark * 100) / (n * n)
  p += Math.floor(Math.abs(ratio - 50) / 5) * 10
  return p
}

/**
 * Matrice QR (boolean[][]) pour `text`, ou null si trop grand (> version 10, L).
 */
export function qrMatrix(text) {
  if (typeof text !== 'string' || text.length === 0) return null
  const bytes = toUtf8(text)
  const version = pickVersion(bytes.length)
  if (!version) return null
  const dataCw = buildDataCodewords(bytes, version)
  const finalCw = interleave(dataCw, version)
  let best = null, bestPenalty = Infinity
  for (let mask = 0; mask < 8; mask++) {
    const m = buildMatrix(finalCw, version, mask)
    const pen = penalty(m)
    if (pen < bestPenalty) { bestPenalty = pen; best = m }
  }
  return best
}
