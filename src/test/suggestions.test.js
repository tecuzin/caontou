import { describe, it, expect, vi, beforeEach } from 'vitest'

const isNativePlatform = vi.fn(() => false)
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => isNativePlatform() } }))

const shareNative = vi.fn(async () => {})
vi.mock('@capacitor/share', () => ({ Share: { share: (...a) => shareNative(...a) } }))

const { formatSuggestionsMessage, shareSuggestions } = await import('../suggestions.js')

const sample = [
  { id: 1, text: 'Ajouter un mode sombre', createdAt: '2026-07-04T10:00:00.000Z' },
  { id: 2, text: 'Le bouton X ne marche pas', createdAt: '2026-07-04T11:30:00.000Z' },
]

describe('formatSuggestionsMessage()', () => {
  it('retourne une chaîne vide pour une liste vide', () => {
    expect(formatSuggestionsMessage([])).toBe('')
  })

  it('numérote les suggestions et inclut le texte de chacune', () => {
    const msg = formatSuggestionsMessage(sample, new Date(2026, 6, 4, 20, 30))
    expect(msg).toContain('1. ')
    expect(msg).toContain('Ajouter un mode sombre')
    expect(msg).toContain('2. ')
    expect(msg).toContain('Le bouton X ne marche pas')
  })

  it('inclut le nombre total de suggestions dans l\'en-tête', () => {
    const msg = formatSuggestionsMessage(sample, new Date(2026, 6, 4))
    expect(msg).toContain('(2)')
  })

  it('inclut une date d\'envoi lisible en français', () => {
    const msg = formatSuggestionsMessage(sample, new Date(2026, 6, 4, 20, 30))
    expect(msg).toMatch(/Envoyé depuis l'app le/)
    expect(msg).toContain('2026')
  })
})

describe('shareSuggestions()', () => {
  beforeEach(() => {
    shareNative.mockClear()
  })

  it('ne partage rien pour une liste vide', async () => {
    isNativePlatform.mockReturnValue(true)
    await shareSuggestions([])
    expect(shareNative).not.toHaveBeenCalled()
  })

  it('partage en natif Android via Share.share', async () => {
    isNativePlatform.mockReturnValue(true)
    await shareSuggestions(sample)
    expect(shareNative).toHaveBeenCalledWith(expect.objectContaining({ title: 'Suggestions Cantou' }))
    const { text } = shareNative.mock.calls[0][0]
    expect(text).toContain('Ajouter un mode sombre')
  })

  it('partage via navigator.share si disponible sur le web', async () => {
    isNativePlatform.mockReturnValue(false)
    const share = vi.fn(async () => {})
    vi.stubGlobal('navigator', { ...navigator, share })
    await shareSuggestions(sample)
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: 'Suggestions Cantou' }))
    vi.unstubAllGlobals()
  })

  it('retombe sur le presse-papiers si aucune API de partage n\'est disponible', async () => {
    isNativePlatform.mockReturnValue(false)
    const writeText = vi.fn(async () => {})
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    await shareSuggestions(sample)
    expect(writeText).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('n\'échoue pas silencieusement si le partage lève une exception', async () => {
    isNativePlatform.mockReturnValue(true)
    shareNative.mockRejectedValueOnce(new Error('cancelled'))
    await expect(shareSuggestions(sample)).resolves.toBeUndefined()
  })
})
