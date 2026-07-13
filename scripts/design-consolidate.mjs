#!/usr/bin/env node
// ── Cantou — consolidation de palette guidée par CIEDE2000 ────────────────────
//
// Fusionne les couleurs *dérivées* (proches à ΔE < 2, indiscernables à l'œil)
// vers une couleur canonique. Objectif : réduire le bruit de palette révélé par
// `design-audit.mjs`, sans changer le rendu (ΔE<2 est sous le seuil de
// perception) et — surtout — SANS casser le mode sombre.
//
// Invariant de sûreté : on ne réécrit JAMAIS une couleur référencée par
// theme.js (clé de substitution sombre, accent-texte…). On ne redirige que les
// couleurs *non référencées* (dérive pure) vers leur canonique la plus proche.
// Conséquence : toutes les clés de theme.js restent présentes dans le code →
// mode sombre intact ; et une dérive qui n'était pas substituée en sombre finit
// sur une couleur qui, elle, l'est → cohérence sombre améliorée, jamais dégradée.
//
// Usage : node scripts/design-consolidate.mjs [--apply]
//   (sans --apply : dry-run, liste les fusions envisagées)

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const APPLY = process.argv.includes('--apply')

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
const texts = new Map(files.map(f => [f, readFileSync(f, 'utf8')]))
const blob = [...texts.values()].join('\n')

// Couleurs référencées par theme.js = intouchables (pinned)
const themeSrc = readFileSync(join(SRC, 'theme.js'), 'utf8')
const pinned = new Set([...themeSrc.matchAll(/#[0-9a-fA-F]{6}/g)].map(m => m[0].toLowerCase()))

// Fréquence globale des couleurs
const freq = new Map()
for (const m of blob.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
  const k = m[0].toLowerCase(); freq.set(k, (freq.get(k) || 0) + 1)
}
const all = [...freq.keys()]

// CIEDE2000 (identique à design-audit.mjs)
const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
const srgbToLin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
function rgbToXyz([r, g, b]) {
  ;[r, g, b] = [r, g, b].map(srgbToLin)
  return [r * 0.4124 + g * 0.3576 + b * 0.1805, r * 0.2126 + g * 0.7152 + b * 0.0722, r * 0.0193 + g * 0.1192 + b * 0.9505]
}
function xyzToLab([x, y, z]) {
  const w = [0.95047, 1, 1.08883], f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const [fx, fy, fz] = [x, y, z].map((v, i) => f(v / w[i]))
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}
const lab = h => xyzToLab(rgbToXyz(hexToRgb(h)))
function dE(l1, l2) {
  const [L1, a1, b1] = l1, [L2, a2, b2] = l2
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), avgC = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(avgC ** 7 / (avgC ** 7 + 25 ** 7)))
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G)
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2), avgCp = (C1p + C2p) / 2
  const hp = (a, b) => { let h = Math.atan2(b, a) * 180 / Math.PI; return h < 0 ? h + 360 : h }
  const h1 = hp(a1p, b1), h2 = hp(a2p, b2)
  let dh = 0
  if (C1p * C2p !== 0) dh = Math.abs(h2 - h1) <= 180 ? h2 - h1 : (h2 - h1 > 180 ? h2 - h1 - 360 : h2 - h1 + 360)
  const dL = L2 - L1, dC = C2p - C1p, dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(dh * Math.PI / 360)
  let aH = h1 + h2
  if (C1p * C2p !== 0) aH = Math.abs(h1 - h2) <= 180 ? (h1 + h2) / 2 : (h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2)
  const T = 1 - 0.17 * Math.cos((aH - 30) * Math.PI / 180) + 0.24 * Math.cos(2 * aH * Math.PI / 180)
    + 0.32 * Math.cos((3 * aH + 6) * Math.PI / 180) - 0.2 * Math.cos((4 * aH - 63) * Math.PI / 180)
  const avgL = (L1 + L2) / 2
  const Sl = 1 + 0.015 * (avgL - 50) ** 2 / Math.sqrt(20 + (avgL - 50) ** 2)
  const Sc = 1 + 0.045 * avgCp, Sh = 1 + 0.015 * avgCp * T
  const Rt = -Math.sin(2 * (30 * Math.exp(-(((aH - 275) / 25) ** 2))) * Math.PI / 180) * 2 * Math.sqrt(avgCp ** 7 / (avgCp ** 7 + 25 ** 7))
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh))
}

const labs = new Map(all.map(c => [c, lab(c)]))

// Pour chaque couleur NON pinned, trouver la canonique la plus proche à ΔE<2 :
//   priorité à une couleur pinned (préserve les tokens), sinon la plus fréquente.
const THRESH = 2
const merges = new Map() // from -> to
for (const c of all) {
  if (pinned.has(c)) continue
  let best = null, bestDe = THRESH
  for (const t of all) {
    if (t === c) continue
    const d = dE(labs.get(c), labs.get(t))
    if (d >= THRESH) continue
    // Direction : ne jamais fusionner vers une cible non-pinned plus rare
    // (évite frequent→rare et les cycles a↔b) ; à fréquence égale, ordre
    // lexical pour un canonique déterministe.
    if (!pinned.has(t)) {
      if (freq.get(t) < freq.get(c)) continue
      if (freq.get(t) === freq.get(c) && t > c) continue
    }
    // candidat : préférer pinned, puis fréquence, puis ΔE
    const better =
      !best ||
      (pinned.has(t) && !pinned.has(best)) ||
      (pinned.has(t) === pinned.has(best) && (freq.get(t) > freq.get(best) || (freq.get(t) === freq.get(best) && d < bestDe)))
    if (better) { best = t; bestDe = d }
  }
  if (best) merges.set(c, { to: best, de: bestDe })
}

// Résout les chaînes (a->b->c) vers une cible finale non-fusionnée
function resolve(c) {
  const seen = new Set()
  while (merges.has(c) && !seen.has(c)) { seen.add(c); c = merges.get(c).to }
  return c
}

console.log(`\nCouleurs distinctes : ${all.length}  ·  référencées theme.js (pinned) : ${pinned.size}`)
console.log(`Fusions sûres (dérive non référencée, ΔE<2) : ${merges.size}\n`)
const rows = [...merges.entries()].sort((a, b) => a[1].de - b[1].de)
for (const [from, { to, de }] of rows) {
  console.log(`  ${from} (×${freq.get(from)})  →  ${resolve(from)}   ΔE=${de.toFixed(2)}${pinned.has(to) ? '  [→ token]' : ''}`)
}

if (!APPLY) { console.log('\n(dry-run — relancer avec --apply pour écrire)\n'); process.exit(0) }

// Application : remplace chaque couleur fusionnée (toutes casses) par sa cible finale.
let changed = 0
for (const [f, txt] of texts) {
  if (f.endsWith('theme.js')) continue // pinned only : rien à réécrire
  let t = txt
  for (const from of merges.keys()) {
    const to = resolve(from)
    if (to === from) continue
    const re = new RegExp(from.replace('#', '#'), 'gi')
    t = t.replace(re, to)
  }
  if (t !== txt) { writeFileSync(f, t); changed++ }
}
console.log(`\n✅ Appliqué — ${changed} fichiers réécrits.\n`)
