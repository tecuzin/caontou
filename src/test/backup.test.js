import { describe, it, expect, vi, beforeEach } from 'vitest'

const isNativePlatform = vi.fn(() => false)
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => isNativePlatform() } }))

const writeFile = vi.fn(async () => {})
const getUri = vi.fn(async () => ({ uri: 'file:///fake/cantou-export.json' }))
vi.mock('@capacitor/filesystem', () => ({
  Filesystem: { writeFile: (...a) => writeFile(...a), getUri: (...a) => getUri(...a) },
  Directory: { Cache: 'CACHE' },
  Encoding: { UTF8: 'utf8' },
}))

const shareNative = vi.fn(async () => {})
vi.mock('@capacitor/share', () => ({ Share: { share: (...a) => shareNative(...a) } }))

const { STORE_KEYS, buildExport, exportFilename, parseImport, downloadExport, shareExport, formatLastBackup } = await import('../backup.js')

describe('buildExport()', () => {
  it('enveloppe les données dans { app, schema, exportedAt, data }', () => {
    const json = buildExport({ expenses: [], meals: [] }, 'cantou.v1')
    const parsed = JSON.parse(json)
    expect(parsed.app).toBe('cantou')
    expect(parsed.schema).toBe('cantou.v1')
    expect(parsed.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(parsed.data).toEqual({ expenses: [], meals: [] })
  })

  it('est un JSON indenté (lisible)', () => {
    const json = buildExport({ a: 1 }, 'cantou.v1')
    expect(json).toContain('\n')
  })
})

describe('exportFilename()', () => {
  it('produit un nom de fichier horodaté', () => {
    const name = exportFilename(new Date(2026, 7, 5, 14, 30))
    expect(name).toMatch(/^cantou-export-2026-08-05/)
    expect(name).toMatch(/\.json$/)
  })
})

describe('parseImport()', () => {
  it('accepte un export enveloppé { app: "cantou", data: {...} }', () => {
    const { data, error } = parseImport(JSON.stringify({ app: 'cantou', data: { expenses: [], budgetTotal: 100 } }))
    expect(error).toBe('')
    expect(data).toEqual({ expenses: [], budgetTotal: 100 })
  })

  it('accepte un store brut (sans enveloppe app/data)', () => {
    const { data, error } = parseImport(JSON.stringify({ expenses: [], meals: [] }))
    expect(error).toBe('')
    expect(data).toEqual({ expenses: [], meals: [] })
  })

  it('retourne une erreur pour un JSON invalide', () => {
    const { data, error } = parseImport('{ pas du json valide')
    expect(data).toBeNull()
    expect(error).toMatch(/JSON invalide/)
  })

  it('rejette un texte de plus de 5 Mo avant même de tenter le JSON.parse (audit sécurité)', () => {
    const huge = '{"a":"' + 'x'.repeat(6 * 1024 * 1024) + '"}'
    const { data, error } = parseImport(huge)
    expect(data).toBeNull()
    expect(error).toMatch(/trop volumineux/)
  })

  it('accepte un export de taille normale sous la limite', () => {
    const normal = JSON.stringify({ app: 'cantou', data: { expenses: Array(50).fill({ label: 'x', cat: 'y', amt: 1 }) } })
    const { data, error } = parseImport(normal)
    expect(error).toBe('')
    expect(data).toBeTruthy()
  })

  it('retourne une erreur pour un JSON valide mais étranger à Cantou', () => {
    const { data, error } = parseImport(JSON.stringify({ foo: 'bar' }))
    expect(data).toBeNull()
    expect(error).toMatch(/ne ressemble pas/)
  })

  it('retourne data null et pas d\'erreur pour un texte vide', () => {
    const { data, error } = parseImport('')
    expect(data).toBeNull()
    expect(error).toBe('')
  })

  it('retourne une erreur pour un tableau JSON (pas un objet reconnu)', () => {
    const { data, error } = parseImport('[1,2,3]')
    expect(data).toBeNull()
    expect(error).toMatch(/ne ressemble pas/)
  })

  it('STORE_KEYS contient les clés attendues du store', () => {
    expect(STORE_KEYS).toContain('expenses')
    expect(STORE_KEYS).toContain('trip')
    expect(STORE_KEYS).toContain('trajets')
  })

  it('STORE_KEYS inclut les données de référence et les fonctions (tout dans le JSON)', () => {
    for (const k of ['features', 'kidsGames', 'bingoItems', 'emergencyNumbers']) {
      expect(STORE_KEYS).toContain(k)
    }
  })

  it('reconnaît un export ne contenant que des données de référence', () => {
    const { data, error } = parseImport(JSON.stringify({ app: 'cantou', data: { bingoItems: [{ emoji: '🐄', label: 'x' }] } }))
    expect(error).toBe('')
    expect(data.bingoItems).toHaveLength(1)
  })
})

describe('downloadExport()', () => {
  it('crée un lien de téléchargement et déclenche le clic', () => {
    const createObjectURL = vi.fn(() => 'blob:fake-url')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadExport('{"a":1}', 'test-export.json')

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()

    clickSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('ne lève pas d\'exception si le DOM échoue', () => {
    expect(() => downloadExport('{}', 'x.json')).not.toThrow()
  })
})

describe('shareExport() — natif Android', () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(true)
    writeFile.mockClear(); getUri.mockClear(); shareNative.mockClear()
  })

  it('écrit le fichier dans le cache puis ouvre le sheet de partage natif', async () => {
    await shareExport('{"a":1}', 'export.json')
    expect(writeFile).toHaveBeenCalledWith(expect.objectContaining({ path: 'export.json', data: '{"a":1}' }))
    expect(getUri).toHaveBeenCalledWith(expect.objectContaining({ path: 'export.json' }))
    expect(shareNative).toHaveBeenCalledWith(expect.objectContaining({ url: 'file:///fake/cantou-export.json' }))
  })

  it('n\'échoue pas silencieusement si Filesystem lève une exception', async () => {
    writeFile.mockRejectedValueOnce(new Error('disk full'))
    await expect(shareExport('{}', 'x.json')).resolves.toBeUndefined()
  })
})

