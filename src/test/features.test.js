import { describe, it, expect } from 'vitest'
import { FEATURE_GROUPS, FEATURE_KEYS, FEATURE_LABELS, isFeatureOn, featureKeyForAction } from '../features.js'

describe('catalogue features', () => {
  it('expose des clés uniques et non vides', () => {
    expect(FEATURE_KEYS.length).toBeGreaterThan(0)
    expect(new Set(FEATURE_KEYS).size).toBe(FEATURE_KEYS.length)
  })
  it('chaque clé a un libellé', () => {
    for (const k of FEATURE_KEYS) expect(typeof FEATURE_LABELS[k]).toBe('string')
  })
  it('les groupes couvrent toutes les clés', () => {
    const fromGroups = FEATURE_GROUPS.flatMap((g) => g.items.map((i) => i.key))
    expect(fromGroups.sort()).toEqual([...FEATURE_KEYS].sort())
  })
})

describe('isFeatureOn (défaut = activé)', () => {
  it('activé quand map absente ou clé inconnue', () => {
    expect(isFeatureOn(undefined, 'tab_repas')).toBe(true)
    expect(isFeatureOn({}, 'tab_repas')).toBe(true)
  })
  it('désactivé uniquement quand explicitement false', () => {
    expect(isFeatureOn({ tab_repas: false }, 'tab_repas')).toBe(false)
    expect(isFeatureOn({ tab_repas: true }, 'tab_repas')).toBe(true)
  })
})

describe('featureKeyForAction', () => {
  it('mappe tab: et sub: vers les bonnes clés', () => {
    expect(featureKeyForAction('tab:repas')).toBe('tab_repas')
    expect(featureKeyForAction('sub:carte')).toBe('mod_carte')
  })
  it('null pour une action non reconnue', () => {
    expect(featureKeyForAction('accueil')).toBeNull()
    expect(featureKeyForAction(null)).toBeNull()
  })
})
