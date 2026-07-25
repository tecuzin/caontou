import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const isNativePlatform = vi.fn(() => false)
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => isNativePlatform() } }))

const writeFile = vi.fn(async () => {})
const readFile = vi.fn(async () => ({ data: 'BASE64DATA' }))
const getUri = vi.fn(async () => ({ uri: 'file:///cache/cantou-album.html' }))
vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: (...a) => writeFile(...a),
    readFile: (...a) => readFile(...a),
    getUri: (...a) => getUri(...a),
  },
  Directory: { Cache: 'CACHE', Data: 'DATA' },
  Encoding: { UTF8: 'utf8' },
}))

const shareNative = vi.fn(async () => {})
vi.mock('@capacitor/share', () => ({ Share: { share: (...a) => shareNative(...a) } }))

const { buildAlbumHtml, albumHasContent, escapeHtml, albumFilename, downloadAlbum, buildNativeSrcMap, shareAlbum } =
  await import('../album.js')

const DAYS = [
  { dow: 'Mer', num: 5, title: 'Arrivée au gîte' },
  { dow: 'Jeu', num: 6, title: 'Pas de Cère' },
  { dow: 'Ven', num: 7, title: 'Le Lioran' },
]
const TRIP = { start: '2026-08-05', end: '2026-08-15', destination: 'Vezels-Roussy (Cantal)' }

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('escapeHtml() — cas limites', () => {
  it('convertit les valeurs non textuelles', () => {
    expect(escapeHtml(0)).toBe('0')
    expect(escapeHtml(false)).toBe('false')
    expect(escapeHtml(12.5)).toBe('12.5')
  })
  it('échappe toutes les occurrences, pas seulement la première', () => {
    expect(escapeHtml('<<>>')).toBe('&lt;&lt;&gt;&gt;')
    expect(escapeHtml('a&b&c')).toBe('a&amp;b&amp;c')
  })
  it('n\'échappe pas deux fois les entités déjà produites de façon incorrecte', () => {
    // & est échappé en premier : le résultat reste décodable une seule fois.
    expect(escapeHtml('&lt;')).toBe('&amp;lt;')
  })
  it('laisse passer accents et emojis', () => {
    expect(escapeHtml('Été 🏔️ à Vezels')).toBe('Été 🏔️ à Vezels')
  })
})

describe('albumHasContent() — cas limites', () => {
  it('faux sur un planning vide', () => {
    expect(albumHasContent([], {}, [])).toBe(false)
  })
  it('faux si l\'entrée de journal ne contient que des espaces', () => {
    expect(albumHasContent(DAYS, { 'Mer 5': { text: '   ', best: '', quote: '' } }, [])).toBe(false)
  })
  it('vrai si seule une humeur est renseignée', () => {
    expect(albumHasContent(DAYS, { 'Mer 5': { mood: '😍' } }, [])).toBe(true)
  })
  it('ignore une clé de journal qui ne correspond à aucun jour du planning', () => {
    expect(albumHasContent(DAYS, { 'Lun 30': { text: 'hors séjour' } }, [])).toBe(false)
  })
  it('tolère un groupe de photos sans tableau photos', () => {
    expect(albumHasContent(DAYS, {}, [{ key: 'Mer 5', label: 'x' }])).toBe(false)
  })
  it('utilise les valeurs par défaut quand journal et photos sont omis', () => {
    expect(albumHasContent(DAYS)).toBe(false)
  })
})

