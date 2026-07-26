import { describe, it, expect } from 'vitest'
import {
  KIDS_ALLOWED_TABS,
  KIDS_ALLOWED_SUBS,
  isTabAllowed,
  isSubAllowed,
  canDestroy,
  makeUnlockChallenge,
  checkUnlock,
  randomChallengeSeed,
} from '../kids-lock.js'

describe('kids-lock — autorisations', () => {
  it('déverrouillé : tout est autorisé', () => {
    for (const tab of ['accueil', 'planning', 'visites', 'repas', 'budget']) {
      expect(isTabAllowed(tab, false)).toBe(true)
    }
    for (const sub of ['bingo', 'reglages', 'sejours', 'partage-config', 'offline-check', 'bilan']) {
      expect(isSubAllowed(sub, false)).toBe(true)
    }
    expect(canDestroy(false)).toBe(true)
  })

  it('verrouillé : seuls les onglets de la liste blanche passent', () => {
    for (const tab of KIDS_ALLOWED_TABS) expect(isTabAllowed(tab, true)).toBe(true)
    expect(isTabAllowed('budget', true)).toBe(false)
    expect(isTabAllowed('inconnu', true)).toBe(false)
    expect(isTabAllowed(undefined, true)).toBe(false)
  })

  it('verrouillé : seuls les sous-écrans de jeu passent', () => {
    for (const sub of KIDS_ALLOWED_SUBS) expect(isSubAllowed(sub, true)).toBe(true)
    for (const sub of ['reglages', 'sejours', 'partage-config', 'offline-check', 'imprimer', 'bilan', 'carte', 'restos']) {
      expect(isSubAllowed(sub, true)).toBe(false)
    }
  })

  it('verrouillé : fermer un sous-écran (null) reste possible', () => {
    expect(isSubAllowed(null, true)).toBe(true)
    expect(isSubAllowed(undefined, true)).toBe(true)
  })

  it('canDestroy est la négation stricte du verrou', () => {
    expect(canDestroy(true)).toBe(false)
    expect(canDestroy(false)).toBe(true)
    expect(canDestroy(undefined)).toBe(true)
  })

  it('les listes blanches ne contiennent aucun écran sensible', () => {
    for (const forbidden of ['budget']) expect(KIDS_ALLOWED_TABS).not.toContain(forbidden)
    for (const forbidden of ['reglages', 'sejours', 'partage-config', 'offline-check']) {
      expect(KIDS_ALLOWED_SUBS).not.toContain(forbidden)
    }
  })
})

describe('kids-lock — défi de déverrouillage', () => {
  it('est déterministe pour une graine donnée', () => {
    const a = makeUnlockChallenge(42)
    const b = makeUnlockChallenge(42)
    expect(a).toEqual(b)
  })

  it('produit une multiplication cohérente et non triviale', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const c = makeUnlockChallenge(seed)
      expect(c.question).toMatch(/^Combien font \d+ × \d+ \?$/)
      expect(c.answer).toBe(c.a * c.b)
      expect(c.a).toBeGreaterThanOrEqual(6)
      expect(c.a).toBeLessThanOrEqual(12)
      expect(c.b).toBeGreaterThanOrEqual(6)
      expect(c.b).toBeLessThanOrEqual(12)
      expect(c.answer).toBeGreaterThanOrEqual(36)
    }
  })

  it('varie selon la graine', () => {
    const answers = new Set()
    for (let seed = 1; seed <= 30; seed++) answers.add(makeUnlockChallenge(seed).answer)
    expect(answers.size).toBeGreaterThan(3)
  })

  it('checkUnlock accepte la bonne réponse, y compris avec des espaces', () => {
    const c = makeUnlockChallenge(7)
    expect(checkUnlock(c, String(c.answer))).toBe(true)
    expect(checkUnlock(c, `  ${c.answer}  `)).toBe(true)
    expect(checkUnlock(c, `\t${c.answer}\n`)).toBe(true)
    expect(checkUnlock(c, ` ${String(c.answer).split('').join(' ')} `)).toBe(true)
    expect(checkUnlock(c, c.answer)).toBe(true)
  })

  it('checkUnlock refuse tout le reste', () => {
    const c = makeUnlockChallenge(7)
    expect(checkUnlock(c, String(c.answer + 1))).toBe(false)
    expect(checkUnlock(c, '')).toBe(false)
    expect(checkUnlock(c, '   ')).toBe(false)
    expect(checkUnlock(c, 'abc')).toBe(false)
    expect(checkUnlock(c, `${c.answer}x`)).toBe(false)
    expect(checkUnlock(c, null)).toBe(false)
    expect(checkUnlock(null, '56')).toBe(false)
    expect(checkUnlock({}, '56')).toBe(false)
  })

  it('randomChallengeSeed donne un entier positif exploitable', () => {
    const seed = randomChallengeSeed()
    expect(Number.isInteger(seed)).toBe(true)
    expect(seed).toBeGreaterThan(0)
    expect(makeUnlockChallenge(seed).answer).toBeGreaterThan(0)
  })
})
