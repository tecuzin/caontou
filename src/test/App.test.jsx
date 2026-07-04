import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'

// localStorage mock
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Notification API mock
Object.defineProperty(window, 'Notification', {
  value: class { static permission = 'denied'; static requestPermission = vi.fn().mockResolvedValue('denied') },
  writable: true,
})

beforeEach(() => {
  localStorageMock.clear()
})

describe('Navigation par onglets', () => {
  it('affiche l\'écran Accueil au démarrage', () => {
    render(<App />)
    expect(screen.getByTestId('screen-accueil')).toBeInTheDocument()
  })

  it('navigue vers Planning au clic sur l\'onglet', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-planning'))
    expect(screen.getByTestId('screen-planning')).toBeInTheDocument()
    expect(screen.queryByTestId('screen-accueil')).not.toBeInTheDocument()
  })

  it('navigue vers Visites', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-visites'))
    expect(screen.getByTestId('screen-visites')).toBeInTheDocument()
  })

  it('navigue vers Repas', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-repas'))
    expect(screen.getByTestId('screen-repas')).toBeInTheDocument()
  })

  it('navigue vers Budget', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-budget'))
    expect(screen.getByTestId('screen-budget')).toBeInTheDocument()
  })

  it('revient à Accueil depuis un autre onglet', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-planning'))
    await user.click(screen.getByTestId('tab-accueil'))
    expect(screen.getByTestId('screen-accueil')).toBeInTheDocument()
  })
})

describe('Accueil — contenu', () => {
  it('affiche le compte à rebours J-', () => {
    render(<App />)
    expect(screen.getAllByText(/J-\d+/)[0]).toBeInTheDocument()
  })

  it('affiche la destination', () => {
    render(<App />)
    const accueil = screen.getByTestId('screen-accueil')
    expect(within(accueil).getAllByText(/Puy Mary/)[0]).toBeInTheDocument()
  })

  it('affiche les modules de navigation', () => {
    render(<App />)
    expect(screen.getByText('Trajet')).toBeInTheDocument()
    expect(screen.getByText('Hébergement')).toBeInTheDocument()
    expect(screen.getByText('Préparatifs')).toBeInTheDocument()
    // Budget appears in tab bar + module card — both are fine
    expect(screen.getAllByText('Budget').length).toBeGreaterThanOrEqual(1)
  })

  it('n\'affiche plus la ligne "Bonjour" ni l\'avatar (nettoyage demandé)', () => {
    render(<App />)
    expect(screen.queryByText(/Bonjour/)).not.toBeInTheDocument()
  })

  it('affiche le panorama montagnes en fond de la carte héro', () => {
    render(<App />)
    expect(screen.getByTestId('hero-panorama-bg')).toBeInTheDocument()
  })

  it('expose un landmark <main> pour l\'accessibilité (audit Lighthouse)', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})

describe('Budget — ajout d\'une dépense', () => {
  it('ouvre le formulaire au clic sur "+ Ajouter une dépense"', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-budget'))
    await user.click(screen.getByTestId('btn-add-depense'))
    expect(screen.getByTestId('input-montant')).toBeInTheDocument()
  })

  it('ajoute une dépense et la rend visible', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-budget'))
    await user.click(screen.getByTestId('btn-add-depense'))

    await user.type(screen.getByTestId('input-montant'), '42')
    await user.type(screen.getByTestId('input-label'), 'Glaces Dienne')
    await user.click(screen.getByTestId('btn-submit-depense'))

    expect(screen.getByText('Glaces Dienne')).toBeInTheDocument()
  })

  it('ferme le formulaire après ajout', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-budget'))
    await user.click(screen.getByTestId('btn-add-depense'))
    await user.type(screen.getByTestId('input-montant'), '10')
    await user.click(screen.getByTestId('btn-submit-depense'))

    expect(screen.queryByTestId('input-montant')).not.toBeInTheDocument()
  })

  it('n\'ajoute pas de dépense si montant vide', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-budget'))

    const countBefore = screen.getAllByText(/€/).length
    await user.click(screen.getByTestId('btn-add-depense'))
    await user.click(screen.getByTestId('btn-submit-depense'))

    // Formulaire reste ouvert (validation échoue silencieusement)
    expect(screen.getByTestId('input-montant')).toBeInTheDocument()
  })
})

