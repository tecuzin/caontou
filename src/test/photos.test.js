import { describe, it, expect } from 'vitest'
import { dayKeyForDate, groupPhotosByDay, photoId, OTHER_DAY_KEY } from '../photos.js'

const TRIP = { start: '2026-08-05', end: '2026-08-15' }
const DAYS = [
  { dow: 'Mer', num: 5, title: 'Arrivée au gîte', items: [] },
  { dow: 'Jeu', num: 6, title: 'Pas de Cère', items: [] },
]

describe('Photos — helpers purs', () => {
  it('associe une date au jour du planning correspondant', () => {
    expect(dayKeyForDate(TRIP, DAYS, new Date(2026, 7, 5))).toBe('Mer 5')
    expect(dayKeyForDate(TRIP, DAYS, new Date(2026, 7, 6))).toBe('Jeu 6')
  })

  it('classe hors-séjour les dates sans jour de planning', () => {
    expect(dayKeyForDate(TRIP, DAYS, new Date(2026, 6, 10))).toBe(OTHER_DAY_KEY)
    expect(dayKeyForDate(TRIP, DAYS, new Date(2025, 7, 5))).toBe(OTHER_DAY_KEY)
  })

  it('groupe les photos par journée dans l\'ordre du planning', () => {
    const photos = [
      { id: 'a', day: 'Jeu 6' },
      { id: 'b', day: 'Mer 5' },
      { id: 'c', day: 'Mer 5' },
      { id: 'd', day: OTHER_DAY_KEY },
    ]
    const groups = groupPhotosByDay(photos, DAYS)
    expect(groups.map((g) => g.key)).toEqual(['Mer 5', 'Jeu 6', OTHER_DAY_KEY])
    expect(groups[0].photos).toHaveLength(2)
    expect(groups[2].label).toBe('Autres photos')
  })

  it('omet les journées sans photo et range les jours inconnus en « autres »', () => {
    const groups = groupPhotosByDay([{ id: 'x', day: 'Dim 99' }], DAYS)
    expect(groups).toHaveLength(1)
    expect(groups[0].key).toBe(OTHER_DAY_KEY)
  })

  it('génère des identifiants uniques', () => {
    expect(photoId()).not.toBe(photoId())
  })
})
