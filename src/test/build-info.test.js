import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { BUILD_NUMBER } from '../build-info.js'

// Chemin résolu depuis la racine du dépôt : sous Vitest, `import.meta.url`
// n'est pas une URL `file:` → `new URL(...)` casse la collecte du fichier
// (les tests ne s'exécutaient alors PAS, sans erreur visible).
const SRC = readFileSync('src/build-info.js', 'utf8')

describe('BUILD_NUMBER', () => {
  it('est un entier fini et positif ou nul', () => {
    expect(typeof BUILD_NUMBER).toBe('number')
    expect(Number.isFinite(BUILD_NUMBER)).toBe(true)
    expect(Number.isInteger(BUILD_NUMBER)).toBe(true)
    expect(BUILD_NUMBER).toBeGreaterThanOrEqual(0)
  })

  it('correspond au contenu de build.number (valeur injectée par Vite)', () => {
    const fromFile = Number(readFileSync('build.number', 'utf8').trim())
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

  // ⚠️ Le `define` de Vite remplace `__BUILD_NUMBER__` TEXTUELLEMENT, y compris
  // à l'intérieur des chaînes de caractères de ce fichier. Le nom est donc
  // reconstitué à l'exécution (`ID`) pour que la substitution ne s'applique pas
  // et qu'on évalue réellement l'expression d'origine.
  const ID = '__BUILD' + '_NUMBER__'
  const EXPR = `return typeof ${ID} !== 'undefined' ? ${ID} : 0`

  it('vaut 0 si le numéro n’est pas injecté', () => {
    // `__BUILD_NUMBER__` existe comme global dans l'environnement de test : on ne
    // peut pas l'« absenter ». On le MASQUE donc par un paramètre laissé à
    // undefined — ce qui met bien la garde `typeof` sur son chemin de repli.
    const evaluate = new Function(ID, EXPR)
    expect(evaluate(undefined)).toBe(0)
  })

  it('utilise la valeur injectée quand elle existe', () => {
    const evaluate = new Function(ID, EXPR)
    expect(evaluate(42)).toBe(42)
  })
})