describe('Planning — navigation jours', () => {
  it('affiche les onglets jours', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-planning'))
    const planning = screen.getByTestId('screen-planning')
    expect(within(planning).getAllByText('Sam').length).toBeGreaterThan(0)
    expect(within(planning).getAllByText('Dim').length).toBeGreaterThan(0)
  })

  it('affiche les activités du jour sélectionné', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-planning'))
    expect(screen.getByText('Le grand départ')).toBeInTheDocument()
  })
})

describe('Visites — filtres et tri', () => {
  it('affiche la liste des visites', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-visites'))
    // Au moins une visite doit être présente
    const screen_visites = screen.getByTestId('screen-visites')
    expect(within(screen_visites).getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('affiche les boutons de tri Distance et Catégorie', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-visites'))
    expect(screen.getByText(/📍.*Distance|Distance.*📍/)).toBeInTheDocument()
    expect(screen.getByText(/🏷️.*Catégorie|Catégorie.*🏷️/)).toBeInTheDocument()
  })

  it('ouvre bien la modal au clic sur "+ Ajouter visite" (régression)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-visites'))
    await user.click(screen.getByText('+ Ajouter visite'))
    expect(screen.getByText('Ajouter une visite')).toBeInTheDocument()
  })

  it('ajoute une nouvelle visite via la modal', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-visites'))
    await user.click(screen.getByText('+ Ajouter visite'))
    await user.type(screen.getByPlaceholderText('Ex : Puy Mary'), 'Grotte du Loup')
    await user.click(screen.getByText('Enregistrer'))
    expect(screen.getByText('Grotte du Loup')).toBeInTheDocument()
  })
})

describe('Persistance localStorage', () => {
  it('recharge les dépenses sauvegardées au remontage', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    await user.click(screen.getByTestId('tab-budget'))
    await user.click(screen.getByTestId('btn-add-depense'))
    await user.type(screen.getByTestId('input-montant'), '99')
    await user.type(screen.getByTestId('input-label'), 'Test persistance')
    await user.click(screen.getByTestId('btn-submit-depense'))

    unmount()
    render(<App />)
    await user.click(screen.getByTestId('tab-budget'))
    expect(screen.getByText('Test persistance')).toBeInTheDocument()
  })
})

describe('Export / import des données', () => {
  it('ouvre la modal export avec un JSON Cantou complet', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-export'))
    const json = screen.getByTestId('export-json').value
    const parsed = JSON.parse(json)
    expect(parsed.app).toBe('cantou')
    expect(parsed.schema).toBe('cantou.v1')
    expect(parsed.data).toHaveProperty('expenses')
    expect(parsed.data).toHaveProperty('meals')
    expect(parsed.data).toHaveProperty('budgetTotal')
  })

  it('valide un export collé et affiche le résumé', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-import'))
    const payload = JSON.stringify({ app: 'cantou', data: { expenses: [{ label: 'X', cat: 'Extra', amt: 5 }], meals: [], budgetTotal: 1000 } })
    fireEvent.change(screen.getByTestId('import-textarea'), { target: { value: payload } })
    expect(screen.getByTestId('import-preview')).toBeInTheDocument()
    expect(screen.getByTestId('btn-apply-import')).not.toBeDisabled()
  })

  it('rejette un JSON qui n\'est pas un export Cantou', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-import'))
    fireEvent.change(screen.getByTestId('import-textarea'), { target: { value: '{"foo":1}' } })
    expect(screen.queryByTestId('import-preview')).not.toBeInTheDocument()
    expect(screen.getByTestId('btn-apply-import')).toBeDisabled()
  })

  it('écrit le store importé dans localStorage au clic sur Remplacer', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-import'))
    const payload = JSON.stringify({ app: 'cantou', data: { expenses: [{ label: 'Importé', cat: 'Extra', amt: 42 }], budgetTotal: 2500 } })
    fireEvent.change(screen.getByTestId('import-textarea'), { target: { value: payload } })
    await user.click(screen.getByTestId('btn-apply-import'))
    const stored = JSON.parse(window.localStorage.getItem('cantou.v1'))
    expect(stored.budgetTotal).toBe(2500)
    expect(stored.expenses[0].label).toBe('Importé')
  })
})

describe('Undo suppression', () => {
  it('restaure une dépense supprimée via le bandeau Annuler', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-budget'))
    await user.click(screen.getByTestId('btn-add-depense'))
    await user.type(screen.getByTestId('input-montant'), '33')
    await user.type(screen.getByTestId('input-label'), 'Test undo')
    await user.click(screen.getByTestId('btn-submit-depense'))
    expect(screen.getByText('Test undo')).toBeInTheDocument()

    const row = screen.getByText('Test undo').closest('div').parentElement.parentElement
    await user.click(within(row).getByText('🗑️'))
    expect(screen.queryByText('Test undo')).not.toBeInTheDocument()
    expect(screen.getByTestId('undo-snackbar')).toBeInTheDocument()

    await user.click(screen.getByTestId('btn-undo'))
    expect(screen.getByText('Test undo')).toBeInTheDocument()
    expect(screen.queryByTestId('undo-snackbar')).not.toBeInTheDocument()
  })
})

