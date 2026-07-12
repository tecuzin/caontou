import { test, expect } from './fixtures.js'
import { App } from './pages/index.js'

let app
test.beforeEach(async ({ page }) => {
  app = new App(page)
  await app.goto()
})

test.describe('Navigation', () => {
  test('charge l\'écran Accueil par défaut', async () => {
    await expect(app.accueil).toBeVisible()
  })

  for (const tab of ['planning', 'visites', 'repas', 'budget']) {
    test(`navigue vers ${tab}`, async () => {
      await app.tab(tab)
      await expect(app.screen(tab)).toBeVisible()
    })
  }

  test('revient à l\'accueil', async () => {
    await app.tab('planning')
    await app.tab('accueil')
    await expect(app.accueil).toBeVisible()
  })
})

test.describe('Accueil — contenu', () => {
  test('affiche le compte à rebours J-', async ({ page }) => {
    await expect(page.getByText(/J-\d+/)).toBeVisible()
  })

  test('affiche la destination Carladès / Cantal', async () => {
    await expect(app.accueil.getByText(/Carladès/).first()).toBeVisible()
  })

  test('affiche le module Trajet', async ({ page }) => {
    await expect(page.getByText('Trajet').first()).toBeVisible()
  })
})

test.describe('Budget — CRUD dépenses', () => {
  test('ajoute une nouvelle dépense', async ({ page }) => {
    await app.tab('budget')
    await app.budget.addDepense(55, 'Glaces test PW')
    await expect(page.getByText('Glaces test PW')).toBeVisible()
  })

  test('le formulaire se ferme après soumission', async () => {
    await app.tab('budget')
    await app.budget.addDepense(20)
    await expect(app.id('input-montant')).not.toBeVisible()
  })

  test('la dépense persiste après rechargement', async ({ page }) => {
    await app.tab('budget')
    await app.budget.addDepense(88, 'Persistance reload')
    await page.reload()
    await app.tab('budget')
    await expect(page.getByText('Persistance reload')).toBeVisible()
  })
})

test.describe('Planning', () => {
  test('affiche les onglets de jours', async () => {
    await app.tab('planning')
    await expect(app.planning.screen.getByText('Sam').first()).toBeVisible()
    await expect(app.planning.screen.getByText('Dim').first()).toBeVisible()
  })

  test('affiche les activités du premier jour', async ({ page }) => {
    await app.tab('planning')
    await expect(page.getByText('Le grand départ')).toBeVisible()
  })
})

test.describe('Visites — tri', () => {
  test('affiche les boutons de tri', async () => {
    await app.tab('visites')
    await expect(app.visites.triByLabel(/📍.*Distance/)).toBeVisible()
    await expect(app.visites.triByLabel(/🏷️.*Catégorie/)).toBeVisible()
  })

  test('le tri par Distance est activable', async () => {
    await app.tab('visites')
    const btn = app.visites.triByLabel(/📍.*Distance/)
    await btn.click()
    await expect(btn).toBeVisible()
  })
})
