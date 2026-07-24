import { describe, it, expect } from 'vitest'
import { initialTabFromSearch, DEEPLINK_TABS } from '../deeplink.js'

describe('initialTabFromSearch()', () => {
  it('renvoie l\'onglet valide demandé', () => {
    expect(initialTabFromSearch('?tab=repas')).toBe('repas')
    expect(initialTabFromSearch('?tab=budget&x=1')).toBe('budget')
  })
  it('renvoie null si absent ou inconnu', () => {
    expect(initialTabFromSearch('')).toBeNull()
    expect(initialTabFromSearch('?foo=bar')).toBeNull()
    expect(initialTabFromSearch('?tab=nimportequoi')).toBeNull()
  })
  it('couvre tous les onglets deep-linkables', () => {
    for (const t of DEEPLINK_TABS) expect(initialTabFromSearch(`?tab=${t}`)).toBe(t)
  })
})
