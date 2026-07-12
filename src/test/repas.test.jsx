import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Repas } from '../screens/Repas.jsx'
import { s } from '../utils.js'

function makeProps(over = {}) {
  return {
    sx: s, mealTab: 'repas', setMealTab: vi.fn(),
    meals: [{ id: 1, day: 'Mer 5', dish: 'Aligot' }],
    editMeal: vi.fn(), deleteMeal: vi.fn(), openAddMeal: vi.fn(),
    coursesDone: 2, coursesTotal: 5, coursesPct: 40, coursesSorted: false, setCoursesSorted: vi.fn(),
    coursesGroups: [{ key: 'frais', name: 'Frais', doneStr: '1/2', items: [
      { label: 'Lait', checked: false }, { label: 'Beurre', checked: true },
    ] }],
    toggleCheck: vi.fn(), deleteCourseCategory: vi.fn(), deleteCourseItem: vi.fn(),
    setEditingCourseKey: vi.fn(), setShowAddCourseItem: vi.fn(), setShowAddCourseCat: vi.fn(),
    shoppingItems: [{ id: 9, label: 'Piles', checked: false }],
    toggleShoppingItem: vi.fn(), deleteShoppingItem: vi.fn(),
    newShoppingItem: '', setNewShoppingItem: vi.fn(), addShoppingItem: vi.fn(),
    ...over,
  }
}

describe('Écran Repas & courses', () => {
  it('onglet Menus : liste les repas et permet édition/suppression/ajout', async () => {
    const p = makeProps()
    const user = userEvent.setup()
    render(<Repas {...p} />)
    expect(screen.getByTestId('screen-repas')).toBeInTheDocument()
    expect(screen.getByText('Aligot')).toBeInTheDocument()
    expect(screen.getByText(/Spécialités à goûter/)).toBeInTheDocument()
    await user.click(screen.getByText('✏️'))
    expect(p.editMeal).toHaveBeenCalledWith(1)
    await user.click(screen.getByText('🗑️'))
    expect(p.deleteMeal).toHaveBeenCalledWith(1)
    await user.click(screen.getByText('+ Ajouter un repas'))
    expect(p.openAddMeal).toHaveBeenCalledOnce()
  })

  it('bascule vers l\'onglet Courses', async () => {
    const p = makeProps()
    const user = userEvent.setup()
    render(<Repas {...p} />)
    await user.click(screen.getByText('Courses'))
    expect(p.setMealTab).toHaveBeenCalledWith('courses')
  })

  it('onglet Courses : coche un article, gère catégories et articles', async () => {
    const p = makeProps({ mealTab: 'courses' })
    const user = userEvent.setup()
    render(<Repas {...p} />)
    expect(screen.getByText('Frais')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
    await user.click(screen.getByText('Lait'))
    expect(p.toggleCheck).toHaveBeenCalledWith('frais', 'Lait')
    await user.click(screen.getByText('+ Nouvelle catégorie'))
    expect(p.setShowAddCourseCat).toHaveBeenCalledWith(true)
  })

  it('onglet Courses : ajoute un article de gestion', async () => {
    const p = makeProps({ mealTab: 'courses', newShoppingItem: 'Lampe' })
    const user = userEvent.setup()
    render(<Repas {...p} />)
    expect(screen.getByText('Piles')).toBeInTheDocument()
    await user.click(screen.getByText('+ Ajouter'))
    expect(p.addShoppingItem).toHaveBeenCalledOnce()
  })

  it('onglet Courses : bascule le tri, supprime catégorie/article et ajoute un article', async () => {
    const p = makeProps({ mealTab: 'courses' })
    const user = userEvent.setup()
    render(<Repas {...p} />)
    // article coché affiché barré (branche checked)
    expect(screen.getByText('Beurre')).toBeInTheDocument()
    await user.click(screen.getByText(/Non cochés en premier/))
    expect(p.setCoursesSorted).toHaveBeenCalledWith(true)
    await user.click(screen.getByText('+ Ajouter article'))
    expect(p.setEditingCourseKey).toHaveBeenCalledWith('frais')
    expect(p.setShowAddCourseItem).toHaveBeenCalledWith(true)
    // suppressions : catégorie (1er 🗑️ de la catégorie) et article
    const trash = screen.getAllByText('🗑️')
    await user.click(trash[0])
    expect(p.deleteCourseCategory).toHaveBeenCalledWith('frais')
    await user.click(screen.getByRole('checkbox'))
    expect(p.toggleShoppingItem).toHaveBeenCalledWith(9)
    await user.click(trash[trash.length - 1])
    expect(p.deleteShoppingItem).toHaveBeenCalledWith(9)
  })

  it('onglet Courses : ordonne les items quand le tri est actif', () => {
    const p = makeProps({ mealTab: 'courses', coursesSorted: true })
    render(<Repas {...p} />)
    expect(screen.getByText('Lait')).toBeInTheDocument()
    expect(screen.getByText('Beurre')).toBeInTheDocument()
  })
})
