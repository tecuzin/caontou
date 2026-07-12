import { test, expect } from './fixtures.js'
import { App } from './pages/index.js'

let app
test.beforeEach(async ({ page }) => {
  app = new App(page)
  await app.goto()
})

test.describe('Sauvegarde — export / import JSON', () => {
  test('exporte un JSON complet puis le réimporte (round-trip)', async () => {
    // Export : le textarea contient le store sérialisé
    await app.openExport()
    await expect(app.data.exportJson).toBeVisible()
    const json = await app.data.exportJson.inputValue()
    expect(json).toContain('"schemaVersion"')

    // Ferme, puis réimporte le même JSON → un aperçu de restauration s'affiche
    await app.page.keyboard.press('Escape').catch(() => {})
    await app.goto()
    await app.openImport()
    await app.data.importTextarea.fill(json)
    await expect(app.data.importPreview).toBeVisible()
  })
})

test.describe('Journal de bord', () => {
  test('ouvre la modale et saisit une entrée du jour', async () => {
    await app.openJournal()
    const best = app.id('journal-best')
    await expect(best).toBeVisible()
    await best.fill('La cascade du Pas de Cère')
    await expect(best).toHaveValue('La cascade du Pas de Cère')
  })
})

test.describe('Historique des versions (changelog)', () => {
  test('ouvre puis ferme la modale', async () => {
    await app.openHistorique()
    await expect(app.id('btn-changelog-close')).toBeVisible()
    await app.changelog.close()
    await expect(app.id('btn-changelog-close')).not.toBeVisible()
  })
})
