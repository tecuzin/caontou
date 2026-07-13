#!/usr/bin/env node
// ── Cantou — moteur d'audit de cohérence de design (déterministe) ─────────────
//
// Démarche « machine » pour objectiver la beauté d'une UI sans modèle flou :
// on ne demande pas à un réseau de neurones « c'est joli ? » (les modèles
// d'esthétique sont entraînés sur des photos, pas des interfaces). On mesure
// des critères *déterministes* issus des sciences de la couleur et du design :
//
//   1. Cohérence de palette   — distance perceptuelle CIEDE2000 (ΔE). Deux
//      couleurs à ΔE < 2 sont indiscernables à l'œil : les avoir toutes deux
//      dans le code est une dérive (bruit), pas un choix.
//   2. Échelle de rayons      — les border-radius doivent tomber sur une échelle
//      (4/8/12/16/24) ; les valeurs orphelines (7px, 9px, 13px…) trahissent
//      l'ad hoc.
//   3. Échelle typographique  — les tailles de police suivent-elles une gamme
//      modulaire cohérente ?
//   4. Grille d'espacement    — paddings/margins/gaps sur une grille de 4 px.
//
// Sortie : un score de cohérence 0-100 + les points chauds à corriger.
// Aucune dépendance externe, pur JS — reproductible et hors-ligne.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'src')

// ── Collecte des tokens ───────────────────────────────────────────────────────
function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (['.js', '.jsx'].includes(extname(p))) out.push(p)
  }
  return out
}

const files = walk(SRC)
const blob = files.map(f => readFileSync(f, 'utf8')).join('\n')

const freq = (re, map = x => x) => {
  const m = new Map()
  for (const mm of blob.matchAll(re)) {
    const k = map(mm)
    m.set(k, (m.get(k) || 0) + 1)
  }
  return m
}

const colors = freq(/#[0-9a-fA-F]{6}\b/g, m => m[0].toLowerCase())
const radii = freq(/border-radius:\s*([0-9]+)px/g, m => +m[1])
const fonts = freq(/font-size:\s*([0-9]+)px/g, m => +m[1])
const spacing = freq(/(?:padding|margin|gap|top|left|right|bottom)(?:-[a-z]+)?:\s*([0-9]+)px/g, m => +m[1])

// ── 1. Couleur : sRGB → Lab → CIEDE2000 ───────────────────────────────────────
function hexToRgb(h) {
  return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
}
function srgbToLin(c) { return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
function rgbToXyz([r, g, b]) {
  ;[r, g, b] = [r, g, b].map(srgbToLin)
  return [
    r * 0.4124 + g * 0.3576 + b * 0.1805,
    r * 0.2126 + g * 0.7152 + b * 0.0722,
    r * 0.0193 + g * 0.1192 + b * 0.9505,
  ]
}
function xyzToLab([x, y, z]) {
  const wref = [0.95047, 1, 1.08883]
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const [fx, fy, fz] = [x, y, z].map((v, i) => f(v / wref[i]))
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}
const hexToLab = h => xyzToLab(rgbToXyz(hexToRgb(h)))

// CIEDE2000 (Sharma et al. 2005)
function deltaE00(lab1, lab2) {
  const [L1, a1, b1] = lab1, [L2, a2, b2] = lab2
  const avgLp = (L1 + L2) / 2
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2)
  const avgC = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(avgC ** 7 / (avgC ** 7 + 25 ** 7)))
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G)
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2)
  const avgCp = (C1p + C2p) / 2
  const hp = (ap, bp) => { let h = Math.atan2(bp, ap) * 180 / Math.PI; return h < 0 ? h + 360 : h }
  const h1p = hp(a1p, b1), h2p = hp(a2p, b2)
  let dhp
  if (C1p * C2p === 0) dhp = 0
  else if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p
  else dhp = h2p - h1p > 180 ? h2p - h1p - 360 : h2p - h1p + 360
  const dLp = L2 - L1, dCp = C2p - C1p
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360)
  let avgHp
  if (C1p * C2p === 0) avgHp = h1p + h2p
  else if (Math.abs(h1p - h2p) <= 180) avgHp = (h1p + h2p) / 2
  else avgHp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2
  const T = 1 - 0.17 * Math.cos((avgHp - 30) * Math.PI / 180)
    + 0.24 * Math.cos(2 * avgHp * Math.PI / 180)
    + 0.32 * Math.cos((3 * avgHp + 6) * Math.PI / 180)
    - 0.20 * Math.cos((4 * avgHp - 63) * Math.PI / 180)
  const dTheta = 30 * Math.exp(-(((avgHp - 275) / 25) ** 2))
  const Rc = 2 * Math.sqrt(avgCp ** 7 / (avgCp ** 7 + 25 ** 7))
  const Sl = 1 + (0.015 * (avgLp - 50) ** 2) / Math.sqrt(20 + (avgLp - 50) ** 2)
  const Sc = 1 + 0.045 * avgCp
  const Sh = 1 + 0.015 * avgCp * T
  const Rt = -Math.sin(2 * dTheta * Math.PI / 180) * Rc
  return Math.sqrt(
    (dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh)
  )
}

