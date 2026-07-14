import { describe, it, expect } from 'vitest'
import { s, eur, buildList, sortItemsByTime, parseDist, tripDate, fmtDayShort, fmtMonthYear } from '../utils.js'

describe('s() — CSS string to React style object', () => {
  it('converts a single property', () => {
    expect(s('color:red')).toEqual({ color: 'red' })
  })

  it('converts multiple properties', () => {
    expect(s('color:red;font-size:14px')).toEqual({ color: 'red', fontSize: '14px' })
  })

  it('camelCases kebab-case property names', () => {
    expect(s('background-color:#fff;border-radius:8px')).toEqual({
      backgroundColor: '#fff',
      borderRadius: '8px',
    })
  })

  it('trims whitespace around keys and values', () => {
    expect(s('  color : red ; font-size : 14px ')).toEqual({ color: 'red', fontSize: '14px' })
  })

  it('ignores declarations without a colon', () => {
    expect(s('color:red;bad;font-size:14px')).toEqual({ color: 'red', fontSize: '14px' })
  })

  it('handles trailing semicolon', () => {
    expect(s('color:red;')).toEqual({ color: 'red' })
  })

  it('returns empty object for empty string', () => {
    expect(s('')).toEqual({})
  })

  it('preserves values containing colons (e.g. URLs)', () => {
    const result = s('background:url(http://x.com/img.png)')
    expect(result.background).toBe('url(http://x.com/img.png)')
  })
})

describe('eur() — euro formatter', () => {
  it('formats whole numbers without decimals', () => {
    expect(eur(100)).toMatch(/100/)
    expect(eur(100)).toContain('€')
    expect(eur(100)).not.toMatch(/,/)
  })

  it('formats decimal numbers with 2 decimal places', () => {
    expect(eur(87.4)).toMatch(/87[,.]40/)
    expect(eur(87.4)).toContain('€')
  })

  it('formats zero', () => {
    expect(eur(0)).toMatch(/^0/)
    expect(eur(0)).toContain('€')
  })

  it('formats large amounts', () => {
    const result = eur(1800)
    expect(result).toContain('€')
  })
})
describe('buildList()', () => {
  const checks = { mykey: { Apple: true, Banana: false } }
  const items = ['Apple', 'Banana', 'Cherry']

  it('maps items to { label, checked }', () => {
    const { items: mapped } = buildList(checks, 'mykey', items)
    expect(mapped[0]).toEqual({ label: 'Apple', checked: true })
    expect(mapped[1]).toEqual({ label: 'Banana', checked: false })
    expect(mapped[2]).toEqual({ label: 'Cherry', checked: false })
  })

  it('counts done items correctly', () => {
    const { done, total } = buildList(checks, 'mykey', items)
    expect(done).toBe(1)
    expect(total).toBe(3)
  })

  it('computes pct correctly', () => {
    const { pct } = buildList(checks, 'mykey', items)
    expect(pct).toBe(33)
  })

  it('returns 0 pct for empty list', () => {
    const { pct, done, total } = buildList({}, 'x', [])
    expect(pct).toBe(0)
    expect(done).toBe(0)
    expect(total).toBe(0)
  })

  it('treats missing key as all unchecked', () => {
    const { done } = buildList({}, 'missing', ['A', 'B'])
    expect(done).toBe(0)
  })

  it('returns 100 pct when all checked', () => {
    const { pct } = buildList({ k: { A: true, B: true } }, 'k', ['A', 'B'])
    expect(pct).toBe(100)
  })
})

describe('sortItemsByTime()', () => {
  it('sorts items in chronological order', () => {
    const items = [
      { time: '14:00', title: 'Afternoon' },
      { time: '08:30', title: 'Morning' },
      { time: '12:00', title: 'Noon' },
    ]
    const sorted = sortItemsByTime(items)
    expect(sorted.map((i) => i.title)).toEqual(['Morning', 'Noon', 'Afternoon'])
  })

  it('puts non-time entries last', () => {
    const items = [
      { time: 'Matin', title: 'Lazy morning' },
      { time: '09:00', title: 'Early' },
    ]
    const sorted = sortItemsByTime(items)
    expect(sorted[0].title).toBe('Early')
    expect(sorted[1].title).toBe('Lazy morning')
  })

  it('does not mutate the input array', () => {
    const items = [{ time: '10:00' }, { time: '08:00' }]
    const original = [...items]
    sortItemsByTime(items)
    expect(items[0].time).toBe(original[0].time)
  })

  it('handles single-digit hours', () => {
    const items = [{ time: '9:00', title: 'Nine' }, { time: '10:00', title: 'Ten' }]
    const sorted = sortItemsByTime(items)
    expect(sorted[0].title).toBe('Nine')
  })
})

describe('parseDist()', () => {
  it('extracts numeric value from "25 min"', () => {
    expect(parseDist('25 min')).toBe(25)
  })

  it('extracts from plain number string', () => {
    expect(parseDist('45')).toBe(45)
  })

  it('returns 999 for non-numeric input', () => {
    expect(parseDist('N/A')).toBe(999)
  })

  it('returns 999 for empty string', () => {
    expect(parseDist('')).toBe(999)
  })

  it('handles leading text before number', () => {
    expect(parseDist('env. 30 min')).toBe(30)
  })

  it('parses hours and minutes', () => {
    expect(parseDist('1 h')).toBe(60)
    expect(parseDist('1 h 10')).toBe(70)
    expect(parseDist('2 h 05')).toBe(125)
  })
})

describe('tripDate() — construit une date locale depuis un ISO', () => {
  it('parse une date ISO yyyy-mm-dd à midi par défaut', () => {
    const d = tripDate('2026-08-05')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(7) // août = index 7
    expect(d.getDate()).toBe(5)
    expect(d.getHours()).toBe(12)
  })

  it('accepte une heure/minute explicite', () => {
    const d = tripDate('2026-08-05', 20, 30)
    expect(d.getHours()).toBe(20)
    expect(d.getMinutes()).toBe(30)
  })

  it('heure 0 pour début de journée', () => {
    const d = tripDate('2026-08-05', 0)
    expect(d.getHours()).toBe(0)
  })
})

describe('fmtDayShort() / fmtMonthYear()', () => {
  it('formate le jour court en français', () => {
    expect(fmtDayShort('2026-08-05')).toMatch(/5/)
  })

  it('formate le mois/année en français', () => {
    expect(fmtMonthYear('2026-08-05')).toMatch(/août/i)
    expect(fmtMonthYear('2026-08-05')).toMatch(/2026/)
  })
})
