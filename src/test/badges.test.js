import { describe, it, expect } from 'vitest'
import { computeBadges, badgeStats } from '../badges.js'

const get = (store, id) => computeBadges(store).find((b) => b.id === id)

describe('computeBadges', () => {
  it('débloque « première sortie » dès une visite notée', () => {
    const store = { visits: [{ id: 1 }, { id: 2 }], ratings: { 1: { stars: 3 } } }
    expect(get(store, 'first-visit').unlocked).toBe(true)
    expect(get(store, 'explorer').unlocked).toBe(false) // 1 < 5
  })

  it('« explorateur du Carladès » = toutes les visites faites', () => {
    const visits = [{ id: 1 }, { id: 2 }]
    expect(get({ visits, ratings: { 1: { stars: 5 } } }, 'explorer-carlades').unlocked).toBe(false)
    expect(get({ visits, ratings: { 1: { stars: 5 }, 2: { stars: 4 } } }, 'explorer-carlades').unlocked).toBe(true)
  })

  it('compte les défis, photos et pages de journal', () => {
    const store = { challengesDone: { a: true, b: true, c: true }, photos: [1, 2, 3, 4, 5], journal: { 0: 'coucou', 1: ' ', 2: 'récit', 3: 'top' } }
    expect(get(store, 'challenger').unlocked).toBe(true) // 3/3
    expect(get(store, 'photographer').unlocked).toBe(true) // 5/5
    expect(get(store, 'journalist').unlocked).toBe(true) // 3 pages non vides
  })

  it('badge verrouillé n\'excède jamais sa cible en affichage', () => {
    const b = get({ photos: [1, 2, 3, 4, 5, 6, 7] }, 'photographer')
    expect(b.value).toBe(b.target) // borné à la cible
    expect(b.unlocked).toBe(true)
  })

  it('store vide : rien de débloqué', () => {
    const stats = badgeStats({})
    expect(stats.unlocked).toBe(0)
    expect(stats.total).toBeGreaterThanOrEqual(6)
  })
})
