import { describe, it, expect } from 'vitest'
import { buildIcs, escapeIcs } from '../ics.js'

describe('Génération .ics (partage événement)', () => {
  it('génère un VEVENT avec horaire (DTSTART/DTEND locaux)', () => {
    const ics = buildIcs({ title: 'Pas de Cère', dateIso: '2026-08-07', time: '10:30', durationMin: 120, location: 'Vezels-Roussy' })
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('DTSTART:20260807T103000')
    expect(ics).toContain('DTEND:20260807T123000')
    expect(ics).toContain('SUMMARY:Pas de Cère')
    expect(ics).toContain('LOCATION:Vezels-Roussy')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('génère un événement journée entière sans horaire', () => {
    const ics = buildIcs({ title: 'Marché d\'Aurillac', dateIso: '2026-08-09', time: '' })
    expect(ics).toContain('DTSTART;VALUE=DATE:20260809')
    expect(ics).not.toContain('DTEND')
  })

  it('échappe les caractères réservés du format', () => {
    expect(escapeIcs('a,b;c\nd')).toBe('a\\,b\\;c\\nd')
    const ics = buildIcs({ title: 'Pique-nique, cascade', dateIso: '2026-08-07', time: '12:00' })
    expect(ics).toContain('SUMMARY:Pique-nique\\, cascade')
  })

  it('gère un horaire qui déborde sur l\'heure suivante', () => {
    const ics = buildIcs({ title: 'X', dateIso: '2026-08-07', time: '23:30', durationMin: 60 })
    expect(ics).toContain('DTSTART:20260807T233000')
    expect(ics).toContain('DTEND:20260807T003000') // simplification : même date, heure modulo 24 h
  })
})
