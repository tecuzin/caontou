import { describe, it, expect } from 'vitest'
import { shouldOnboard } from '../onboarding.js'

describe('shouldOnboard', () => {
  it('vrai sur une install neuve (onboarded absent)', () => {
    expect(shouldOnboard({})).toBe(true)
  })
  it('vrai quand onboarded=false', () => {
    expect(shouldOnboard({ onboarded: false })).toBe(true)
  })
  it('faux quand onboarded=true', () => {
    expect(shouldOnboard({ onboarded: true })).toBe(false)
  })
  it('vrai pour un store nul/indéfini (sécurité)', () => {
    expect(shouldOnboard(undefined)).toBe(true)
    expect(shouldOnboard(null)).toBe(true)
  })
})
