import { useState } from 'react'

/**
 * État et actions du domaine "suggestions" — notes libres laissées dans
 * l'app pour de futures fonctionnalités ou intégrations de données,
 * destinées à être relues via l'export/partage Telegram.
 */
export function useSuggestions(initialSuggestions) {
  const [suggestions, setSuggestions] = useState(initialSuggestions || [])

  const addSuggestion = (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const newId = Math.max(0, ...suggestions.map((s) => s.id)) + 1
    setSuggestions((list) => [...list, { id: newId, text: trimmed, createdAt: new Date().toISOString() }])
  }

  const removeSuggestion = (id) => {
    setSuggestions((list) => list.filter((s) => s.id !== id))
  }

  return { suggestions, setSuggestions, addSuggestion, removeSuggestion }
}
