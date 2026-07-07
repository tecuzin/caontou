import { useState } from 'react'
import { TRIP_INITIAL } from '../data.js'

/**
 * État et action du domaine "paramètres du voyage" (dates, origine, étape,
 * destination). Un seul objet, pas de liste — la validation des champs
 * (dates non vides, ordre cohérent) reste côté appelant, qui connaît le
 * contexte du formulaire.
 */
export function useTripConfig(initialTrip) {
  const [trip, setTrip] = useState(initialTrip || { ...TRIP_INITIAL })

  const updateTrip = (data) => {
    setTrip((t) => ({ ...t, ...data }))
  }

  return { trip, setTrip, updateTrip }
}
