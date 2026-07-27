import { describe, it, expect } from 'vitest'
import { applyMigrations, LATEST_SCHEMA } from '../migrations.js'
import { FAMILY_KEY } from '../progress.js'

/*
 * Non-régression de la CHAÎNE complète de migrations.
 *
 * Les tests existants valident chaque saut isolément (v1→v2, v2→v3…). Or ce
 * qu'un téléphone subit réellement, c'est le parcours COMPLET : une famille
 * qui n'a pas mis à jour depuis longtemps passe de v1 au schéma courant d'un
 * coup. C'est le scénario qui casse pour de vrai, et il n'était pas couvert.
 *
 * Invariant central : AUCUNE donnée saisie par l'utilisateur ne disparaît.
 */

/** Store réaliste d'une famille ayant beaucoup utilisé un vieux build (v1). */
const legacyStore = () => ({
  schemaVersion: 1,
  // valeurs périmées que la v1→v2 doit corriger
  trip: { origin: 'Lyon', destination: 'Mandailles', start: '2026-08-05', end: '2026-08-15' },
  // saisies personnelles : à préserver intégralement
  expenses: [
    { label: 'Acompte gîte', cat: 'Hébergement', amt: 360 },
    { label: 'Péage', cat: 'Transport', amt: 24.6 },
  ],
  meals: [{ id: 1, day: 'Ven 7', dish: 'Truffade maison' }],
  visits: [{ id: 1, name: 'Pas de Cère', cat: 'Nature', dist: '30 min' }],
  saved: { 1: true },
  journal: { 'Ven 7': { text: 'Super journée', mood: '😀' } },
  photos: [{ id: 'p1', file: 'cantou-photos/p1.jpeg', day: 'Ven 7' }],
  budgetTotal: 1800,
  // progression à plat (forme pré-v5)
  bingo: { 0: true, 3: true },
  challengesDone: { '2026-08-07': true },
})

describe('Chaîne de migrations v1 → schéma courant', () => {
  it('atteint le schéma courant en un seul passage', () => {
    const out = applyMigrations(legacyStore(), 1)
    expect(out.schemaVersion).toBe(LATEST_SCHEMA)
  })

  it('NE PERD AUCUNE saisie utilisateur', () => {
    const before = legacyStore()
    const out = applyMigrations(before, 1)
    expect(out.expenses).toEqual(before.expenses)
    expect(out.meals).toEqual(before.meals)
    expect(out.saved).toEqual(before.saved)
    expect(out.journal).toEqual(before.journal)
    expect(out.photos).toEqual(before.photos)
    expect(out.budgetTotal).toBe(1800)
  })

  it('corrige les lieux périmés (Lyon/Mandailles → Carladès)', () => {
    const out = applyMigrations(legacyStore(), 1)
    expect(out.trip.origin).not.toMatch(/lyon/i)
    expect(out.trip.destination).not.toMatch(/mandailles/i)
    // mais garde les dates saisies
    expect(out.trip.start).toBe('2026-08-05')
    expect(out.trip.end).toBe('2026-08-15')
  })

  it('convertit la progression à plat sans rien perdre', () => {
    const out = applyMigrations(legacyStore(), 1)
    expect(out.bingo[FAMILY_KEY]).toEqual({ 0: true, 3: true })
    expect(out.challengesDone[FAMILY_KEY]).toEqual({ '2026-08-07': true })
  })

  it('sème les listes de référence absentes (jeux, bingo, urgences, lexique)', () => {
    const out = applyMigrations(legacyStore(), 1)
    expect(Array.isArray(out.kidsGames)).toBe(true)
    expect(out.kidsGames.length).toBeGreaterThan(0)
    expect(Array.isArray(out.bingoItems)).toBe(true)
    expect(Array.isArray(out.emergencyNumbers)).toBe(true)
    expect(Array.isArray(out.dialectWords)).toBe(true)
  })

  it('est IDEMPOTENTE : rejouer la chaîne ne change plus rien', () => {
    const once = applyMigrations(legacyStore(), 1)
    const twice = applyMigrations(once, once.schemaVersion)
    expect(twice).toEqual(once)
  })

  it('ne réécrit pas un store déjà à jour', () => {
    const current = applyMigrations(legacyStore(), 1)
    const again = applyMigrations(current, LATEST_SCHEMA)
    expect(again).toEqual(current)
  })

  it('n’écrase jamais une personnalisation existante', () => {
    const custom = {
      ...legacyStore(),
      kidsGames: [{ name: 'Mon jeu' }],
      bingoItems: [{ emoji: '🐄', label: 'Ma case' }],
      dialectWords: [{ word: 'Mien', meaning: 'à moi' }],
    }
    const out = applyMigrations(custom, 1)
    expect(out.kidsGames).toEqual([{ name: 'Mon jeu' }])
    expect(out.bingoItems).toEqual([{ emoji: '🐄', label: 'Ma case' }])
    expect(out.dialectWords).toEqual([{ word: 'Mien', meaning: 'à moi' }])
  })

  it('survit à un store vide et à un store minimal', () => {
    expect(applyMigrations({}, 1).schemaVersion).toBe(LATEST_SCHEMA)
    expect(applyMigrations({ expenses: [] }, 1).expenses).toEqual([])
  })

  it('depuis CHAQUE version intermédiaire, on arrive au schéma courant', () => {
    for (let v = 1; v <= LATEST_SCHEMA; v++) {
      const out = applyMigrations(legacyStore(), v)
      expect(out.schemaVersion).toBe(LATEST_SCHEMA)
      // et les dépenses survivent quel que soit le point de départ
      expect(out.expenses).toHaveLength(2)
    }
  })
})
