import { describe, it, expect } from 'vitest'
import { PLACE_SHEETS, getPlaceSheet, sheetRows, isSourced } from '../place-sheets.js'

describe('PLACE_SHEETS — intégrité du contenu', () => {
  it('chaque fiche a les champs d’identité renseignés', () => {
    PLACE_SHEETS.forEach((s) => {
      expect(s.id).toBeTruthy()
      expect(s.name).toBeTruthy()
      expect(s.emoji).toBeTruthy()
    })
  })

  it('chaque fiche cite au moins une source (contenu factuel)', () => {
    PLACE_SHEETS.forEach((s) => expect(isSourced(s)).toBe(true))
  })

  it('les coordonnées, si présentes, sont plausibles pour le Cantal', () => {
    PLACE_SHEETS.filter((s) => s.coords).forEach((s) => {
      expect(s.coords.lat).toBeGreaterThan(44)
      expect(s.coords.lat).toBeLessThan(46)
      expect(s.coords.lng).toBeGreaterThan(2)
      expect(s.coords.lng).toBeLessThan(3.5)
    })
  })

  it('aucun identifiant en double', () => {
    const ids = PLACE_SHEETS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getPlaceSheet()', () => {
  it('renvoie null pour un id inconnu', () => {
    expect(getPlaceSheet('nawak')).toBeNull()
    expect(getPlaceSheet(undefined)).toBeNull()
  })
})

describe('sheetRows() — ne jamais afficher un champ vide', () => {
  it('omet les champs absents ou vides plutôt que d’afficher un trou', () => {
    const rows = sheetRows({ access: 'Parking gratuit', duration: '', difficulty: '   ', withKids: 'Poussette non' })
    expect(rows.map(([, label]) => label)).toEqual(['Accès & parking', 'Avec les enfants'])
  })
  it('renvoie [] pour une fiche absente', () => {
    expect(sheetRows(null)).toEqual([])
  })
})

describe('isSourced()', () => {
  it('exige un tableau de sources non vide', () => {
    expect(isSourced({ sources: ['https://x'] })).toBe(true)
    expect(isSourced({ sources: [] })).toBe(false)
    expect(isSourced({})).toBe(false)
    expect(isSourced(null)).toBe(false)
  })
})
