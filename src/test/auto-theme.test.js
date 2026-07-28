import { describe, it, expect } from 'vitest'
import { shouldBeDark, nextThemeDecision, DEFAULT_DARK_FROM, DEFAULT_DARK_TO } from '../auto-theme.js'

describe('shouldBeDark()', () => {
  it('sombre le soir et la nuit', () => {
    expect(shouldBeDark(21)).toBe(true)
    expect(shouldBeDark(23)).toBe(true)
    expect(shouldBeDark(0)).toBe(true)
    expect(shouldBeDark(6)).toBe(true)
  })

  it('clair en journée', () => {
    expect(shouldBeDark(7)).toBe(false)
    expect(shouldBeDark(12)).toBe(false)
    expect(shouldBeDark(20)).toBe(false)
  })

  it('gère un intervalle qui NE traverse PAS minuit', () => {
    // 13 h → 15 h : sombre uniquement l'après-midi
    expect(shouldBeDark(14, 13, 15)).toBe(true)
    expect(shouldBeDark(16, 13, 15)).toBe(false)
    expect(shouldBeDark(2, 13, 15)).toBe(false)
  })

  it('bornes identiques = jamais sombre (intervalle vide)', () => {
    expect(shouldBeDark(10, 12, 12)).toBe(false)
  })

  it('ne décide rien sur une heure inexploitable', () => {
    expect(shouldBeDark(-1)).toBeNull()
    expect(shouldBeDark(24)).toBeNull()
    expect(shouldBeDark(12.5)).toBeNull()
    expect(shouldBeDark('minuit')).toBeNull()
    expect(shouldBeDark(undefined)).toBeNull()
  })

  it('les bornes par défaut sont cohérentes', () => {
    expect(shouldBeDark(DEFAULT_DARK_FROM)).toBe(true)
    expect(shouldBeDark(DEFAULT_DARK_TO)).toBe(false)
  })
})

describe('nextThemeDecision()', () => {
  it('bascule en sombre le soir si on est en clair', () => {
    expect(nextThemeDecision({ hour: 22, darkMode: false, enabled: true })).toBe(true)
  })

  it('bascule en clair le matin si on est en sombre', () => {
    expect(nextThemeDecision({ hour: 9, darkMode: true, enabled: true })).toBe(false)
  })

  it('ne fait rien si le thème est déjà le bon', () => {
    expect(nextThemeDecision({ hour: 22, darkMode: true, enabled: true })).toBeNull()
    expect(nextThemeDecision({ hour: 9, darkMode: false, enabled: true })).toBeNull()
  })

  it('ne fait rien si l’auto-bascule est coupée', () => {
    expect(nextThemeDecision({ hour: 22, darkMode: false, enabled: false })).toBeNull()
  })

  it('RESPECTE le choix manuel de l’utilisateur', () => {
    // Le point important : si l'utilisateur a repris la main, on ne lui
    // reprend pas son thème dans le dos.
    expect(nextThemeDecision({ hour: 22, darkMode: false, enabled: true, userOverride: true })).toBeNull()
    expect(nextThemeDecision({ hour: 9, darkMode: true, enabled: true, userOverride: true })).toBeNull()
  })

  it('ne décide rien sur une heure invalide', () => {
    expect(nextThemeDecision({ hour: 99, darkMode: false, enabled: true })).toBeNull()
  })
})
