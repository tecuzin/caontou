import { describe, it, expect } from 'vitest'
import { applyMigrations, isValidSchema } from '../migrations.js'

describe('Store migrations', () => {
  it('accepte un store sans schemaVersion (rétro-compat)', () => {
    const store = { saved: {}, checks: {} }
    const result = applyMigrations(store, 1)
    expect(result.schemaVersion).toBe(1)
  })

  it('valide un store avec schemaVersion valide', () => {
    const store = { schemaVersion: 1, saved: {} }
    expect(isValidSchema(store)).toBe(true)
  })

  it('rejette un store invalide', () => {
    expect(isValidSchema(null)).toBe(false)
    expect(isValidSchema('not an object')).toBe(false)
  })

  it('préserve les données à travers les migrations', () => {
    const store = { saved: { expenses: [{ amt: 10 }] }, checks: { key: true } }
    const result = applyMigrations(store, 1)
    expect(result.expenses).toEqual([{ amt: 10 }])
    expect(result.checks.key).toBe(true)
  })
})
