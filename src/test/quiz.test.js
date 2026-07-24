import { describe, it, expect } from 'vitest'
import { QUIZ_QUESTIONS, quizScorePct } from '../quiz.js'

describe('quiz — banque de questions', () => {
  it('contient des questions bien formées (q + a non vides)', () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(10)
    for (const c of QUIZ_QUESTIONS) {
      expect(typeof c.q).toBe('string'); expect(c.q.length).toBeGreaterThan(0)
      expect(typeof c.a).toBe('string'); expect(c.a.length).toBeGreaterThan(0)
    }
  })
})

describe('quizScorePct()', () => {
  it('calcule le pourcentage entier', () => {
    expect(quizScorePct(12, 12)).toBe(100)
    expect(quizScorePct(6, 12)).toBe(50)
    expect(quizScorePct(0, 12)).toBe(0)
  })
  it('borne les valeurs aberrantes et gère total nul', () => {
    expect(quizScorePct(99, 12)).toBe(100)
    expect(quizScorePct(-3, 12)).toBe(0)
    expect(quizScorePct(1, 0)).toBe(0)
  })
})
