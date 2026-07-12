import { describe, it, expect, vi, beforeEach } from 'vitest'

const native = { value: false }
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => native.value } }))
const geo = { requestPermissions: vi.fn(), getCurrentPosition: vi.fn() }
vi.mock('@capacitor/geolocation', () => ({ Geolocation: geo }))

const { openExternal, currentPositionMapsHref } = await import('../links.js')

beforeEach(() => {
  native.value = false
  geo.requestPermissions.mockReset()
  geo.getCurrentPosition.mockReset()
})

describe('openExternal', () => {
  it('ouvre en _blank sur web et _system sur natif', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => {})
    openExternal('https://x.example')
    expect(open).toHaveBeenLastCalledWith('https://x.example', '_blank')
    native.value = true
    openExternal('https://x.example')
    expect(open).toHaveBeenLastCalledWith('https://x.example', '_system')
    open.mockRestore()
  })

  it('ne fait rien sans href', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => {})
    openExternal(null)
    expect(open).not.toHaveBeenCalled()
    open.mockRestore()
  })
})

describe('currentPositionMapsHref', () => {
  it('web : résout un lien Maps depuis navigator.geolocation', async () => {
    navigator.geolocation = { getCurrentPosition: (ok) => ok({ coords: { latitude: 45.03, longitude: 2.66 } }) }
    await expect(currentPositionMapsHref()).resolves.toBe('https://www.google.com/maps/search/?api=1&query=45.03,2.66')
  })

  it('web : rejette si la géoloc échoue', async () => {
    navigator.geolocation = { getCurrentPosition: (_ok, ko) => ko(new Error('refus')) }
    await expect(currentPositionMapsHref()).rejects.toThrow('refus')
  })

  it('web : rejette si la géoloc est indisponible', async () => {
    navigator.geolocation = undefined
    await expect(currentPositionMapsHref()).rejects.toThrow(/indisponible/)
  })

  it('natif : demande la permission puis résout la position', async () => {
    native.value = true
    geo.requestPermissions.mockResolvedValue({ location: 'granted' })
    geo.getCurrentPosition.mockResolvedValue({ coords: { latitude: 45, longitude: 2 } })
    await expect(currentPositionMapsHref()).resolves.toBe('https://www.google.com/maps/search/?api=1&query=45,2')
    expect(geo.requestPermissions).toHaveBeenCalled()
  })

  it('natif : rejette si la permission est refusée', async () => {
    native.value = true
    geo.requestPermissions.mockResolvedValue({ location: 'denied', coarseLocation: 'denied' })
    await expect(currentPositionMapsHref()).rejects.toThrow(/refusée/)
    expect(geo.getCurrentPosition).not.toHaveBeenCalled()
  })
})
