import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'

// Garde-fou de cohérence de design : le moteur déterministe (CIEDE2000) ne doit
// plus trouver de couleurs de DÉRIVE (paires ΔE<2 non intentionnelles). Empêche
// la ré-introduction de quasi-doublons de couleurs au fil des contributions.
// vitest s'exécute depuis la racine du repo.
const root = process.cwd()

function audit() {
  const out = execFileSync('node', ['scripts/design-audit.mjs', '--json'], { cwd: root, encoding: 'utf8' })
  const line = out.split('\n').find(l => l.startsWith('JSON '))
  return JSON.parse(line.slice(5))
}

describe('cohérence de design (déterministe)', () => {
  const m = audit()

  it('zéro paire de couleurs en dérive (ΔE<2 non intentionnelle)', () => {
    expect(m.redundant).toBe(0)
  })

  it('score de palette consolidé (≥ 60)', () => {
    expect(m.paletteScore).toBeGreaterThanOrEqual(60)
  })

  it('échelle de rayons harmonisée (≥ 90)', () => {
    expect(m.radiusScore).toBeGreaterThanOrEqual(90)
  })

  it('grille d\'espacement 2px respectée (≥ 95)', () => {
    expect(m.spacingScore).toBeGreaterThanOrEqual(95)
  })

  // Cliquet anti-régression : le score global ne doit plus redescendre sous le
  // palier acquis. On le remonte à chaque lot livré (voir docs/design-engine.md).
  it('score global au-dessus du palier acquis (≥ 68)', () => {
    expect(m.composite).toBeGreaterThanOrEqual(68)
  })
})
