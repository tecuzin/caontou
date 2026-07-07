import { useState } from 'react'
import { COURSES_INITIAL } from '../data.js'

/**
 * État et actions du domaine "courses" (catégories de shopping) — même
 * forme que la logistique (liste de groupes avec clé stable + items).
 */
export function useCourses(initialCourses) {
  const [courses, setCourses] = useState(initialCourses || structuredClone(COURSES_INITIAL))

  const addCourseCategory = (name) => {
    const key = `cc_${Date.now()}`
    setCourses((list) => [...list, { key, name, items: [] }])
    return key
  }

  /** Retourne false sans rien faire si c'est la dernière catégorie restante. */
  const removeCourseCategory = (key) => {
    if (courses.length <= 1) return false
    setCourses((list) => list.filter((g) => g.key !== key))
    return true
  }

  const addCourseItem = (key, item) => {
    setCourses((list) => list.map((g) => g.key === key ? { ...g, items: [...g.items, item] } : g))
  }

  const removeCourseItem = (key, item) => {
    setCourses((list) => list.map((g) => g.key === key ? { ...g, items: g.items.filter((i) => i !== item) } : g))
  }

  return { courses, setCourses, addCourseCategory, removeCourseCategory, addCourseItem, removeCourseItem }
}
