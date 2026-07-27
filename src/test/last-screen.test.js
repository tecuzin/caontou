import { describe, it, expect, vi, afterEach } from 'vitest'
import { resumeTarget, readLastScreen, writeLastScreen, RESUME_MAX_AGE_MS } from '../last-screen.js'

const TABS = ['accueil', 'planning', 'visites', 'repas', 'budget']
const NOW = 1_800_000_000_000

afterEach(() => { vi.unstubAllGlobals() })

describe('resumeTarget()', () => {
  it('reprend un onglet récent', () => {
    expect(resumeTarget({ tab: 'budget', sub: null, at: NOW - 60_000 }, NOW, TABS))
      .toEqual({ tab: 'budget', sub: null })
  })

  it('reprend aussi le sous-écran', () => {
    expect(resumeTarget({ tab: 'accueil', sub: 'souvenirs', at: NOW - 1000 }, NOW, TABS))
      .toEqual({ tab: 'accueil', sub: 'souvenirs' })
  })

  it('ignore un écran trop ancien (au-delà de la fenêtre)', () => {
    // Reprendre un écran d'il y a 3 jours n'a aucun sens.
    expect(resumeTarget({ tab: 'budget', at: NOW - RESUME_MAX_AGE_MS - 1 }, NOW, TABS)).toBeNull()
  })

  it('ignore un onglet inconnu ou désactivé', () => {
    expect(resumeTarget({ tab: 'nawak', at: NOW }, NOW, TABS)).toBeNull()
    // onglet masqué par les Réglages : absent de validTabs
    expect(resumeTarget({ tab: 'budget', at: NOW }, NOW, ['accueil', 'planning'])).toBeNull()
  })

  it('ne restaure pas l’accueil nu (c’est déjà l’état par défaut)', () => {
    expect(resumeTarget({ tab: 'accueil', sub: null, at: NOW }, NOW, TABS)).toBeNull()
  })

  it('rejette un horodatage absent, invalide ou dans le futur', () => {
    expect(resumeTarget({ tab: 'budget' }, NOW, TABS)).toBeNull()
    expect(resumeTarget({ tab: 'budget', at: 'hier' }, NOW, TABS)).toBeNull()
    expect(resumeTarget({ tab: 'budget', at: NOW + 60_000 }, NOW, TABS)).toBeNull()
  })

  it('tolère une entrée absente ou corrompue', () => {
    expect(resumeTarget(null, NOW, TABS)).toBeNull()
    expect(resumeTarget('bidon', NOW, TABS)).toBeNull()
    expect(resumeTarget({}, NOW, TABS)).toBeNull()
  })
})

describe('readLastScreen() / writeLastScreen()', () => {
  it('écrit puis relit', () => {
    const store = {}
    vi.stubGlobal('localStorage', {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => { store[k] = v },
    })
    writeLastScreen('repas', null)
    const out = readLastScreen()
    expect(out.tab).toBe('repas')
    expect(typeof out.at).toBe('number')
  })

  it('renvoie null si le contenu est illisible', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{pas du json', setItem: () => {} })
    expect(readLastScreen()).toBeNull()
  })

  it('n’échoue pas si le quota est plein (la reprise est un confort)', () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw new Error('quota') } })
    expect(() => writeLastScreen('budget', null)).not.toThrow()
  })
})
