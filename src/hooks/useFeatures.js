import { useState } from 'react'
import { isFeatureOn } from '../features.js'

/**
 * État des fonctionnalités activées/désactivées. `features` est une map
 * `{ [key]: false }` — on n'y stocke que les fonctions explicitement coupées ;
 * tout le reste est actif par défaut. Persisté tel quel dans le store et exporté
 * dans le JSON.
 */
export function useFeatures(initialFeatures) {
  const [features, setFeatures] = useState(initialFeatures || {})

  /** Bascule une fonction ; ne conserve `false` que pour les fonctions coupées. */
  const toggleFeature = (key) => {
    setFeatures((f) => {
      const next = { ...f }
      if (next[key] === false) delete next[key] // ré-activer = revenir au défaut
      else next[key] = false
      return next
    })
  }

  const isOn = (key) => isFeatureOn(features, key)

  return { features, setFeatures, toggleFeature, isOn }
}
