import { describe, it, expect } from 'vitest'
import { isVisited, visitedIdSet, visitProgress } from '../visits-progress.js'

const visits = [{ id: 1 }, { id: 2 }, { id: 3 }]
const ratings = { 1: { stars: 4, note: 'super' }, 2: { stars: 0 }, 3: { note: 'pas encore' } }

describe('isVisited', () => {
  it('vrai seulement si la note a des étoiles > 0', () => {
    expect(isVisited(ratings, 1)).toBe(true)
    expect(isVisited(ratings, 2)).toBe(false) // 0 étoile
    expect(isVisited(ratings, 3)).toBe(false) // note sans étoile
    expect(isVisited(ratings, 99)).toBe(false) // absente
    expect(isVisited({}, 1)).toBe(false)
    expect(isVisited(undefined, 1)).toBe(false)
  })
})

describe('visitedIdSet', () => {
  it('renvoie les ids notés (étoiles > 0), typés comme les ids d\'entrée', () => {
    const s = visitedIdSet(visits, ratings)
    expect(s.has(1)).toBe(true)
    expect(s.has(2)).toBe(false)
    expect(s.size).toBe(1)
  })
  it('gère les entrées vides sans planter', () => {
    expect(visitedIdSet([], {}).size).toBe(0)
    expect(visitedIdSet(undefined, undefined).size).toBe(0)
  })
})

describe('visitProgress', () => {
  it('compte done/total sur la liste fournie', () => {
    expect(visitProgress(visits, ratings)).toEqual({ done: 1, total: 3 })
  })
  it('total = 0 si aucune visite', () => {
    expect(visitProgress([], ratings)).toEqual({ done: 0, total: 0 })
  })
  it('done = 0 si aucune note', () => {
    expect(visitProgress(visits, {})).toEqual({ done: 0, total: 3 })
  })
})
