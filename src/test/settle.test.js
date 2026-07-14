import { describe, it, expect } from 'vitest'
import { computeBalances, minimalTransfers, settlement } from '../settle.js'

const M = ['Papa', 'Maman', 'Léa']

describe('computeBalances', () => {
  it('partage égal par défaut (sharedWith absent = tous)', () => {
    // Papa paie 30 pour 3 → chacun doit 10 ; Papa a payé 30, doit 10 → +20.
    const b = computeBalances([{ amt: 30, paidBy: 'Papa' }], M)
    expect(b.find((x) => x.member === 'Papa').balance).toBe(20)
    expect(b.find((x) => x.member === 'Maman').balance).toBe(-10)
    expect(b.find((x) => x.member === 'Léa').balance).toBe(-10)
  })

  it('la somme des soldes est nulle', () => {
    const b = computeBalances(
      [{ amt: 30, paidBy: 'Papa' }, { amt: 12, paidBy: 'Maman' }, { amt: 9, paidBy: 'Léa' }],
      M,
    )
    expect(b.reduce((s, x) => s + x.balance, 0)).toBeCloseTo(0, 6)
  })

  it('respecte sharedWith (sous-ensemble)', () => {
    // Maman paie 20 partagé entre Papa & Maman → 10 chacun.
    const b = computeBalances([{ amt: 20, paidBy: 'Maman', sharedWith: ['Papa', 'Maman'] }], M)
    expect(b.find((x) => x.member === 'Maman').balance).toBe(10)
    expect(b.find((x) => x.member === 'Papa').balance).toBe(-10)
    expect(b.find((x) => x.member === 'Léa').balance).toBe(0) // non concerné
  })

  it('ignore les dépenses sans payeur connu ou de montant nul', () => {
    const b = computeBalances(
      [{ amt: 50 }, { amt: 50, paidBy: 'Inconnu' }, { amt: 0, paidBy: 'Papa' }, { amt: -5, paidBy: 'Papa' }],
      M,
    )
    expect(b.every((x) => x.balance === 0)).toBe(true)
  })

  it('membres vides → aucun solde', () => {
    expect(computeBalances([{ amt: 10, paidBy: 'Papa' }], [])).toEqual([])
  })
})

describe('minimalTransfers', () => {
  it('propose le remboursement minimal', () => {
    const t = minimalTransfers([
      { member: 'Papa', balance: 20 },
      { member: 'Maman', balance: -10 },
      { member: 'Léa', balance: -10 },
    ])
    expect(t).toHaveLength(2)
    expect(t.every((x) => x.to === 'Papa')).toBe(true)
    expect(t.reduce((s, x) => s + x.amount, 0)).toBe(20)
  })

  it('rien à régler si tout est équilibré', () => {
    expect(minimalTransfers([{ member: 'Papa', balance: 0 }, { member: 'Maman', balance: 0 }])).toEqual([])
  })

  it('cas simple à deux : un seul virement', () => {
    const t = minimalTransfers([{ member: 'A', balance: -15 }, { member: 'B', balance: 15 }])
    expect(t).toEqual([{ from: 'A', to: 'B', amount: 15 }])
  })

  it('n personnes → au plus n-1 virements', () => {
    const { balances } = settlement(
      [
        { amt: 60, paidBy: 'Papa' },
        { amt: 30, paidBy: 'Maman' },
      ],
      M,
    )
    const t = minimalTransfers(balances)
    expect(t.length).toBeLessThanOrEqual(M.length - 1)
    // chaque virement rééquilibre : après application, tout le monde à 0
    const bal = new Map(balances.map((b) => [b.member, b.balance]))
    for (const { from, to, amount } of t) { bal.set(from, bal.get(from) + amount); bal.set(to, bal.get(to) - amount) }
    for (const v of bal.values()) expect(v).toBeCloseTo(0, 6)
  })
})

describe('settlement (intégration)', () => {
  it('gère le problème du centime : les virements règlent exactement', () => {
    // 10 € partagés à 3 : soldes arrondis +6,67 / -3,33 / -3,33 (somme +0,01).
    const { balances, transfers } = settlement([{ amt: 10, paidBy: 'Papa' }], M)
    expect(balances.reduce((s, b) => s + b.balance, 0)).toBeCloseTo(0, 1)
    // Après application des virements, chacun est à 0 au centime près.
    const bal = new Map(balances.map((b) => [b.member, Math.round(b.balance * 100)]))
    for (const { from, to, amount } of transfers) {
      const c = Math.round(amount * 100)
      bal.set(from, bal.get(from) + c)
      bal.set(to, bal.get(to) - c)
    }
    for (const v of bal.values()) expect(Math.abs(v)).toBeLessThanOrEqual(1)
    expect(transfers.length).toBeGreaterThan(0)
  })
})