describe('Paramètres du voyage', () => {
  it('modifie les dates et villes du voyage', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-trip-settings'))
    await user.clear(screen.getByTestId('input-trip-origin'))
    await user.type(screen.getByTestId('input-trip-origin'), 'Paris')
    await user.clear(screen.getByTestId('input-trip-dest'))
    await user.type(screen.getByTestId('input-trip-dest'), 'Marseille')
    await user.click(screen.getByTestId('btn-save-trip'))
    const stored = JSON.parse(window.localStorage.getItem('cantou.v1'))
    expect(stored.trip.origin).toBe('Paris')
    expect(stored.trip.destination).toBe('Marseille')
  })
})

describe('Trajet aller / retour', () => {
  it('bascule entre les étapes aller et retour', async () => {
    const user = userEvent.setup()
    render(<App />)
    const trajetModule = screen.getByText('Trajet')
    await user.click(trajetModule)
    expect(screen.getByTestId('btn-trajet-aller')).toBeInTheDocument()
    expect(screen.getByTestId('btn-trajet-retour')).toBeInTheDocument()
    await user.click(screen.getByTestId('btn-trajet-retour'))
    expect(screen.getByText(/Les etapes · retour/)).toBeInTheDocument()
  })
})

describe('Listes de préparatifs personnalisables', () => {
  it('ajoute une nouvelle liste de logistique', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Préparatifs'))
    await user.click(screen.getByTestId('btn-add-logi-list'))
    await user.type(screen.getByTestId('input-logi-list-name'), 'Sac de plage')
    await user.click(screen.getByTestId('btn-save-logi-list'))
    expect(screen.getByText('Sac de plage')).toBeInTheDocument()
  })
})

describe('Planning : ajout de jour', () => {
  it('ajoute un nouveau jour au planning', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-planning'))
    await user.click(screen.getByTestId('btn-add-day'))
    await user.type(screen.getByTestId('input-day-dow'), 'Dim')
    await user.type(screen.getByTestId('input-day-num'), '16')
    await user.type(screen.getByTestId('input-day-title'), 'Journée bonus')
    await user.click(screen.getByTestId('btn-save-day-add'))
    const stored = JSON.parse(window.localStorage.getItem('cantou.v1'))
    expect(stored.days.some((d) => d.title === 'Journée bonus')).toBe(true)
  })
})

describe('Écran Aujourd\'hui', () => {
  it('n\'affiche pas la carte Aujourd\'hui hors des dates du voyage', () => {
    vi.setSystemTime(new Date(2020, 0, 1))
    render(<App />)
    expect(screen.queryByTestId('today-card')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('affiche la carte Aujourd\'hui pendant le voyage avec planning/météo/repas du jour', () => {
    vi.setSystemTime(new Date(2026, 7, 6, 10, 0, 0)) // 6 août 2026, dans la fenêtre par défaut (5-15 août)
    render(<App />)
    const card = screen.getByTestId('today-card')
    expect(card).toBeInTheDocument()
    expect(within(card).getByText(/Jeu 6/)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('navigue vers le planning du jour au clic', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 10, 0, 0))
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Voir le planning du jour →'))
    expect(screen.getByTestId('screen-planning')).toBeInTheDocument()
    vi.useRealTimers()
  })
})

describe('Partage natif de la sauvegarde', () => {
  it('affiche le bouton de partage dans la modal export', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-export'))
    expect(screen.getByTestId('btn-share-export')).toBeInTheDocument()
  })
})

describe('Rappel de sauvegarde', () => {
  it('affiche "jamais" avant toute sauvegarde', () => {
    render(<App />)
    expect(screen.getByTestId('last-backup-label')).toHaveTextContent('jamais')
  })

  it('passe à "aujourd\'hui" après un export copié', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-export'))
    await user.click(screen.getByText('📋 Copier'))
    expect(screen.getByTestId('last-backup-label')).toHaveTextContent("aujourd'hui")
  })

  it('persiste la date de dernière sauvegarde dans localStorage', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(screen.getByTestId('btn-export'))
    await user.click(screen.getByText('📋 Copier'))
    unmount()
    render(<App />)
    expect(screen.getByTestId('last-backup-label')).toHaveTextContent("aujourd'hui")
  })
})

