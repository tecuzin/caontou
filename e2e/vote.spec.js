import { test, expect } from './fixtures.js'
import { App } from './pages/index.js'

let app
test.beforeEach(async ({ page }) => {
  app = new App(page)
  await app.goto()
})

test.describe('Vote familial — scénario complet (pass-and-play)', () => {
  test('2 votants → gagnant réel affiché puis ajouté au planning', async ({ page }) => {
    await app.tab('visites')
    await app.visites.openVote()

    await app.vote.addVoter('Papa')
    await app.vote.addVoter('Maman')

    await expect(app.vote.startBtn).toBeEnabled()
    await app.vote.start()

    // Premier votant : cible le 1er candidat ; même choix au 2e tour → gagnant net
    const firstPick = app.vote.firstPick()
    const pickTestId = await firstPick.getAttribute('data-testid')
    await firstPick.click()
    await app.vote.pickByTestId(pickTestId).click()

    // Résultat : un vrai nom de visite (régression : c'était « — »)
    await expect(app.vote.winner).toBeVisible()
    const winnerName = (await app.vote.winner.textContent()).trim()
    expect(winnerName.length).toBeGreaterThan(1)
    expect(winnerName).not.toBe('—')

    await app.vote.addToPlanning(0)

    await app.tab('planning')
    await expect(page.getByText(winnerName).first()).toBeVisible()
  })

  test('le bouton démarrer est bloqué sans votant', async () => {
    await app.tab('visites')
    await app.visites.openVote()
    await expect(app.vote.startBtn).toBeDisabled()
  })
})
