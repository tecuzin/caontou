import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const native = { value: false }
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => native.value } }))
const shareSpy = vi.fn().mockResolvedValue(undefined)
vi.mock('@capacitor/share', () => ({ Share: { share: (...a) => shareSpy(...a) } }))
vi.mock('@capacitor/filesystem', () => ({
  Filesystem: { writeFile: vi.fn().mockResolvedValue(undefined), getUri: vi.fn().mockResolvedValue({ uri: 'file://x.ics' }) },
  Directory: { Cache: 'CACHE' }, Encoding: { UTF8: 'utf8' },
}))

const { shareRecap } = await import('../recap.js')
const { shareJournal } = await import('../journal.js')
const { shareIcs } = await import('../ics.js')

const recap = { daysCount: 3, spent: 100, budgetTotal: 300, spentPct: 33, savedVisits: 2, packPct: 50, coursesPct: 60, mealsPlanned: 6, photosCount: 4, topCategories: [{ name: 'A', amt: 50 }] }
const days = [{ dow: 'Mer', num: 5, title: 'Arrivée' }]
const journal = { 'Mer 5': { mood: '😍', best: 'Le lac', quote: 'Super' } }

beforeEach(() => { native.value = false; shareSpy.mockClear() })
afterEach(() => { delete navigator.share; delete navigator.canShare; delete navigator.clipboard })

describe('shareRecap', () => {
  it('web : utilise navigator.share si présent', async () => {
    navigator.share = vi.fn().mockResolvedValue(undefined)
    await shareRecap(recap)
    expect(navigator.share).toHaveBeenCalledOnce()
    expect(navigator.share.mock.calls[0][0].text).toContain('Notre séjour dans le Cantal')
  })

  it('web : copie dans le presse-papier en dernier recours', async () => {
    navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
    await shareRecap(recap)
    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce()
  })

  it('natif : passe par la feuille Capacitor', async () => {
    native.value = true
    await shareRecap(recap)
    expect(shareSpy).toHaveBeenCalledOnce()
  })
})

describe('shareJournal', () => {
  it('web : partage le texte compilé', async () => {
    navigator.share = vi.fn().mockResolvedValue(undefined)
    await shareJournal(days, journal)
    expect(navigator.share).toHaveBeenCalledOnce()
  })

  it('ne partage rien si le journal est vide', async () => {
    navigator.share = vi.fn()
    await shareJournal(days, {})
    expect(navigator.share).not.toHaveBeenCalled()
  })
})

describe('shareIcs', () => {
  it('web sans Web Share : déclenche un téléchargement (blob + <a>)', async () => {
    global.URL.createObjectURL = vi.fn(() => 'blob:x')
    global.URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await shareIcs('BEGIN:VCALENDAR', 'ev.ics')
    expect(click).toHaveBeenCalledOnce()
    click.mockRestore()
  })

  it('web avec Web Share fichiers : partage le fichier', async () => {
    navigator.canShare = vi.fn(() => true)
    navigator.share = vi.fn().mockResolvedValue(undefined)
    await shareIcs('BEGIN:VCALENDAR', 'ev.ics')
    expect(navigator.share).toHaveBeenCalledOnce()
    expect(navigator.share.mock.calls[0][0].files).toHaveLength(1)
  })

  it('natif : écrit le fichier et partage son URI', async () => {
    native.value = true
    await shareIcs('BEGIN:VCALENDAR', 'ev.ics')
    expect(shareSpy).toHaveBeenCalledOnce()
    expect(shareSpy.mock.calls[0][0].url).toBe('file://x.ics')
  })
})
