import { describe, it, expect } from 'vitest'
import { buildRecapText } from '../recap.js'

const base = {
  daysCount: 11,
  spent: 1250,
  budgetTotal: 1800,
  spentPct: 69,
  topCategories: [{ name: 'Hébergement', amt: 600 }, { name: 'Nourriture', amt: 400 }, { name: 'Transport', amt: 250 }],
  savedVisits: 4,
  packPct: 80,
  coursesPct: 60,
  mealsPlanned: 9,
  photosCount: 23,
}

describe('Bilan de séjour — texte', () => {
  it('inclut les grands chiffres du séjour', () => {
    const t = buildRecapText(base)
    expect(t).toContain('📊 Notre séjour dans le Cantal')
    expect(t).toContain('11 jours sur place')
    expect(t).toMatch(/1.250/) // eur() fr-FR (espaces insécables)
    expect(t).toContain('69 %')
    expect(t).toContain('4 visites coup de cœur')
    expect(t).toContain('80 %')
    expect(t).toContain('9 repas planifiés')
    expect(t).toContain('23 photos souvenir')
  })

  it('liste les 3 premières catégories de dépense', () => {
    const t = buildRecapText(base)
    expect(t).toContain('Hébergement')
    expect(t).toContain('Nourriture')
    expect(t).toContain('Transport')
  })

  it('omet la ligne photos si aucune photo', () => {
    const t = buildRecapText({ ...base, photosCount: 0 })
    expect(t).not.toContain('souvenir')
  })

  it('gère le singulier (1 jour / 1 visite)', () => {
    const t = buildRecapText({ ...base, daysCount: 1, savedVisits: 1 })
    expect(t).toContain('1 jour sur place')
    expect(t).toContain('1 visite coup de cœur')
    expect(t).not.toContain('1 jours')
  })
})