const colorList = [...colors.keys()]
const labs = new Map(colorList.map(c => [c, hexToLab(c)]))
// Couleurs référencées par theme.js : leurs quasi-doublons en clair sont
// INTENTIONNELS (mode sombre sémantique — même couleur claire, cible sombre
// différente selon le rôle). On ne les compte pas comme dérive.
let pinned = new Set()
try {
  pinned = new Set([...readFileSync(join(SRC, 'theme.js'), 'utf8').matchAll(/#[0-9a-fA-F]{6}/g)].map(m => m[0].toLowerCase()))
} catch { /* theme.js absent : tout est dérive */ }
const isDrift = (a, b) => !(pinned.has(a) && pinned.has(b)) // au moins une non pinned
const redundant = []  // paires ΔE < 2 réellement fusionnables (dérive)
const semantic = []   // paires ΔE < 2 mais pinned/pinned (intentionnel)
const close = []      // paires 2 ≤ ΔE < 5
for (let i = 0; i < colorList.length; i++) {
  for (let j = i + 1; j < colorList.length; j++) {
    const de = deltaE00(labs.get(colorList[i]), labs.get(colorList[j]))
    if (de < 2) (isDrift(colorList[i], colorList[j]) ? redundant : semantic).push([colorList[i], colorList[j], de])
    else if (de < 5 && isDrift(colorList[i], colorList[j])) close.push([colorList[i], colorList[j], de])
  }
}

// ── 2/3/4. Échelles ───────────────────────────────────────────────────────────
// Échelle réelle des tokens de rayon du design (dérivée des valeurs à forte
// fréquence : 14 et 28 sont les rayons signature — carte & sheet). L'ancienne
// échelle {4,8,12,16,24} les ignorait et sous-notait à tort.
const RADIUS_SCALE = [0, 4, 8, 12, 14, 16, 20, 28, 999]
const offScale = (val, scale, tol = 1) => !scale.some(s => Math.abs(s - val) <= tol)
const radiusIssues = [...radii.entries()].filter(([v]) => offScale(v, RADIUS_SCALE, 0.5))
const spacingOffGrid = [...spacing.entries()].filter(([v]) => v % 4 !== 0 && v > 2)
const fontSizes = [...fonts.keys()].sort((a, b) => a - b)

// ── Score composite ───────────────────────────────────────────────────────────
const nColors = colorList.length
const paletteScore = Math.max(0, 100 - redundant.length * 8 - close.length * 2)
const totalRadius = [...radii.values()].reduce((a, b) => a + b, 0)
const badRadius = radiusIssues.reduce((a, [, n]) => a + n, 0)
const radiusScore = Math.round(100 * (1 - badRadius / Math.max(1, totalRadius)))
const totalSpace = [...spacing.values()].reduce((a, b) => a + b, 0)
const badSpace = spacingOffGrid.reduce((a, [, n]) => a + n, 0)
const spacingScore = Math.round(100 * (1 - badSpace / Math.max(1, totalSpace)))
const fontScore = Math.max(0, 100 - Math.max(0, fontSizes.length - 6) * 8)

const composite = Math.round(
  0.40 * paletteScore + 0.25 * radiusScore + 0.20 * spacingScore + 0.15 * fontScore
)

// ── Rapport ───────────────────────────────────────────────────────────────────
const bar = n => '█'.repeat(Math.round(n / 5)).padEnd(20, '░')
console.log('\n╭─ Cantou · Audit de cohérence de design (déterministe) ─────────────╮')
console.log(`│ Fichiers analysés : ${String(files.length).padStart(3)}                                            │`)
console.log('╰────────────────────────────────────────────────────────────────────╯\n')
console.log(`  Palette (CIEDE2000) ${bar(paletteScore)} ${paletteScore.toFixed(0).padStart(3)}/100`)
console.log(`  Échelle rayons      ${bar(radiusScore)} ${radiusScore.toString().padStart(3)}/100`)
console.log(`  Grille espacement   ${bar(spacingScore)} ${spacingScore.toString().padStart(3)}/100`)
console.log(`  Échelle typo        ${bar(fontScore)} ${fontScore.toString().padStart(3)}/100`)
console.log('  ' + '─'.repeat(52))
console.log(`  ★ SCORE GLOBAL      ${bar(composite)} ${composite.toString().padStart(3)}/100\n`)

console.log(`● Palette : ${nColors} couleurs distinctes (${pinned.size} référencées theme.js).`)
console.log(`  ${redundant.length} paires de DÉRIVE (ΔE<2, non intentionnelles) → à fusionner :`)
redundant.sort((a, b) => a[2] - b[2]).slice(0, 12).forEach(([a, b, de]) =>
  console.log(`     ${a} ≈ ${b}   ΔE=${de.toFixed(2)}  (${colors.get(a)}+${colors.get(b)} usages)`))
console.log(`  ${semantic.length} paires proches mais INTENTIONNELLES (tokens theme.js, sombre sémantique).`)
console.log(`  ${close.length} paires quasi-doublons (2≤ΔE<5).\n`)

console.log(`● Rayons hors échelle {${RADIUS_SCALE.filter(v => v && v < 999).join(',')}} : ${radiusIssues.length} valeurs`)
console.log('     ' + radiusIssues.sort((a, b) => b[1] - a[1]).map(([v, n]) => `${v}px×${n}`).join('  ') + '\n')

console.log(`● Espacements hors grille 4px : ${spacingOffGrid.length} valeurs`)
console.log('     ' + spacingOffGrid.sort((a, b) => b[1] - a[1]).slice(0, 12).map(([v, n]) => `${v}px×${n}`).join('  ') + '\n')

console.log(`● Tailles de police (${fontSizes.length}) : ${fontSizes.map(v => v + 'px').join(' ')}\n`)

// Sortie machine (pour un pilotage before/after)
if (process.argv.includes('--json')) {
  console.log('JSON ' + JSON.stringify({ composite, paletteScore, radiusScore, spacingScore, fontScore, nColors, redundant: redundant.length }))
}
