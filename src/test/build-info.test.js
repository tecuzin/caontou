import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { BUILD_NUMBER } from '../build-info.js'

const SRC = readFileSync(new URL('../build-info.js', import.meta.url), 'utf8')

describe('BUILD_NUMBER', () => {
  it('est un entier fini et positif ou nul', () => {
    expect(typeof BUILD_NUMBER).toBe('number')
    expect(Number.isFinite(BUILD_NUMBER)).toBe(true)
    expect(Number.isInteger(BUILD_NUMBER)).toBe(true)
    expect(BUILD_NUMBER).toBeGreaterThanOrEqual(0)
  })

  it('correspond au contenu de build.number (valeur injectée par Vite)', () => {
    const fromFile = Number(
      readFileSync(new URL('../../build.number', import.meta.url), 'utf8').trim(),
    )
    expect(BUILD_NUMBER).toBe(fromFile)
  })

  it('ne recule jamais sous le socle historique (versionCode Android)', () => {
    // build.number devient le versionCode : un numéro plus bas casse la mise à jour.
    expect(BUILD_NUMBER).toBeGreaterThanOrEqual(100)
  })
})

describe('repli quand les métadonnées de build manquent', () => {
  it('protège la lecture par un `typeof` (pas de ReferenceError)', () => {
    expect(SRC).toContain("typeof __BUILD_NUMBER__ !== 'undefined'")
  })

  it('vaut 0 si __BUILD_NUMBER__ n’est pas défini', () => {
    // Reproduit l'expression du module dans un scope où le define Vite est absent.
    const evaluate = new Function(
      "return typeof __BUILD_NUMBER__ !== 'undefined' ? __BUILD_NUMBER__ : 0",
    )
    expect(evaluate()).toBe(0)
  })

  it('utilise la valeur injectée quand elle existe', () => {
    const evaluate = new Function(
      '__BUILD_NUMBER__',
      "return typeof __BUILD_NUMBER__ !== 'undefined' ? __BUILD_NUMBER__ : 0",
    )
    expect(evaluate(42)).toBe(42)
  })
})
