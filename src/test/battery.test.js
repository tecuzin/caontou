import { describe, it, expect, vi, afterEach } from 'vitest'
import { batteryStatus, readBattery, BATTERY_LOW, BATTERY_WARN } from '../battery.js'

afterEach(() => { vi.unstubAllGlobals() })

describe('batteryStatus()', () => {
  it('ne dit rien quand la batterie est confortable', () => {
    expect(batteryStatus(0.8)).toBeNull()
    expect(batteryStatus(0.5)).toBeNull()
  })

  it('prévient discrètement sous 35 %', () => {
    const s = batteryStatus(BATTERY_WARN)
    expect(s.level).toBe('warn')
    expect(s.pct).toBe(35)
  })

  it('alerte franchement sous 20 %', () => {
    const s = batteryStatus(0.15)
    expect(s.level).toBe('low')
    expect(s.message).toContain('15 %')
  })

  it('NE dérange PAS quand l’appareil est en charge, même très bas', () => {
    // Alerter alors que le téléphone recharge serait du bruit pur.
    expect(batteryStatus(0.05, true)).toBeNull()
    expect(batteryStatus(BATTERY_LOW, true)).toBeNull()
  })

  it('ignore les valeurs hors bornes ou invalides', () => {
    expect(batteryStatus(-0.1)).toBeNull()
    expect(batteryStatus(1.5)).toBeNull()
    expect(batteryStatus(NaN)).toBeNull()
    expect(batteryStatus(undefined)).toBeNull()
    expect(batteryStatus('bas')).toBeNull()
  })

  it('arrondit le pourcentage affiché', () => {
    expect(batteryStatus(0.187).pct).toBe(19)
  })
})

describe('readBattery() — dégrade sans jamais jeter', () => {
  it('renvoie null si l’API n’existe pas', async () => {
    vi.stubGlobal('navigator', {})
    await expect(readBattery()).resolves.toBeNull()
  })

  it('renvoie null si getBattery échoue', async () => {
    vi.stubGlobal('navigator', { getBattery: () => { throw new Error('refusé') } })
    await expect(readBattery()).resolves.toBeNull()
  })

  it('renvoie null si la réponse est inexploitable', async () => {
    vi.stubGlobal('navigator', { getBattery: async () => ({}) })
    await expect(readBattery()).resolves.toBeNull()
  })

  it('lit le niveau et l’état de charge', async () => {
    vi.stubGlobal('navigator', { getBattery: async () => ({ level: 0.42, charging: true }) })
    await expect(readBattery()).resolves.toEqual({ level: 0.42, charging: true })
  })
})