describe('Navigation par glissement (swipe)', () => {
  const swipeLeft = (el) => {
    fireEvent.touchStart(el, { touches: [{ clientX: 300, clientY: 400 }] })
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 150, clientY: 400 }] })
  }
  const swipeRight = (el) => {
    fireEvent.touchStart(el, { touches: [{ clientX: 100, clientY: 400 }] })
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 250, clientY: 400 }] })
  }

  it('swipe vers la gauche sur la barre d\'onglets va à l\'écran suivant', async () => {
    render(<App />)
    expect(screen.getByTestId('screen-accueil')).toBeInTheDocument()
    swipeLeft(screen.getByTestId('tab-bar'))
    expect(screen.getByTestId('screen-planning')).toBeInTheDocument()
  })

  it('swipe vers la droite sur la barre d\'onglets revient à l\'écran précédent', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-visites'))
    expect(screen.getByTestId('screen-visites')).toBeInTheDocument()
    swipeRight(screen.getByTestId('tab-bar'))
    expect(screen.getByTestId('screen-planning')).toBeInTheDocument()
  })

  it('ne dépasse pas le dernier onglet en swipant à gauche sur Budget', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-budget'))
    swipeLeft(screen.getByTestId('tab-bar'))
    expect(screen.getByTestId('screen-budget')).toBeInTheDocument()
  })

  it('ne recule pas avant Accueil en swipant à droite sur le premier onglet', () => {
    render(<App />)
    swipeRight(screen.getByTestId('tab-bar'))
    expect(screen.getByTestId('screen-accueil')).toBeInTheDocument()
  })

  it('swipe gauche→droite sur un sous-écran revient en arrière (équivalent bouton ‹)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Trajet'))
    expect(screen.getByTestId('sub-screen-wrapper')).toBeInTheDocument()
    swipeRight(screen.getByTestId('sub-screen-wrapper'))
    expect(screen.queryByTestId('sub-screen-wrapper')).not.toBeInTheDocument()
    expect(screen.getByTestId('screen-accueil')).toBeInTheDocument()
  })

  it('un tap normal (sans déplacement) sur la barre d\'onglets ne déclenche pas de swipe', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('tab-budget'))
    expect(screen.getByTestId('screen-budget')).toBeInTheDocument()
    // clic normal (userEvent.click) simule un tap sans déplacement — ne doit rien changer d'autre
    expect(screen.getByTestId('screen-budget')).toBeInTheDocument()
  })
})

describe('Suggestions', () => {
  it('ajoute une suggestion et l\'affiche dans la liste', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('input-suggestion'), 'Ajouter un mode sombre')
    await user.click(screen.getByTestId('btn-add-suggestion'))
    expect(screen.getByText('Ajouter un mode sombre')).toBeInTheDocument()
  })

  it('n\'ajoute rien si le champ est vide', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('btn-add-suggestion'))
    expect(screen.queryByTestId('btn-send-suggestions')).not.toBeInTheDocument()
  })

  it('affiche le bouton d\'envoi seulement s\'il y a au moins une suggestion', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.queryByTestId('btn-send-suggestions')).not.toBeInTheDocument()
    await user.type(screen.getByTestId('input-suggestion'), 'Une idée')
    await user.click(screen.getByTestId('btn-add-suggestion'))
    expect(screen.getByTestId('btn-send-suggestions')).toBeInTheDocument()
  })

  it('supprime une suggestion via son bouton 🗑️', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('input-suggestion'), 'À supprimer')
    await user.click(screen.getByTestId('btn-add-suggestion'))
    expect(screen.getByText('À supprimer')).toBeInTheDocument()
    await user.click(screen.getByText('🗑️'))
    expect(screen.queryByText('À supprimer')).not.toBeInTheDocument()
  })

  it('persiste les suggestions dans localStorage', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.type(screen.getByTestId('input-suggestion'), 'Suggestion persistante')
    await user.click(screen.getByTestId('btn-add-suggestion'))
    unmount()
    render(<App />)
    expect(screen.getByText('Suggestion persistante')).toBeInTheDocument()
  })

  it('vide le champ après ajout', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByTestId('input-suggestion')
    await user.type(input, 'Test')
    await user.click(screen.getByTestId('btn-add-suggestion'))
    expect(input.value).toBe('')
  })
})
