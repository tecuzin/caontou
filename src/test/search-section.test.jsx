import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchSection } from '../screens/accueil/SearchSection.jsx'
import { s } from '../utils.js'

const storeData = () => ({
  visits: [{ id: 1, name: 'Pas de Cère', cat: 'Nature' }],
  restos: [{ id: 1, name: 'Truffade au buron', place: 'Curebourse' }],
  meals: [], days: [], logi: [], courses: [], shoppingItems: [], trajets: {}, journal: {},
})

describe('SearchSection — recherche globale', () => {
  it('n\'affiche rien sous 2 caractères', () => {
    render(<SearchSection sx={s} storeData={storeData} setTab={() => {}} setSub={() => {}} setDay={() => {}} />)
    fireEvent.change(screen.getByTestId('global-search-input'), { target: { value: 'a' } })
    expect(screen.queryByTestId('global-search-results')).toBeNull()
  })

  it('affiche des résultats groupés et aiguille au tap', () => {
    const setTab = vi.fn(); const setSub = vi.fn()
    render(<SearchSection sx={s} storeData={storeData} setTab={setTab} setSub={setSub} setDay={() => {}} />)
    fireEvent.change(screen.getByTestId('global-search-input'), { target: { value: 'buron' } })
    const results = screen.getAllByTestId('global-search-result')
    expect(results.length).toBe(1)
    expect(results[0]).toHaveTextContent('Truffade au buron')
    fireEvent.click(results[0])
    expect(setSub).toHaveBeenCalledWith('restos') // resto → sous-écran restos
  })

  it('message quand aucun résultat', () => {
    render(<SearchSection sx={s} storeData={storeData} setTab={() => {}} setSub={() => {}} setDay={() => {}} />)
    fireEvent.change(screen.getByTestId('global-search-input'), { target: { value: 'zzzzz' } })
    expect(screen.getByTestId('global-search-results')).toHaveTextContent('Aucun résultat')
  })
})