describe('shareExport() — web (navigator.share)', () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(false)
  })

  it('partage un fichier via navigator.share si canShare l\'accepte', async () => {
    const share = vi.fn(async () => {})
    const canShare = vi.fn(() => true)
    vi.stubGlobal('navigator', { ...navigator, share, canShare })
    await shareExport('{"a":1}', 'export.json')
    expect(canShare).toHaveBeenCalled()
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: 'Export Cantou' }))
    vi.unstubAllGlobals()
  })

  it('partage en texte si canShare refuse les fichiers', async () => {
    const share = vi.fn(async () => {})
    const canShare = vi.fn(() => false)
    vi.stubGlobal('navigator', { ...navigator, share, canShare })
    await shareExport('{"a":1}', 'export.json')
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ text: '{"a":1}' }))
    vi.unstubAllGlobals()
  })

  it('retombe sur le téléchargement si Web Share API absente', async () => {
    const original = { ...navigator }
    vi.stubGlobal('navigator', { userAgent: original.userAgent })
    const createObjectURL = vi.fn(() => 'blob:fake')
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await shareExport('{"a":1}', 'export.json')
    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
    vi.unstubAllGlobals()
  })
})

describe('formatLastBackup()', () => {
  it('retourne "jamais" si aucune sauvegarde n\'a été faite', () => {
    expect(formatLastBackup(null)).toBe('jamais')
  })

  it('retourne "aujourd\'hui" pour une sauvegarde du jour même', () => {
    const now = new Date(2026, 6, 4, 18, 0, 0)
    const backup = new Date(2026, 6, 4, 9, 0, 0).toISOString()
    expect(formatLastBackup(backup, now)).toBe("aujourd'hui")
  })

  it('retourne "hier" pour une sauvegarde de la veille', () => {
    const now = new Date(2026, 6, 4, 10, 0, 0)
    const backup = new Date(2026, 6, 3, 10, 0, 0).toISOString()
    expect(formatLastBackup(backup, now)).toBe('hier')
  })

  it('retourne "il y a N jours" au-delà', () => {
    const now = new Date(2026, 6, 10, 10, 0, 0)
    const backup = new Date(2026, 6, 4, 10, 0, 0).toISOString()
    expect(formatLastBackup(backup, now)).toBe('il y a 6 jours')
  })
})
