import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePlanning } from '../hooks/usePlanning.js'

const sample = [
  { dow: 'Mer', num: 5, title: 'Le grand départ', sub: 'Beauvais → Laschamps', items: [
    { time: '09:00', title: 'Départ', note: '', color: '#5b7042' },
    { time: '16:00', title: 'Arrivée', note: 'Étape', color: '#9c6b4a' },
  ] },
  { dow: 'Jeu', num: 6, title: 'Cap sur le Cantal', sub: 'Laschamps → Mandailles', items: [
    { time: '09:30', title: 'Départ', note: '', color: '#5b7042' },
  ] },
]

describe('usePlanning()', () => {
  it('initialise avec les jours fournis', () => {
    const { result } = renderHook(() => usePlanning(sample))
    expect(result.current.days).toEqual(sample)
  })

  it('utilise DAYS_INITIAL par défaut si rien n\'est fourni', () => {
    const { result } = renderHook(() => usePlanning(null))
    expect(result.current.days.length).toBeGreaterThan(0)
  })

  it('addDay ajoute un jour trié par numéro', () => {
    const { result } = renderHook(() => usePlanning(sample))
    act(() => result.current.addDay({ dow: 'Lun', num: 4, title: 'Avant-veille', sub: '', }))
    expect(result.current.days).toHaveLength(3)
    expect(result.current.days[0].num).toBe(4)
    expect(result.current.days[0].items).toEqual([])
  })

  it('updateDay modifie le jour à l\'index donné sans toucher aux autres', () => {
    const { result } = renderHook(() => usePlanning(sample))
    act(() => result.current.updateDay(0, { title: 'Nouveau titre' }))
    expect(result.current.days[0].title).toBe('Nouveau titre')
    expect(result.current.days[0].sub).toBe('Beauvais → Laschamps')
    expect(result.current.days[1]).toEqual(sample[1])
  })

  it('removeDay supprime le jour et retourne true', () => {
    const { result } = renderHook(() => usePlanning(sample))
    let ok
    act(() => { ok = result.current.removeDay(1) })
    expect(ok).toBe(true)
    expect(result.current.days).toHaveLength(1)
  })

  it('removeDay refuse de supprimer le dernier jour et retourne false', () => {
    const { result } = renderHook(() => usePlanning([sample[0]]))
    let ok
    act(() => { ok = result.current.removeDay(0) })
    expect(ok).toBe(false)
    expect(result.current.days).toHaveLength(1)
  })

  it('addActivity ajoute une activité triée par heure dans le bon jour', () => {
    const { result } = renderHook(() => usePlanning(sample))
    act(() => result.current.addActivity(0, { time: '12:00', title: 'Pause', note: '', color: '#cf7d3c' }))
    expect(result.current.days[0].items).toHaveLength(3)
    expect(result.current.days[0].items.map((it) => it.time)).toEqual(['09:00', '12:00', '16:00'])
    expect(result.current.days[1].items).toHaveLength(1)
  })

  it('updateActivity modifie l\'activité sans toucher à la note existante', () => {
    const { result } = renderHook(() => usePlanning(sample))
    act(() => result.current.updateActivity(0, 1, { time: '17:00', title: 'Arrivée tardive', color: '#b8503f' }))
    const updated = result.current.days[0].items.find((it) => it.title === 'Arrivée tardive')
    expect(updated.note).toBe('Étape')
    expect(updated.time).toBe('17:00')
  })

  it('removeActivity retire l\'activité du bon jour uniquement', () => {
    const { result } = renderHook(() => usePlanning(sample))
    act(() => result.current.removeActivity(0, 0))
    expect(result.current.days[0].items).toHaveLength(1)
    expect(result.current.days[1].items).toHaveLength(1)
  })
})
