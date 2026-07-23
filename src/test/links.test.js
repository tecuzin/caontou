import { describe, it, expect } from 'vitest'
import { telHref, mapsHref, mapsCoordsHref, mapsDriveHref, placeQuery } from '../links.js'

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

  it('placeQuery privilégie les coordonnées, sinon adresse/place/nom', () => {
    expect(placeQuery({ lat: 45.02, lng: 2.66, name: 'Pas de Cère' })).toBe('45.02,2.66')
    expect(placeQuery({ adresse: 'Vezels-Roussy (15130)' })).toBe('Vezels-Roussy (15130)')
    expect(placeQuery({ place: 'Vic-sur-Cère' })).toBe('Vic-sur-Cère')
    expect(placeQuery({ name: 'Château de Messilhac' })).toBe('Château de Messilhac')
    expect(placeQuery('Aurillac')).toBe('Aurillac')
    expect(placeQuery({ lat: NaN, lng: 2 })).toBe('')
    expect(placeQuery(null)).toBe('')
  })

  it('mapsDriveHref construit un itinéraire voiture (coords ou texte)', () => {
    expect(mapsDriveHref({ lat: 45.02, lng: 2.66 }))
      .toBe('https://www.google.com/maps/dir/?api=1&destination=45.02%2C2.66&travelmode=driving')
    expect(mapsDriveHref('Vezels-Roussy, Cantal'))
      .toBe('https://www.google.com/maps/dir/?api=1&destination=Vezels-Roussy%2C%20Cantal&travelmode=driving')
    expect(mapsDriveHref('  ')).toBeNull()
    expect(mapsDriveHref(null)).toBeNull()
  })
})
