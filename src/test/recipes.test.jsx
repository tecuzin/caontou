import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Recipes } from '../screens/Recipes.jsx'
import { RECIPES_INITIAL } from '../data.js'
import { s } from '../utils.js'

describe('Recipes — fiches recettes éditables', () => {
  it('affiche les recettes et déplie ingrédients/étapes', () => {
    render(<Recipes sx={s} recipes={RECIPES_INITIAL} setRecipes={() => {}} />)
    expect(screen.getByTestId('recipe-1')).toHaveTextContent('Aligot')
    fireEvent.click(screen.getByTestId('recipe-toggle-1'))
    expect(screen.getByTestId('recipe-1')).toHaveTextContent('tome fraîche')
  })

  it('ajoute une recette via le formulaire', () => {
    const setRecipes = vi.fn()
    render(<Recipes sx={s} recipes={[]} setRecipes={setRecipes} />)
    fireEvent.click(screen.getByTestId('recipe-add'))
    fireEvent.change(screen.getByTestId('recipe-name'), { target: { value: 'Pâté aux pommes de terre' } })
    fireEvent.change(screen.getByTestId('recipe-ingredients'), { target: { value: 'Pommes de terre\nCrème' } })
    fireEvent.change(screen.getByTestId('recipe-steps'), { target: { value: 'Éplucher\nCuire' } })
    fireEvent.click(screen.getByTestId('recipe-save'))
    expect(setRecipes).toHaveBeenCalled()
    const updater = setRecipes.mock.calls[0][0]
    const result = updater([])
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ name: 'Pâté aux pommes de terre', ingredients: ['Pommes de terre', 'Crème'], steps: ['Éplucher', 'Cuire'] })
  })

  it('ne sauvegarde pas sans nom', () => {
    const setRecipes = vi.fn()
    render(<Recipes sx={s} recipes={[]} setRecipes={setRecipes} />)
    fireEvent.click(screen.getByTestId('recipe-add'))
    fireEvent.click(screen.getByTestId('recipe-save'))
    expect(setRecipes).not.toHaveBeenCalled()
  })

  it('supprime une recette', () => {
    const setRecipes = vi.fn()
    render(<Recipes sx={s} recipes={RECIPES_INITIAL} setRecipes={setRecipes} />)
    fireEvent.click(screen.getByTestId('recipe-toggle-1'))
    fireEvent.click(screen.getByTestId('recipe-delete-1'))
    const result = setRecipes.mock.calls[0][0](RECIPES_INITIAL)
    expect(result.find((r) => r.id === 1)).toBeUndefined()
  })
})
