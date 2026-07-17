import { describe, it, expect } from 'vitest'
import { applyMigrations, isValidSchema, LATEST_SCHEMA } from '../migrations.js'
import { TRIP_INITIAL, TRAJETS_INITIAL } from '../data.js'

describe('Store migrations', () => {
  it('accepte un store sans schemaVersion (rétro-compat)', () => {
    const store = { saved: {}, checks: {} }
    const result = applyMigrations(store, 1)
    expect(result.schemaVersion).toBe(LATEST_SCHEMA)
  })

  it('valide un store avec schemaVersion valide', () => {
    const store = { schemaVersion: 1, saved: {} }
    expect(isValidSchema(store)).toBe(true)
  })

  it('rejette un store invalide', () => {
    expect(isValidSchema(null)).toBe(false)
    expect(isValidSchema('not an object')).toBe(false)
  })

  it('préserve les données à travers les migrations (favoris, dépenses, checks)', () => {
    const store = { saved: { 1: true, 5: true }, expenses: [{ amt: 10 }], checks: { tr_dep: { x: true } } }
    const result = applyMigrations(store, 1)
    expect(result.saved).toEqual({ 1: true, 5: true })
    expect(result.expenses).toEqual([{ amt: 10 }])
    expect(result.checks.tr_dep.x).toBe(true)
  })

  describe('v1 → v2 : re-basage Carladès (incident Lyon-Mandailles)', () => {
    it('remplace le trajet et le trip stales par les valeurs Carladès', () => {
      const store = {
        trip: { start: '2026-08-05', end: '2026-08-15', origin: 'Lyon', etape: '', destination: 'Mandailles' },
        trajets: { aller: [{ time: '08:00', place: 'Depart de Lyon', note: '', color: '#5b7042' }], retour: [] },
        saved: { 2: true },
      }
      const result = applyMigrations(store, 1)
      expect(result.trip.origin).toBe(TRIP_INITIAL.origin)
      expect(result.trip.destination).toBe(TRIP_INITIAL.destination)
      expect(result.trip.etape).toBe(TRIP_INITIAL.etape)
      expect(result.trip.start).toBe('2026-08-05') // dates utilisateur conservées
      expect(result.trajets).toEqual(TRAJETS_INITIAL)
      expect(result.saved).toEqual({ 2: true })
      expect(result.schemaVersion).toBe(LATEST_SCHEMA)
    })

    it('migre l\'ancien format trajetSteps (route Lyon) vers trajets Carladès', () => {
      const store = { trajetSteps: [{ place: 'Lyon Part-Dieu' }] }
      const result = applyMigrations(store, 1)
      expect(result.trajets).toEqual(TRAJETS_INITIAL)
      expect(result.trajetSteps).toBeUndefined()
    })

    it('corrige l\'hébergement « Mandailles » sans toucher au Wi-Fi ni au contact', () => {
      const store = { hebergement: { nom: 'La Grange', adresse: 'Mandailles', wifiNom: 'PersoWifi', contact: 'M. X' } }
      const result = applyMigrations(store, 1)
      expect(result.hebergement.adresse).toBe('Vezels-Roussy (15130)')
      expect(result.hebergement.wifiNom).toBe('PersoWifi')
      expect(result.hebergement.contact).toBe('M. X')
    })

    it('ne touche pas aux valeurs personnalisées non stales', () => {
      const store = {
        trip: { start: '2026-08-01', end: '2026-08-10', origin: 'Lille', etape: '', destination: 'Vezels-Roussy (Cantal)' },
        trajets: { aller: [{ place: 'Depart de Lille' }], retour: [] },
      }
      const result = applyMigrations(store, 1)
      expect(result.trip.origin).toBe('Lille')
      expect(result.trajets.aller[0].place).toBe('Depart de Lille')
    })

    it('est un no-op sur trip pour un store déjà en v2', () => {
      const store = { schemaVersion: 2, trip: { origin: 'Lyon' } } // « Lyon » choisi volontairement en v2
      const result = applyMigrations(store, 2)
      expect(result.trip.origin).toBe('Lyon')
    })
  })

  describe('v2 → v3 : backfill des coordonnées de visites', () => {
    it('ajoute lat/lng par id sur les visites connues sans coords', () => {
      const store = { schemaVersion: 2, visits: [{ id: 1, name: 'Pas de Cère' }] }
      const result = applyMigrations(store, 2)
      expect(typeof result.visits[0].lat).toBe('number')
      expect(typeof result.visits[0].lng).toBe('number')
      expect(result.schemaVersion).toBe(LATEST_SCHEMA)
    })

    it('ne réécrit pas des coords déjà présentes', () => {
      const store = { schemaVersion: 2, visits: [{ id: 1, name: 'X', lat: 12.3, lng: 4.5 }] }
      const result = applyMigrations(store, 2)
      expect(result.visits[0].lat).toBe(12.3)
      expect(result.visits[0].lng).toBe(4.5)
    })

    it('laisse intactes les visites personnalisées (id inconnu)', () => {
      const store = { schemaVersion: 2, visits: [{ id: 9999, name: 'Ma visite perso' }] }
      const result = applyMigrations(store, 2)
      expect(result.visits[0]).toEqual({ id: 9999, name: 'Ma visite perso' })
    })

    it('backfill aussi via la chaîne complète depuis v1', () => {
      const store = { visits: [{ id: 2, name: 'Le Lioran' }] }
      const result = applyMigrations(store, 1)
      expect(typeof result.visits[0].lat).toBe('number')
      expect(result.schemaVersion).toBe(LATEST_SCHEMA)
    })
  })

  describe('v3 → v4 : données de référence dans le store', () => {
    it('seed jeux/bingo/urgences depuis les constantes si absents', () => {
      const store = { schemaVersion: 3 }
      const result = applyMigrations(store, 3)
      expect(Array.isArray(result.kidsGames)).toBe(true)
      expect(result.kidsGames.length).toBeGreaterThan(0)
      expect(Array.isArray(result.bingoItems)).toBe(true)
      expect(Array.isArray(result.emergencyNumbers)).toBe(true)
      expect(result.schemaVersion).toBe(4)
    })

    it('ne réécrit pas des listes déjà personnalisées', () => {
      const custom = [{ emoji: '🎯', label: 'Perso' }]
      const store = { schemaVersion: 3, bingoItems: custom }
      const result = applyMigrations(store, 3)
      expect(result.bingoItems).toEqual(custom)
    })

    it('seed via la chaîne complète depuis v1', () => {
      const result = applyMigrations({}, 1)
      expect(Array.isArray(result.kidsGames)).toBe(true)
      expect(Array.isArray(result.emergencyNumbers)).toBe(true)
      expect(result.schemaVersion).toBe(LATEST_SCHEMA)
    })
  })
})
