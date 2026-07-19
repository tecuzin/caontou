import { describe, it, expect } from 'vitest'
import { offlineChecks, networkDependentFeatures } from '../offline-check.js'

const full = { visits: [{}, {}], days: [{}], meals: [{}], courses: [{}], logi: [{}], hebergement: {} }

describe('offlineChecks', () => {
  it('prêt quand toutes les données sont présentes', () => {
    const r = offlineChecks(full)
    expect(r.ready).toBe(true)
    expect(r.checks.every((c) => c.ok)).toBe(true)
  })

  it('pas prêt si une donnée critique manque', () => {
    const r = offlineChecks({ ...full, visits: [] })
    expect(r.ready).toBe(false)
    expect(r.checks.find((c) => c.key === 'visits').ok).toBe(false)
  })

  it('store vide → non prêt, aucun check ok sauf dérivés', () => {
    const r = offlineChecks(null)
    expect(r.ready).toBe(false)
    expect(r.checks.find((c) => c.key === 'store').ok).toBe(false)
  })

  it('meals OU courses suffit pour la ligne repas', () => {
    expect(offlineChecks({ ...full, meals: [], courses: [{}] }).checks.find((c) => c.key === 'meals').ok).toBe(true)
    expect(offlineChecks({ ...full, meals: [], courses: [] }).checks.find((c) => c.key === 'meals').ok).toBe(false)
  })
})

describe('networkDependentFeatures', () => {
  it('liste la carte détaillée et les partages', () => {
    const f = networkDependentFeatures()
    expect(f.map((x) => x.key)).toEqual(['osm', 'share'])
    f.forEach((x) => { expect(x.label).toBeTruthy(); expect(x.reason).toBeTruthy() })
  })
})