describe('buildAlbumHtml() — structure du document', () => {
  it('assemble un document complet et bien formé', () => {
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, journal: { 'Mer 5': { text: 'ok' } } })
    expect(html).toContain('<html lang="fr">')
    expect(html).toContain('<meta charset="utf-8">')
    expect(html).toContain('name="viewport"')
    expect(html.trim().endsWith('</html>')).toBe(true)
    expect(html).toContain('<footer>Album souvenir · Cantou 🏔️</footer>')
    // balises appariées
    expect((html.match(/<section class="day">/g) || []).length)
      .toBe((html.match(/<\/section>/g) || []).length)
  })

  it('fonctionne sans aucun argument (valeurs par défaut)', () => {
    const html = buildAlbumHtml({})
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('Notre séjour')
    expect(html).toContain('Aucun souvenir enregistré')
    expect(html).not.toContain('class="dates"')
  })

  it('omet la ligne de dates si le séjour n\'a pas de start/end', () => {
    const html = buildAlbumHtml({ trip: { destination: 'Cantal' }, days: DAYS, journal: { 'Mer 5': { text: 'x' } } })
    expect(html).toContain('<h1>Cantal</h1>')
    expect(html).not.toContain('class="dates"')
  })

  it('échappe la destination dans le titre et la couverture', () => {
    const html = buildAlbumHtml({ trip: { destination: '<b>Gîte</b> "chez nous"' }, days: [] })
    expect(html).not.toContain('<b>Gîte</b>')
    expect(html).toContain('&lt;b&gt;Gîte&lt;/b&gt; &quot;chez nous&quot;')
    // présent deux fois : <title> et <h1>
    expect((html.match(/&lt;b&gt;Gîte&lt;\/b&gt;/g) || []).length).toBe(2)
  })

  it('convertit les retours à la ligne du journal en <br>', () => {
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, journal: { 'Mer 5': { text: 'ligne 1\nligne 2' } } })
    expect(html).toContain('ligne 1<br>ligne 2')
  })

  it('n\'émet que les champs renseignés (pas de libellé orphelin)', () => {
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, journal: { 'Mer 5': { best: 'la cascade', quote: '   ' } } })
    expect(html).toContain('⭐ Moment préféré :')
    expect(html).not.toContain('💬 Phrase du jour :')
  })

  it('crée une section pour un jour qui n\'a que des photos', () => {
    const photosByDay = [{ key: 'Jeu 6', label: 'Jeu 6', photos: [{ id: 'p1' }] }]
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, photosByDay, srcMap: { p1: 'data:image/jpeg;base64,AAA' } })
    expect(html).toContain('Jeu 6 — Pas de Cère')
    expect(html).toContain('<div class="photos">')
    expect(html).toContain('alt=""')
  })

  it('n\'ouvre pas de bloc photos si aucune data-URL n\'est disponible', () => {
    const photosByDay = [{ key: 'Mer 5', label: 'x', photos: [{ id: 'p1' }, { id: 'p2' }] }]
    const srcMap = { p1: 'http://exemple/p1.jpg' }
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, journal: { 'Mer 5': { text: 'ok' } }, photosByDay, srcMap })
    expect(html).not.toContain('<div class="photos">')
    expect(html).not.toContain('http://exemple/p1.jpg')
  })

  it('ignore un groupe de photos dont la clé ne correspond à aucun jour', () => {
    const photosByDay = [{ key: 'Dim 99', label: 'x', photos: [{ id: 'p1' }] }]
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, photosByDay, srcMap: { p1: 'data:image/jpeg;base64,AAA' } })
    expect(html).toContain('Aucun souvenir enregistré')
  })

  it('embarque plusieurs photos du même jour dans l\'ordre', () => {
    const photosByDay = [{ key: 'Mer 5', label: 'x', photos: [{ id: 'p1' }, { id: 'p2' }] }]
    const srcMap = { p1: 'data:image/jpeg;base64,AAA', p2: 'data:image/jpeg;base64,BBB' }
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, photosByDay, srcMap })
    expect(html.indexOf('base64,AAA')).toBeLessThan(html.indexOf('base64,BBB'))
    expect((html.match(/<img src="data:/g) || []).length).toBe(2)
  })

  it('produit une section par jour renseigné', () => {
    const journal = { 'Mer 5': { text: 'a' }, 'Ven 7': { text: 'b' } }
    const html = buildAlbumHtml({ trip: TRIP, days: DAYS, journal })
    expect((html.match(/<section class="day">/g) || []).length).toBe(2)
    expect(html).not.toContain('Pas de Cère')
  })
})

describe('albumFilename()', () => {
  it('utilise la date du jour par défaut', () => {
    expect(albumFilename()).toMatch(/^cantou-album-\d{4}-\d{2}-\d{2}\.html$/)
  })
})

describe('downloadAlbum()', () => {
  it('crée un blob HTML, un lien nommé et déclenche le clic', () => {
    const createObjectURL = vi.fn(() => 'blob:album')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      expect(this.download).toBe('album.html')
      expect(this.getAttribute('href')).toBe('blob:album')
    })

    downloadAlbum('<html></html>', 'album.html')

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
  })

  it('ne lève jamais, même si URL.createObjectURL échoue', () => {
    vi.stubGlobal('URL', { ...URL, createObjectURL: () => { throw new Error('nope') } })
    expect(() => downloadAlbum('<html></html>', 'x.html')).not.toThrow()
  })
})

