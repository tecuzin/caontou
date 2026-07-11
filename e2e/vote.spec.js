import { test, expect } from './fixtures.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test.describe('Vote familial — scénario complet (pass-and-play)', () => {
  test('2 votants → gagnant réel affiché puis ajouté au planning', async ({ page }) => {
    // Ouvrir le vote depuis Visites
    await page.locator('[data-testid="tab-visites"]').click()
    await page.locator('[data-testid="btn-open-vote"]').click()

    // Ajouter deux votants
    await page.locator('[data-testid="vote-new-voter"]').fill('Papa')
    await page.locator('[data-testid="vote-add-voter"]').click()
    await page.locator('[data-testid="vote-new-voter"]').fill('Maman')
    await page.locator('[data-testid="vote-add-voter"]').click()

    // Les visites ♥ par défaut pré-remplissent les candidats → démarrer
    const startBtn = page.locator('[data-testid="vote-start"]')
    await expect(startBtn).toBeEnabled()
    await startBtn.click()

    // Premier votant : on cible le 1er candidat proposé (même testid aux 2 tours)
    const firstPick = page.locator('[data-testid^="vote-pick-"]').first()
    const pickTestId = await firstPick.getAttribute('data-testid')
    await firstPick.click()

    // Deuxième votant : même choix → gagnant net
    await page.locator(`[data-testid="${pickTestId}"]`).click()

    // Résultat : un vrai nom de visite s'affiche (régression : c'était « — »)
    const winnerEl = page.locator('[data-testid="vote-winner"]')
    await expect(winnerEl).toBeVisible()
    const winnerName = (await winnerEl.textContent()).trim()
    expect(winnerName.length).toBeGreaterThan(1)
    expect(winnerName).not.toBe('—')

    // Ajouter au planning — on cible le 1er jour pour le retrouver sur la vue
    // par défaut du Planning (qui s'ouvre sur le jour 0)
    await page.locator('[data-testid="vote-target-day"]').selectOption('0')
    await page.locator('[data-testid="vote-add-planning"]').click()

    // La sortie gagnante apparaît dans le planning
    await page.locator('[data-testid="tab-planning"]').click()
    await expect(page.getByText(winnerName).first()).toBeVisible()
  })

  test('le bouton démarrer est bloqué sans votant', async ({ page }) => {
    await page.locator('[data-testid="tab-visites"]').click()
    await page.locator('[data-testid="btn-open-vote"]').click()
    await expect(page.locator('[data-testid="vote-start"]')).toBeDisabled()
  })
})
