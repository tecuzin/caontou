import { describe, it, expect } from 'vitest'
import { qrMatrix, rsGenerator, gmul, rsEncodeForTest } from '../qr.js'

/** Reste de la division polynomiale (GF256) de `msg` par `gen` (descendant, tête=1). */
function polyRemainder(msg, gen) {
  const res = msg.slice()
  for (let i = 0; i < msg.length - (gen.length - 1); i++) {
    const coef = res[i]
    if (coef !== 0) for (let j = 0; j < gen.length; j++) res[i + j] ^= gmul(gen[j], coef)
  }
  return res.slice(res.length - (gen.length - 1))
}

describe('Reed-Solomon (cœur mathématique GF(256))', () => {
  it('polynôme générateur degré 7 = vecteur connu de la spec QR', () => {
    // ISO/IEC 18004 — 7 codewords EC : [1,127,122,154,164,11,68,117]
    expect(rsGenerator(7)).toEqual([1, 127, 122, 154, 164, 11, 68, 117])
  })
  it('polynôme générateur degré 10 = vecteur connu', () => {
    expect(rsGenerator(10)).toEqual([1, 216, 194, 159, 111, 199, 94, 95, 113, 157, 193])
  })
  it('EC valide : (data ‖ ec) est divisible par le générateur (reste nul)', () => {
    const data = [16, 32, 12, 86, 97, 128, 236, 17, 236, 17, 236, 17, 236, 17, 236, 17]
    for (const ecLen of [7, 10, 18]) {
      const ec = rsEncodeForTest(data, ecLen)
      const rem = polyRemainder([...data, ...ec], rsGenerator(ecLen))
      expect(rem.every((x) => x === 0)).toBe(true)
    }
  })
})

describe('qrMatrix — structure', () => {
  it('null si vide ou trop grand', () => {
    expect(qrMatrix('')).toBeNull()
    expect(qrMatrix(null)).toBeNull()
    expect(qrMatrix('x'.repeat(5000))).toBeNull() // dépasse la version 10 (L)
  })

  it('taille de matrice conforme à la version (17 + 4v)', () => {
    const m = qrMatrix('cantou')
    expect(m.length).toBe(m[0].length)
    // versions 1-10 → tailles 21..77, toujours ≡ 1 (mod 4)
    expect((m.length - 17) % 4).toBe(0)
    expect(m.length).toBeGreaterThanOrEqual(21)
    expect(m.length).toBeLessThanOrEqual(77)
  })

  it('motifs de repérage (finder) aux 3 coins', () => {
    const m = qrMatrix('cantou-config')
    const n = m.length
    const finderAt = (r, c) => {
      // anneau 7×7 : coins noirs, centre 3×3 noir, bord intérieur blanc
      let ok = true
      for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
        const inb = (i === 0 || i === 6 || j === 0 || j === 6) || (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        if (m[r + i][c + j] !== inb) ok = false
      }
      return ok
    }
    expect(finderAt(0, 0)).toBe(true)
    expect(finderAt(0, n - 7)).toBe(true)
    expect(finderAt(n - 7, 0)).toBe(true)
  })

  it('timing patterns alternés (ligne/colonne 6)', () => {
    const m = qrMatrix('cantou')
    const n = m.length
    for (let i = 8; i < n - 8; i++) {
      expect(m[6][i]).toBe(i % 2 === 0)
      expect(m[i][6]).toBe(i % 2 === 0)
    }
  })

  it('module sombre présent (toujours noir)', () => {
    const m = qrMatrix('cantou')
    expect(m[m.length - 8][8]).toBe(true)
  })

  it('déterministe pour une même entrée', () => {
    expect(qrMatrix('même-entrée')).toEqual(qrMatrix('même-entrée'))
  })
})

// Vecteur de correction : la matrice d'une charge utile réaliste doit être
// stable et carrée ; on vérifie qu'une config Cantou compacte tient dans ≤ v10.
describe('qrMatrix — charge utile config Cantou', () => {
  it('encode un payload compact réaliste', () => {
    const payload = JSON.stringify({ app: 'cantou-cfg', t: { start: '2026-08-05', end: '2026-08-15', origin: 'Beauvais', etape: 'Laschamps', destination: 'Vezels-Roussy (Cantal)' }, v: [1, 5, 8, 11, 14], b: 1800, f: { tab_budget: false } })
    const m = qrMatrix(payload)
    expect(m).not.toBeNull()
    expect(m.length).toBeGreaterThanOrEqual(21)
  })
})