describe('buildNativeSrcMap()', () => {
  beforeEach(() => { readFile.mockClear(); readFile.mockResolvedValue({ data: 'BASE64DATA' }) })

  it('lit les fichiers locaux et produit un srcMap 100 % data-URL', async () => {
    const photosByDay = [{ key: 'Mer 5', photos: [{ id: 'p1', file: 'a.jpg' }, { id: 'p2', file: 'b.jpg' }] }]
    const out = await buildNativeSrcMap(photosByDay, {})
    expect(readFile).toHaveBeenCalledTimes(2)
    expect(readFile).toHaveBeenCalledWith({ path: 'a.jpg', directory: 'DATA' })
    expect(out.p1).toBe('data:image/jpeg;base64,BASE64DATA')
    expect(out.p2).toBe('data:image/jpeg;base64,BASE64DATA')
  })

  it('conserve les data-URL déjà présentes sans relire le fichier', async () => {
    const photosByDay = [{ key: 'Mer 5', photos: [{ id: 'p1', file: 'a.jpg' }] }]
    const out = await buildNativeSrcMap(photosByDay, { p1: 'data:image/jpeg;base64,DEJA' })
    expect(readFile).not.toHaveBeenCalled()
    expect(out.p1).toBe('data:image/jpeg;base64,DEJA')
  })

  it('laisse l\'entrée telle quelle si la lecture échoue (photo manquante)', async () => {
    readFile.mockRejectedValueOnce(new Error('ENOENT'))
    const photosByDay = [{ key: 'Mer 5', photos: [{ id: 'p1', file: 'a.jpg' }] }]
    const out = await buildNativeSrcMap(photosByDay, { p1: 'file:///local/a.jpg' })
    expect(out.p1).toBe('file:///local/a.jpg')
  })

  it('tolère un groupe sans photos et un srcMap omis', async () => {
    await expect(buildNativeSrcMap([{ key: 'Mer 5' }])).resolves.toEqual({})
    await expect(buildNativeSrcMap([])).resolves.toEqual({})
  })
})

describe('shareAlbum()', () => {
  beforeEach(() => {
    writeFile.mockClear(); getUri.mockClear(); shareNative.mockClear()
    writeFile.mockResolvedValue(undefined)
    isNativePlatform.mockReturnValue(false)
  })

  it('natif : écrit le HTML dans le cache puis ouvre la feuille de partage', async () => {
    isNativePlatform.mockReturnValue(true)
    await shareAlbum('<html>album</html>', 'album.html')
    expect(writeFile).toHaveBeenCalledWith(expect.objectContaining({
      path: 'album.html', data: '<html>album</html>', directory: 'CACHE', encoding: 'utf8',
    }))
    expect(shareNative).toHaveBeenCalledWith(expect.objectContaining({ url: 'file:///cache/cantou-album.html' }))
  })

  it('natif : n\'explose pas si l\'écriture échoue', async () => {
    isNativePlatform.mockReturnValue(true)
    writeFile.mockRejectedValueOnce(new Error('disk full'))
    await expect(shareAlbum('<html></html>', 'a.html')).resolves.toBeUndefined()
    expect(shareNative).not.toHaveBeenCalled()
  })

  it('web : partage un fichier HTML via navigator.share', async () => {
    const share = vi.fn(async () => {})
    const canShare = vi.fn(() => true)
    vi.stubGlobal('navigator', { ...navigator, share, canShare })
    await shareAlbum('<html></html>', 'album.html')
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: 'Album souvenir Cantou' }))
  })

  it('web : retombe sur le téléchargement si canShare refuse les fichiers', async () => {
    vi.stubGlobal('navigator', { ...navigator, share: vi.fn(async () => {}), canShare: vi.fn(() => false) })
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn() })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await shareAlbum('<html></html>', 'album.html')
    expect(clickSpy).toHaveBeenCalled()
  })

  it('web : télécharge directement si la Web Share API est absente', async () => {
    vi.stubGlobal('navigator', { userAgent: 'test' })
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn() })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await shareAlbum('<html></html>')
    expect(clickSpy).toHaveBeenCalled()
    expect(shareNative).not.toHaveBeenCalled()
  })
})
