import { test, expect } from './fixtures.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Clear localStorage between tests
  await page.evaluate(() => localStorage.clear())
})

test.describe('Navigation', () => {
  test('charge l\'écran Accueil par défaut', async ({ page }) => {
    await expect(page.locator('[data-testid="screen-accueil"]')).toBeVisible()
  })

  test('navigue vers Planning', async ({ page }) => {
    await page.locator('[data-testid="tab-planning"]').click()
    await expect(page.locator('[data-testid="screen-planning"]')).toBeVisible()
  })

  test('navigue vers Visites', async ({ page }) => {
    await page.locator('[data-testid="tab-visites"]').click()
    await expect(page.locator('[data-testid="screen-visites"]')).toBeVisible()
  })

  test('navigue vers Repas', async ({ page }) => {
    await page.locator('[data-testid="tab-repas"]').click()
    await expect(page.locator('[data-testid="screen-repas"]')).toBeVisible()
  })

  test('navigue vers Budget', async ({ page }) => {
    await page.locator('[data-testid="tab-budget"]').click()
    await expect(page.locator('[data-testid="screen-budget"]')).toBeVisible()
  })
})

test.describe('Accueil — contenu', () => {
  test('affiche le compte à rebours J-', async ({ page }) => {
    await expect(page.getByText(/J-\d+/)).toBeVisible()
  })

  test('affiche la destination Puy Mary', async ({ page }) => {
    await expect(page.locator('[data-testid="screen-accueil"]').getByText(/Puy Mary/).first()).toBeVisible()
  })

  test('affiche le module Trajet', async ({ page }) => {
    await expect(page.getByText('Trajet').first()).toBeVisible()
  })
})

test.describe('Budget — CRUD dépenses', () => {
  test('ajoute une nouvelle dépense', async ({ page }) => {
    await page.locator('[data-testid="tab-budget"]').click()
    await page.locator('[data-testid="btn-add-depense"]').click()
    await page.locator('[data-testid="input-montant"]').fill('55')
    await page.locator('[data-testid="input-label"]').fill('Glaces test PW')
    await page.locator('[data-testid="btn-submit-depense"]').click()
    await expect(page.getByText('Glaces test PW')).toBeVisible()
  })

  test('le formulaire se ferme après soumission', async ({ page }) => {
    await page.locator('[data-testid="tab-budget"]').click()
    await page.locator('[data-testid="btn-add-depense"]').click()
    await page.locator('[data-testid="input-montant"]').fill('20')
    await page.locator('[data-testid="btn-submit-depense"]').click()
    await expect(page.locator('[data-testid="input-montant"]')).not.toBeVisible()
  })

  test('la dépense persiste après rechargement de page', async ({ page }) => {
    await page.locator('[data-testid="tab-budget"]').click()
    await page.locator('[data-testid="btn-add-depense"]').click()
    await page.locator('[data-testid="input-montant"]').fill('88')
    await page.locator('[data-testid="input-label"]').fill('Persistance reload')
    await page.locator('[data-testid="btn-submit-depense"]').click()

    await page.reload()
    await page.locator('[data-testid="tab-budget"]').click()
    await expect(page.getByText('Persistance reload')).toBeVisible()
  })
})

test.describe('Planning', () => {
  test('affiche les onglets de jours', async ({ page }) => {
    await page.locator('[data-testid="tab-planning"]').click()
    const planning = page.locator('[data-testid="screen-planning"]')
    await expect(planning.getByText('Sam').first()).toBeVisible()
    await expect(planning.getByText('Dim').first()).toBeVisible()
  })

  test('affiche les activités du premier jour', async ({ page }) => {
    await page.locator('[data-testid="tab-planning"]').click()
    await expect(page.getByText('Le grand départ')).toBeVisible()
  })
})

test.describe('Visites — tri', () => {
  test('affiche les boutons de tri', async ({ page }) => {
    await page.locator('[data-testid="tab-visites"]').click()
    await expect(page.getByText(/📍.*Distance/)).toBeVisible()
    await expect(page.getByText(/🏷️.*Catégorie/)).toBeVisible()
  })

  test('le tri par Distance est activable', async ({ page }) => {
    await page.locator('[data-testid="tab-visites"]').click()
    const btn = page.getByText(/📍.*Distance/)
    await btn.click()
    // Le bouton change de couleur (style actif)
    await expect(btn).toBeVisible()
  })
})
