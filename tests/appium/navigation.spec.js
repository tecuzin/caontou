import { createDriver, waitFor } from './helpers/setup.js'
import { TABS, SCREENS, byContains } from './helpers/selectors.js'

describe('Navigation — onglets', () => {
  let driver

  before(async () => { driver = await createDriver() })
  after(async () => { await driver.deleteSession() })

  it('affiche l\'écran Accueil au démarrage', async () => {
    const el = await waitFor(driver, SCREENS.accueil)
    expect(await el.isDisplayed()).toBe(true)
  })

  it('navigue vers Budget', async () => {
    await (await driver.$(TABS.budget)).click()
    const el = await waitFor(driver, SCREENS.budget)
    expect(await el.isDisplayed()).toBe(true)
  })

  it('navigue vers Repas', async () => {
    await (await driver.$(TABS.repas)).click()
    const el = await waitFor(driver, SCREENS.repas)
    expect(await el.isDisplayed()).toBe(true)
  })

  it('navigue vers Visites', async () => {
    await (await driver.$(TABS.visites)).click()
    const el = await waitFor(driver, SCREENS.visites)
    expect(await el.isDisplayed()).toBe(true)
  })

  it('navigue vers Planning', async () => {
    await (await driver.$(TABS.planning)).click()
    const el = await waitFor(driver, SCREENS.planning)
    expect(await el.isDisplayed()).toBe(true)
  })

  it('revient à Accueil', async () => {
    await (await driver.$(TABS.accueil)).click()
    const el = await waitFor(driver, SCREENS.accueil)
    expect(await el.isDisplayed()).toBe(true)
  })

  it('affiche le compte à rebours J-', async () => {
    await (await driver.$(TABS.accueil)).click()
    const el = await driver.$(byContains('J-'))
    expect(await el.isDisplayed()).toBe(true)
  })

  it('affiche la destination Lyon → Mandailles', async () => {
    const el = await driver.$(byContains('Mandailles'))
    expect(await el.isDisplayed()).toBe(true)
  })

  it('affiche les 5 onglets', async () => {
    for (const tab of Object.values(TABS)) {
      const el = await driver.$(tab)
      expect(await el.isDisplayed()).toBe(true)
    }
  })
})
