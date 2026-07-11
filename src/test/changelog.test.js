import { describe, it, expect } from 'vitest'
import { CHANGELOG, entriesSince } from '../changelog.js'

describe('Changelog', () => {
  it('est ordonné du plus récent au plus ancien', () => {
    const builds = CHANGELOG.map((e) => e.build)
    expect(builds).toEqual([...builds].sort((a, b) => b - a))
  })

  it('chaque entrée a build/version/date/items non vides', () => {
    for (const e of CHANGELOG) {
      expect(typeof e.build).toBe('number')
      expect(e.version).toBeTruthy()
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(e.items.length).toBeGreaterThan(0)
    }
  })

  it('entriesSince ne renvoie que les builds strictement plus récents', () => {
    const latest = CHANGELOG[0].build
    expect(entriesSince(latest)).toEqual([])
    const since = entriesSince(latest - 1)
    expect(since.length).toBeGreaterThanOrEqual(1)
    expect(since.every((e) => e.build > latest - 1)).toBe(true)
  })

  it('entriesSince(0) renvoie tout (premier lancement)', () => {
    expect(entriesSince(0)).toHaveLength(CHANGELOG.length)
    expect(entriesSince(null)).toHaveLength(CHANGELOG.length)
  })
})
