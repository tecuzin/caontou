#!/usr/bin/env node
// Génère les icônes Android depuis un SVG embarqué
// Nécessite: npm install sharp (via allowScripts ou manuellement)
// Usage: node scripts/generate-icon.js

import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'

const sizes = {
  'android/app/src/main/res/mipmap-mdpi': 48,
  'android/app/src/main/res/mipmap-hdpi': 72,
  'android/app/src/main/res/mipmap-xhdpi': 96,
  'android/app/src/main/res/mipmap-xxhdpi': 144,
  'android/app/src/main/res/mipmap-xxxhdpi': 192,
}

function drawIcon(ctx, size) {
  const s = size
  const cx = s / 2
  const cy = s / 2

  // Fond dégradé ciel
  const skyGrad = ctx.createLinearGradient(0, 0, 0, s)
  skyGrad.addColorStop(0, '#4a7fa5')
  skyGrad.addColorStop(1, '#b8d4e8')
  ctx.fillStyle = skyGrad
  ctx.beginPath()
  ctx.roundRect(0, 0, s, s, s * 0.22)
  ctx.fill()

  // Soleil
  const sunX = s * 0.72
  const sunY = s * 0.22
  const sunR = s * 0.10
  ctx.fillStyle = '#f5c842'
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
  ctx.fill()

  // Rayons soleil
  ctx.strokeStyle = '#f5c842'
  ctx.lineWidth = s * 0.025
  ctx.lineCap = 'round'
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8
    const r1 = sunR * 1.4
    const r2 = sunR * 1.8
    ctx.beginPath()
    ctx.moveTo(sunX + Math.cos(angle) * r1, sunY + Math.sin(angle) * r1)
    ctx.lineTo(sunX + Math.cos(angle) * r2, sunY + Math.sin(angle) * r2)
    ctx.stroke()
  }

  // Montagne arrière (Puy Mary)
  ctx.fillStyle = '#5b7042'
  ctx.beginPath()
  ctx.moveTo(0, s * 0.85)
  ctx.lineTo(s * 0.20, s * 0.38)
  ctx.lineTo(s * 0.50, s * 0.72)
  ctx.lineTo(s * 0.65, s * 0.32)
  ctx.lineTo(s, s * 0.65)
  ctx.lineTo(s, s * 0.85)
  ctx.closePath()
  ctx.fill()

  // Neige sommet arrière
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(s * 0.65, s * 0.32)
  ctx.lineTo(s * 0.58, s * 0.42)
  ctx.lineTo(s * 0.72, s * 0.42)
  ctx.closePath()
  ctx.fill()

  // Montagne avant (au premier plan)
  ctx.fillStyle = '#4a5d3a'
  ctx.beginPath()
  ctx.moveTo(0, s * 0.92)
  ctx.lineTo(s * 0.30, s * 0.50)
  ctx.lineTo(s * 0.55, s * 0.78)
  ctx.lineTo(s * 0.75, s * 0.44)
  ctx.lineTo(s, s * 0.70)
  ctx.lineTo(s, s * 0.92)
  ctx.closePath()
  ctx.fill()

  // Neige sommet avant
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(s * 0.75, s * 0.44)
  ctx.lineTo(s * 0.68, s * 0.54)
  ctx.lineTo(s * 0.82, s * 0.54)
  ctx.closePath()
  ctx.fill()

  // Prairie verte en bas
  const meadowGrad = ctx.createLinearGradient(0, s * 0.82, 0, s)
  meadowGrad.addColorStop(0, '#7a9e5a')
  meadowGrad.addColorStop(1, '#5b7042')
  ctx.fillStyle = meadowGrad
  ctx.beginPath()
  ctx.moveTo(0, s * 0.88)
  ctx.quadraticCurveTo(cx, s * 0.78, s, s * 0.88)
  ctx.lineTo(s, s)
  ctx.lineTo(0, s)
  ctx.closePath()
  ctx.fill()

  // Petite maison / gite
  const hx = s * 0.38
  const hy = s * 0.80
  const hw = s * 0.20
  const hh = s * 0.12
  ctx.fillStyle = '#e8c07a'
  ctx.fillRect(hx, hy, hw, hh)
  ctx.fillStyle = '#b8503f'
  ctx.beginPath()
  ctx.moveTo(hx - s * 0.02, hy)
  ctx.lineTo(hx + hw / 2, hy - s * 0.08)
  ctx.lineTo(hx + hw + s * 0.02, hy)
  ctx.closePath()
  ctx.fill()
  // Porte
  ctx.fillStyle = '#9c6b4a'
  ctx.fillRect(hx + hw * 0.4, hy + hh * 0.4, hw * 0.22, hh * 0.6)
}

// Génère le SVG inline pour public/
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4a7fa5"/>
      <stop offset="100%" stop-color="#b8d4e8"/>
    </linearGradient>
    <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7a9e5a"/>
      <stop offset="100%" stop-color="#5b7042"/>
    </linearGradient>
  </defs>
  <!-- Fond ciel -->
  <rect width="512" height="512" rx="112" ry="112" fill="url(#sky)"/>
  <!-- Soleil -->
  <circle cx="368" cy="112" r="52" fill="#f5c842"/>
  <!-- Rayons -->
  <g stroke="#f5c842" stroke-width="13" stroke-linecap="round">
    <line x1="368" y1="44" x2="368" y2="24"/>
    <line x1="416" y1="64" x2="430" y2="50"/>
    <line x1="436" y1="112" x2="456" y2="112"/>
    <line x1="416" y1="160" x2="430" y2="174"/>
    <line x1="368" y1="180" x2="368" y2="200"/>
    <line x1="320" y1="160" x2="306" y2="174"/>
    <line x1="300" y1="112" x2="280" y2="112"/>
    <line x1="320" y1="64" x2="306" y2="50"/>
  </g>
  <!-- Montagne arrière -->
  <polygon points="0,435 102,194 256,368 332,163 512,332 512,435" fill="#5b7042"/>
  <!-- Neige arrière -->
  <polygon points="332,163 297,215 367,215" fill="#fff" opacity="0.9"/>
  <!-- Montagne avant -->
  <polygon points="0,470 153,256 281,399 384,225 512,358 512,470" fill="#4a5d3a"/>
  <!-- Neige avant -->
  <polygon points="384,225 348,276 420,276" fill="#fff" opacity="0.9"/>
  <!-- Prairie -->
  <path d="M0,450 Q256,400 512,450 L512,512 L0,512 Z" fill="url(#meadow)"/>
  <!-- Maison -->
  <rect x="194" y="410" width="102" height="62" fill="#e8c07a" rx="4"/>
  <polygon points="184,410 245,369 306,410" fill="#b8503f"/>
  <rect x="234" y="435" width="22" height="37" fill="#9c6b4a" rx="3"/>
</svg>`

fs.writeFileSync('public/cantou-icon.svg', svgContent)
console.log('✅ SVG écrit dans public/cantou-icon.svg')

// Essayer canvas si disponible
try {
  const { createCanvas } = await import('canvas')
  for (const [dir, size] of Object.entries(sizes)) {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')
    drawIcon(ctx, size)
    const buf = canvas.toBuffer('image/png')
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), buf)
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), buf)
    console.log(`✅ ${size}x${size} → ${dir}`)
  }
} catch {
  console.log('ℹ️  canvas non disponible — seul le SVG a été généré')
  console.log('   Pour générer les PNG Android, installer canvas:')
  console.log('   npm install canvas')
}
