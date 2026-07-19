import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfflineCheck } from '../screens/OfflineCheck.jsx'
import { s } from '../utils.js'

const full = () => ({ visits: [{}], days: [{}], meals: [{}], courses: [{}], logi: [{}], hebergement: {} })

describe('OfflineCheck — écran prêt hors-ligne', () => {
  it('bandeau « prêt » quand tout est là + liste les dépendances réseau', () => {
    render(<OfflineCheck sx={s} storeData={full} />)
    expect(screen.getByTestId('offline-ready-banner')).toHaveTextContent('Prêt pour le hors-ligne')
    expect(screen.getByTestId('offline-check-visits')).toHaveTextContent('✅')
    expect(screen.getByTestId('offline-net-osm')).toBeInTheDocument()
    expect(screen.getByTestId('offline-net-share')).toBeInTheDocument()
  })

  it('bandeau « presque prêt » si une donnée manque', () => {
    render(<OfflineCheck sx={s} storeData={() => ({ visits: [], days: [], meals: [], courses: [], logi: [] })} />)
    expect(screen.getByTestId('offline-ready-banner')).toHaveTextContent('Presque prêt')
  })

  it('propose le pré-chargement des tuiles de la carte détaillée', () => {
    render(<OfflineCheck sx={s} storeData={full} />)
    expect(screen.getByTestId('tile-preload')).toBeInTheDocument()
    expect(screen.getByTestId('btn-preload-tiles')).toHaveTextContent(/Pré-charger la carte/)
    expect(screen.getByTestId('tile-cached-count')).toHaveTextContent(/tuile\(s\) en cache/)
  })
})
