import { test, expect } from './fixtures.js'
import { App } from './pages/index.js'

let app
test.beforeEach(async ({ page }) => {
  app = new App(page)
  await app.goto()
})

test.describe('Repas & courses', () => {
  test('bascule Menus → Courses et ajoute une catégorie', async ({ page }) => {
    await app.tab('repas')
    await expect(app.repas.screen).toBeVisible()
    await app.repas.toCourses()
    await app.repas.addCategory()
    await page.locator('[data-testid="input-course-cat-name"]').fill('Apéro')
    await page.locator('[data-testid="btn-save-course-cat"]').click()
    await expect(page.getByText('Apéro')).toBeVisible()
  })
})

test.describe('Restos', () => {
  test('ajoute un resto et le persiste après rechargement', async ({ page }) => {
    await app.openModule('Restos')
    await expect(app.restos.screen).toBeVisible()
    await app.restos.addResto({ name: 'Auberge E2E', place: 'Vic-sur-Cère', tel: '04 71 47 50 00', reserved: true })
    await expect(page.getByText('Auberge E2E')).toBeVisible()
    await page.reload()
    await app.openModule('Restos')
    await expect(page.getByText('Auberge E2E')).toBeVisible()
  })
})

test.describe('Bingo', () => {
  test('cocher une ligne fait passer le compteur à 1/10', async () => {
    await app.openBingo()
    await expect(app.bingo.screen).toBeVisible()
    await expect(app.bingo.lines).toHaveText(/0\/10/)
    for (const i of [0, 1, 2, 3]) await app.bingo.cell(i).click()
    await expect(app.bingo.lines).toHaveText(/1\/10/)
  })
})

test.describe('Bilan', () => {
  test('s\'ouvre avec le bouton de partage', async () => {
    await app.openBilan()
    await expect(app.bilan.screen).toBeVisible()
    await expect(app.bilan.shareBtn).toBeVisible()
  })
})

test.describe('Trajet', () => {
  test('bascule aller / retour', async ({ page }) => {
    await app.openModule('Trajet')
    await expect(app.trajet.retour).toBeVisible()
    await app.trajet.retour.click()
    await expect(page.getByText(/Les etapes · retour/)).toBeVisible()
  })
})

test.describe('Logistique', () => {
  test('ajoute une liste de préparatifs', async ({ page }) => {
    await app.openModule('Préparatifs')
    await app.logistique.addList('Sac de plage E2E')
    await expect(page.getByText('Sac de plage E2E')).toBeVisible()
  })
})

test.describe('Hébergement', () => {
  test('affiche le bloc des numéros d\'urgence cliquables', async () => {
    await app.openModule('Hébergement')
    const urg = app.id('heb-urgences')
    await expect(urg).toBeVisible()
    await expect(urg.getByText('112')).toBeVisible()
  })
})

test.describe('Météo', () => {
  test('affiche les prévisions et le bouton d\'ajout', async ({ page }) => {
    await app.openModule('Météo')
    await expect(page.getByText(/Prévisions du/)).toBeVisible()
    await expect(page.getByText('+ Ajouter un jour')).toBeVisible()
  })
})
