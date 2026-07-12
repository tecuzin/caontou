import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const native = { value: false }
const getPhoto = vi.fn()
const fs = {
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  deleteFile: vi.fn().mockResolvedValue(undefined),
  getUri: vi.fn().mockResolvedValue({ uri: 'file://p.jpeg' }),
  readFile: vi.fn().mockResolvedValue({ data: 'BASE64DATA' }),
}
const shareSpy = vi.fn().mockResolvedValue(undefined)

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => native.value, convertFileSrc: (u) => `cap://${u}` } }))
vi.mock('@capacitor/camera', () => ({ Camera: { getPhoto: (...a) => getPhoto(...a) }, CameraResultType: { Base64: 'b64' }, CameraSource: { Camera: 'CAM', Photos: 'PHO' } }))
vi.mock('@capacitor/filesystem', () => ({ Filesystem: fs, Directory: { Data: 'DATA' } }))
vi.mock('@capacitor/share', () => ({ Share: { share: (...a) => shareSpy(...a) } }))

const { usePhotos } = await import('../hooks/usePhotos.js')

const trip = { start: '2026-08-05' }
const days = []

beforeEach(() => { native.value = false; Object.values(fs).forEach((f) => f.mockClear()); getPhoto.mockReset(); shareSpy.mockClear() })
afterEach(() => { delete navigator.share })

describe('usePhotos', () => {
  it('capturePhoto : écrit le fichier, ajoute la méta et l\'aperçu', async () => {
    getPhoto.mockResolvedValue({ base64String: 'ABC' })
    const { result } = renderHook(() => usePhotos([], trip, days))
    let meta
    await act(async () => { meta = await result.current.capturePhoto('camera') })
    expect(fs.writeFile).toHaveBeenCalledOnce()
    expect(result.current.photos).toHaveLength(1)
    expect(result.current.srcMap[meta.id]).toBe('data:image/jpeg;base64,ABC')
  })

  it('capturePhoto : renvoie null si annulation (pas de base64)', async () => {
    getPhoto.mockResolvedValue({})
    const { result } = renderHook(() => usePhotos([], trip, days))
    let r
    await act(async () => { r = await result.current.capturePhoto('photos') })
    expect(r).toBeNull()
    expect(result.current.photos).toHaveLength(0)
  })

  it('capturePhoto : renvoie null si le plugin rejette (permission)', async () => {
    getPhoto.mockRejectedValue(new Error('denied'))
    const { result } = renderHook(() => usePhotos([], trip, days))
    let r
    await act(async () => { r = await result.current.capturePhoto() })
    expect(r).toBeNull()
  })

  it('deletePhoto : retire la méta et supprime le fichier', async () => {
    const initial = [{ id: 'p1', file: 'cantou-photos/p1.jpeg', day: 'autres' }]
    const { result } = renderHook(() => usePhotos(initial, trip, days))
    await act(async () => { await result.current.deletePhoto('p1') })
    expect(result.current.photos).toHaveLength(0)
    expect(fs.deleteFile).toHaveBeenCalledOnce()
  })

  it('loadSrc web : lit le fichier en data-URL', async () => {
    const { result } = renderHook(() => usePhotos([], trip, days))
    await act(async () => { await result.current.loadSrc({ id: 'p1', file: 'f.jpeg' }) })
    expect(fs.readFile).toHaveBeenCalledOnce()
    expect(result.current.srcMap.p1).toBe('data:image/jpeg;base64,BASE64DATA')
  })

  it('loadSrc natif : convertit l\'URI fichier', async () => {
    native.value = true
    const { result } = renderHook(() => usePhotos([], trip, days))
    await act(async () => { await result.current.loadSrc({ id: 'p2', file: 'f.jpeg' }) })
    expect(fs.getUri).toHaveBeenCalledOnce()
    expect(result.current.srcMap.p2).toBe('cap://file://p.jpeg')
  })

  it('shareDay web : partage un résumé de la journée', async () => {
    navigator.share = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => usePhotos([], trip, days))
    await act(async () => { await result.current.shareDay([{ id: 'p1', file: 'f.jpeg' }], 'Mer 5') })
    expect(navigator.share).toHaveBeenCalledOnce()
  })

  it('shareDay : ne fait rien sans photo', async () => {
    navigator.share = vi.fn()
    const { result } = renderHook(() => usePhotos([], trip, days))
    await act(async () => { await result.current.shareDay([], 'Mer 5') })
    expect(navigator.share).not.toHaveBeenCalled()
  })
})
