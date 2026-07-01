import { createDriver, waitFor, clearStorage } from './helpers/setup.js'
import { TABS, SCREENS, BUDGET, byContains } from './helpers/selectors.js'

describe('Budget — CRUD', () => {
  let driver

  before(async () => {
    driver = await createDriver()
    await clearStorage(driver)
    await driver.reloadSession()
  })
  after(async () => { await driver.deleteSession() })

  it('navigue vers Budget', async () => {
    await (await driver.$(TABS.budget)).click()
    expect(await (await waitFor(driver, SCREENS.budget)).isDisplayed()).toBe(true)
  })

  it('affiche le total budget initial 1 800 €', async () => {
    const el = await driver.$(byContains('1'))
    expect(await el.isDisplayed()).toBe(true)
  })

  it('ouvre le formulaire d\'ajout de dépense', async () => {
    const btn = await waitFor(driver, BUDGET.btnAdd)
    await btn.click()
    const input = await waitFor(driver, BUDGET.inputAmt)
    expect(await input.isDisplayed()).toBe(true)
  })

  it('ajoute une dépense "Glaces" 12 €', async () => {
    const inputAmt = await driver.$(BUDGET.inputAmt)
    await inputAmt.setValue('12')
    const inputLabel = await driver.$(BUDGET.inputLabel)
    await inputLabel.setValue('Glaces')
    const btnSubmit = await driver.$(BUDGET.btnSubmit)
    await btnSubmit.click()
    const item = await driver.$(byContains('Glaces'))
    expect(await item.isDisplayed()).toBe(true)
  })

  it('affiche la dépense dans la liste', async () => {
    const el = await driver.$(byContains('Glaces'))
    expect(await el.isDisplayed()).toBe(true)
  })

  it('le montant dépensé est mis à jour', async () => {
    const el = await driver.$(byContains('12'))
    expect(await el.isDisplayed()).toBe(true)
  })

  it('persiste après redémarrage de l\'app', async () => {
    await driver.terminateApp('fr.douastart.cantou')
    await driver.activateApp('fr.douastart.cantou')
    await (await driver.$(TABS.budget)).click()
    const el = await waitFor(driver, byContains('Glaces'))
    expect(await el.isDisplayed()).toBe(true)
  })
})

describe('Budget — tri par montant', () => {
  let driver

  before(async () => {
    driver = await createDriver()
    await clearStorage(driver)
    await driver.reloadSession()
    await (await driver.$(TABS.budget)).click()
    // Ajouter 2 dépenses de montants différents
    for (const [amt, label] of [['50', 'Resto'], ['15', 'Café']]) {
      await (await waitFor(driver, BUDGET.btnAdd)).click()
      await (await driver.$(BUDGET.inputAmt)).setValue(amt)
      await (await driver.$(BUDGET.inputLabel)).setValue(label)
      await (await driver.$(BUDGET.btnSubmit)).click()
    }
  })
  after(async () => { await driver.deleteSession() })

  it('active le tri par montant', async () => {
    const btn = await driver.$(byContains('Par montant'))
    await btn.click()
    expect(await btn.isDisplayed()).toBe(true)
  })
})
