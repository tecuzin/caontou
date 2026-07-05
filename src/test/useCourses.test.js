import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCourses } from '../hooks/useCourses.js'

const sample = [
  { key: 'co_frais', name: 'Frais', items: ['Lait', 'Beurre'] },
  { key: 'co_epic', name: 'Epicerie', items: ['Pates'] },
]

describe('useCourses()', () => {
  it('initialise avec les catégories fournies', () => {
    const { result } = renderHook(() => useCourses(sample))
    expect(result.current.courses).toEqual(sample)
  })

  it('utilise COURSES_INITIAL par défaut si rien n\'est fourni', () => {
    const { result } = renderHook(() => useCourses(null))
    expect(result.current.courses.length).toBeGreaterThan(0)
  })

  it('addCourseCategory ajoute une catégorie avec une clé unique', () => {
    const { result } = renderHook(() => useCourses(sample))
    let key
    act(() => { key = result.current.addCourseCategory('Boissons') })
    expect(result.current.courses).toHaveLength(3)
    expect(result.current.courses[2]).toEqual({ key, name: 'Boissons', items: [] })
  })

  it('removeCourseCategory supprime la catégorie et retourne true', () => {
    const { result } = renderHook(() => useCourses(sample))
    let ok
    act(() => { ok = result.current.removeCourseCategory('co_frais') })
    expect(ok).toBe(true)
    expect(result.current.courses).toHaveLength(1)
    expect(result.current.courses[0].key).toBe('co_epic')
  })

  it('removeCourseCategory refuse de supprimer la dernière catégorie et retourne false', () => {
    const { result } = renderHook(() => useCourses([sample[0]]))
    let ok
    act(() => { ok = result.current.removeCourseCategory('co_frais') })
    expect(ok).toBe(false)
    expect(result.current.courses).toHaveLength(1)
  })

  it('addCourseItem ajoute un article à la bonne catégorie uniquement', () => {
    const { result } = renderHook(() => useCourses(sample))
    act(() => result.current.addCourseItem('co_frais', 'Cantal AOP'))
    expect(result.current.courses[0].items).toEqual(['Lait', 'Beurre', 'Cantal AOP'])
    expect(result.current.courses[1].items).toEqual(['Pates'])
  })

  it('removeCourseItem retire un article de la bonne catégorie uniquement', () => {
    const { result } = renderHook(() => useCourses(sample))
    act(() => result.current.removeCourseItem('co_frais', 'Lait'))
    expect(result.current.courses[0].items).toEqual(['Beurre'])
    expect(result.current.courses[1].items).toEqual(['Pates'])
  })
})
