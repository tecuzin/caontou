import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'

const localStorageMock = (() => {
  let store = {}
  return { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] }, clear: () => { store = {} } }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'Notification', {
  value: class { static permission = 'denied'; static requestPermission = vi.fn().mockResolvedValue('denied') },
  writable: true,
})

beforeEach(() => { localStorageMock.clear() })

const openRestos = async (user) => {
  await user.click(screen.getByText('Restos'))
  await screen.findByTestId('screen-restos') // sous-écran lazy → attendre le chunk
}

describe('Carnet de restaurants (UI)', () => {
  it('ouvre l\'écran et affiche les adresses seed avec liens cliquables', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openRestos(user)
    expect(screen.getByTestId('screen-restos')).toBeInTheDocument()
    // lien Maps sur le lieu de la 1re adresse seed
    expect(screen.getAllByTestId('map-link').length).toBeGreaterThan(0)
  })

  it('ajoute un resto avec téléphone (lien tel:) et le persiste', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openRestos(user)
    await user.click(screen.getByTestId('btn-add-resto'))
    await user.type(await screen.findByTestId('resto-name'), 'Auberge test')
    await user.type(screen.getByTestId('resto-place'), 'Mur-de-Barrez')
    await user.type(screen.getByTestId('resto-tel'), '04 71 47 50 00')
    await user.click(screen.getByTestId('resto-reserved'))
    await user.click(screen.getByTestId('resto-save'))

    // affiché avec lien tel: nettoyé
    expect(screen.getByText('Auberge test')).toBeInTheDocument()
    const telLinks = screen.getAllByTestId('tel-link')
    expect(telLinks.some((a) => a.getAttribute('href') === 'tel:0471475000')).toBe(true)

    const stored = JSON.parse(window.localStorage.getItem('cantou.v1'))
    const added = stored.restos.find((r) => r.name === 'Auberge test')
    expect(added).toBeDefined()
    expect(added.reserved).toBe(true)
    expect(added.place).toBe('Mur-de-Barrez')
  })

  it('supprime un resto via la modale d\'édition', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openRestos(user)
    const before = JSON.parse(window.localStorage.getItem('cantou.v1'))?.restos?.length ?? screen.getAllByTestId(/^resto-\d+$/).length
    // édite la 1re adresse et la supprime
    const firstEdit = screen.getAllByTestId(/^resto-edit-/)[0]
    await user.click(firstEdit)
    await user.click(screen.getByTestId('resto-delete'))
    const after = JSON.parse(window.localStorage.getItem('cantou.v1')).restos.length
    expect(after).toBe(before - 1)
  })
})
