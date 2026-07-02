import { createDriver, waitFor } from './helpers/setup.js'
import { TABS, SCREENS, byContains, byText } from './helpers/selectors.js'

describe('Shopping — logistique & courses', () => {
  let driver

  before(async () => { driver = await createDriver() })
  after(async () => { await driver.deleteSession() })

  it('navigue vers Repas > Courses', async () => {
    await (await driver.$(TABS.repas)).click()
    await (await waitFor(driver, SCREENS.repas)).isDisplayed()
    await (await driver.$(byText('Courses'))).click()
    const el = await driver.$(byContains('Liste de courses'))
    expect(await el.isDisplayed()).toBe(true)
  })

  it('coche un article de la liste', async () => {
    const items = await driver.$$('//android.widget.CheckBox')
    if (items.length > 0) {
      await items[0].click()
      expect(await items[0].isSelected()).toBe(true)
    }
  })

  it('affiche les catégories de courses', async () => {
    const frais = await driver.$(byContains('Frais'))
    expect(await frais.isDisplayed()).toBe(true)
  })

  it('ouvre le formulaire d\'ajout d\'article', async () => {
    const btn = await driver.$(byContains('Ajouter article'))
    await btn.click()
    const input = await driver.$('//android.widget.EditText')
    expect(await input.isDisplayed()).toBe(true)
  })

  it('ajoute un article personnalisé', async () => {
    const input = await driver.$('//android.widget.EditText')
    await input.setValue('Fromage râpé')
    await (await driver.$(byText('Ajouter'))).click()
    const el = await driver.$(byContains('Fromage'))
    expect(await el.isDisplayed()).toBe(true)
  })
})

describe('Logistique — valises', () => {
  let driver

  before(async () => { driver = await createDriver() })
  after(async () => { await driver.deleteSession() })

  it('navigue vers la logistique depuis l\'accueil', async () => {
    await (await driver.$(TABS.accueil)).click()
    const logi = await driver.$(byContains('Logistique'))
    await logi.click()
    const screen = await driver.$(byContains('Valises'))
    expect(await screen.isDisplayed()).toBe(true)
  })

  it('coche un item de valise', async () => {
    const items = await driver.$$('//android.view.View[@clickable="true"]')
    if (items.length > 0) {
      await items[0].click()
    }
  })

  it('affiche le tri "Non cochés en premier"', async () => {
    const btn = await driver.$(byContains('Non coch'))
    expect(await btn.isDisplayed()).toBe(true)
  })
})
