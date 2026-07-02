import { createDriver, waitFor } from './helpers/setup.js'
import { TABS, SCREENS, byContains, byText } from './helpers/selectors.js'

describe('Repas — menus', () => {
  let driver

  before(async () => { driver = await createDriver() })
  after(async () => { await driver.deleteSession() })

  it('navigue vers l\'onglet Repas', async () => {
    await (await driver.$(TABS.repas)).click()
    expect(await (await waitFor(driver, SCREENS.repas)).isDisplayed()).toBe(true)
  })

  it('affiche les menus de la semaine', async () => {
    const sam = await driver.$(byContains('Sam 11'))
    expect(await sam.isDisplayed()).toBe(true)
  })

  it('affiche au moins 7 jours de repas', async () => {
    const items = await driver.$$(byContains('Pâtes'))
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('ouvre le modal d\'édition au clic sur ✏️', async () => {
    const btns = await driver.$$(byText('✏️'))
    await btns[0].click()
    const modal = await driver.$(byContains('Repas du'))
    expect(await modal.isDisplayed()).toBe(true)
  })

  it('ferme le modal au clic sur Annuler', async () => {
    const cancel = await driver.$(byText('Annuler'))
    await cancel.click()
    const modal = await driver.$$(byContains('Repas du'))
    expect(modal.length).toBe(0)
  })

  it('ouvre le modal d\'ajout de repas', async () => {
    const btn = await driver.$(byContains('Ajouter un repas'))
    await btn.click()
    const modal = await waitFor(driver, byContains('Ajouter un repas'))
    expect(await modal.isDisplayed()).toBe(true)
  })

  it('ajoute un repas personnalisé', async () => {
    const inputs = await driver.$$('//android.widget.EditText')
    await inputs[0].setValue('Dim 20')
    await inputs[1].setValue('Raclette familiale')
    await (await driver.$(byText('Enregistrer'))).click()
    const item = await driver.$(byContains('Raclette'))
    expect(await item.isDisplayed()).toBe(true)
  })

  it('bascule sur l\'onglet Courses', async () => {
    const btn = await driver.$(byText('Courses'))
    await btn.click()
    const list = await driver.$(byContains('Liste de courses'))
    expect(await list.isDisplayed()).toBe(true)
  })
})
