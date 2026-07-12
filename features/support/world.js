import { setWorldConstructor, World } from '@cucumber/cucumber'
import { App } from '../../e2e/pages/index.js'

/**
 * World Cucumber — porte la page Playwright et l'objet App (PCOM), partagés
 * avec les tests Playwright. `app` est instancié par le hook Before.
 */
export class CantouWorld extends World {
  constructor(options) {
    super(options)
    this.page = null
    this.app = null
    this.appFor = (page) => new App(page)
  }
}

setWorldConstructor(CantouWorld)
