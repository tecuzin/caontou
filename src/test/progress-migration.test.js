import { describe, it, expect } from 'vitest'
import { applyMigrations, LATEST_SCHEMA } from '../migrations.js'
import { normalizeProgress, childProgress, setChildEntry, toggleChildEntry, countChildEntries, childNames, FAMILY_KEY } from '../progress.js'

describe('Migration v4 → v5 — progression par enfant SANS PERTE', () => {
  it('rattache la progression historique plate à la clé « Famille »', () => {
    const store = { bingo: { 0: true, 5: true }, challengesDone: { '2026-08-07': true } }
    const out = applyMigrations(store, 4)
    expect(out.bingo).toEqual({ [FAMILY_KEY]: { 0: true, 5: true } })
    expect(out.challengesDone).toEqual({ [FAMILY_KEY]: { '2026-08-07': true } })
    expect(out.schemaVersion).toBe(LATEST_SCHEMA)
  })

  it('ne perd RIEN : chaque case cochée avant migration l’est encore après', () => {
    const before = { 0: true, 3: true, 7: true, 12: true }
    const out = applyMigrations({ bingo: { ...before } }, 4)
    expect(childProgress(out.bingo, FAMILY_KEY)).toEqual(before)
    expect(countChildEntries(out.bingo)).toBe(4)
  })

  it('est idempotente : la rejouer ne duplique ni ne déplace rien', () => {
    const once = applyMigrations({ bingo: { 1: true } }, 4)
    const twice = applyMigrations(once, 4)
    expect(twice.bingo).toEqual(once.bingo)
  })

  it('préserve une progression DÉJÀ par enfant', () => {
    const perChild = { Léa: { 0: true }, Tom: { 4: true } }
    const out = applyMigrations({ bingo: structuredClone(perChild) }, 4)
    expect(out.bingo).toEqual(perChild)
  })

  it('gère une forme MIXTE (store migré puis réécrit par une ancienne UI)', () => {
    const mixed = { Léa: { 0: true }, 9: true }
    const out = applyMigrations({ bingo: mixed }, 4)
    expect(out.bingo).toEqual({ Léa: { 0: true }, [FAMILY_KEY]: { 9: true } })
  })

  it('laisse les champs absents absents (pas de création parasite)', () => {
    const out = applyMigrations({}, 4)
    expect(out.bingo).toBeUndefined()
    expect(out.challengesDone).toBeUndefined()
  })

  it('migre depuis un vieux schéma v1 en passant par toutes les étapes', () => {
    const out = applyMigrations({ bingo: { 2: true } }, 1)
    expect(out.schemaVersion).toBe(LATEST_SCHEMA)
    expect(childProgress(out.bingo, FAMILY_KEY)).toEqual({ 2: true })
  })
})

describe('progress.js — lecture/écriture par enfant', () => {
  it('sépare bien la progression de deux enfants', () => {
    let raw = setChildEntry({}, 'Léa', 0)
    raw = setChildEntry(raw, 'Tom', 4)
    expect(childProgress(raw, 'Léa')).toEqual({ 0: true })
    expect(childProgress(raw, 'Tom')).toEqual({ 4: true })
    expect(childNames(raw).sort()).toEqual(['Léa', 'Tom'])
  })

  it('sans prénom, écrit et lit dans le bucket « Famille » (appelants existants)', () => {
    const raw = setChildEntry({}, undefined, 3)
    expect(childProgress(raw, undefined)).toEqual({ 3: true })
    expect(raw[FAMILY_KEY]).toEqual({ 3: true })
  })

  it('un prénom vide ou en espaces retombe sur « Famille »', () => {
    expect(childProgress(setChildEntry({}, '   ', 1), '')).toEqual({ 1: true })
  })

  it('toggle bascule dans les deux sens sans toucher aux autres enfants', () => {
    let raw = setChildEntry({}, 'Tom', 4)
    raw = toggleChildEntry(raw, 'Léa', 0)
    expect(childProgress(raw, 'Léa')).toEqual({ 0: true })
    raw = toggleChildEntry(raw, 'Léa', 0)
    expect(childProgress(raw, 'Léa')).toEqual({})
    expect(childProgress(raw, 'Tom')).toEqual({ 4: true }) // intact
  })

  it('normalizeProgress ne jette jamais rien', () => {
    expect(normalizeProgress(null)).toEqual({})
    expect(normalizeProgress('bidon')).toEqual({})
    expect(normalizeProgress({ 0: true, Léa: { 1: true } }))
      .toEqual({ [FAMILY_KEY]: { 0: true }, Léa: { 1: true } })
  })
})
