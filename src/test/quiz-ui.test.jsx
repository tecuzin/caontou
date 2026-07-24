import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Quiz } from '../screens/Quiz.jsx'
import { QUIZ_QUESTIONS } from '../quiz.js'
import { s } from '../utils.js'

const store = {}
beforeEach(() => { for (const k in store) delete store[k] })
Object.defineProperty(window, 'localStorage', {
  value: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] }, clear: () => {} },
  configurable: true,
})

describe('Quiz — flashcards', () => {
  it('révèle la réponse au tap puis avance', () => {
    render(<Quiz sx={s} />)
    expect(screen.queryByTestId('quiz-answer')).toBeNull()
    fireEvent.click(screen.getByTestId('quiz-card'))
    expect(screen.getByTestId('quiz-answer')).toHaveTextContent(QUIZ_QUESTIONS[0].a)
    fireEvent.click(screen.getByTestId('quiz-knew'))
    // carte suivante : réponse de nouveau masquée
    expect(screen.queryByTestId('quiz-answer')).toBeNull()
  })

  it('affiche le score final et enregistre le record', () => {
    render(<Quiz sx={s} />)
    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      fireEvent.click(screen.getByTestId('quiz-card'))
      fireEvent.click(screen.getByTestId('quiz-knew'))
    }
    expect(screen.getByTestId('quiz-result')).toHaveTextContent(`${QUIZ_QUESTIONS.length}/${QUIZ_QUESTIONS.length}`)
    expect(store['cantou.quizBest']).toBe(String(QUIZ_QUESTIONS.length))
  })
})
