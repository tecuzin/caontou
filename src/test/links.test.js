import { describe, it, expect } from 'vitest'
import { telHref, mapsHref, mapsCoordsHref } from '../links.js'

describe('Liens actionnables', () => {
  it('telHref nettoie les espaces et garde le +', () => {
    expect(telHref('06 12 34 56 78')).toBe('tel:0612345678')
    expect(telHref('+33 6 12 34 56 78')).toBe('tel:+33612345678')
    expect(telHref('112')).toBe('tel:112')
  })

  it('telHref ne garde qu\'un + en tête', () => {
    expect(telHref('+33 (0)6-12')).toBe('tel:+330612')
    expect(telHref('06+12')).toBe('tel:0612') // + non initial retiré
  })

  it('telHref renvoie null si vide', () => {
    expect(telHref('')).toBeNull()
    expect(telHref(null)).toBeNull()
  })

  it('mapsHref encode l\'adresse', () => {
    expect(mapsHref('Vezels-Roussy, Cantal')).toBe('https://www.google.com/maps/search/?api=1&query=Vezels-Roussy%2C%20Cantal')
    expect(mapsHref('  ')).toBeNull()
  })

  it('mapsCoordsHref formate lat,lng', () => {
    expect(mapsCoordsHref(45.03, 2.66)).toBe('https://www.google.com/maps/search/?api=1&query=45.03,2.66')
    expect(mapsCoordsHref(NaN, 2)).toBeNull()
    expect(mapsCoordsHref('a', 'b')).toBeNull()
  })
})
