import { test as base } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const RAW_DIR = 'coverage-e2e/raw'
let counter = 0

/**
 * Étend le test Playwright avec une capture automatique de couverture JS V8
 * (chromium uniquement) — chaque test écrit ses ranges couvertes dans un
 * fichier séparé, fusionnés ensuite par scripts/report-e2e-coverage.js.
 */
export const test = base.extend({
  page: async ({ page, browserName }, use, testInfo) => {
    const collect = browserName === 'chromium'
    if (collect) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false, reportAnonymousScripts: false })
    }
    await use(page)
    if (collect) {
      const entries = await page.coverage.stopJSCoverage()
      const srcEntries = entries.filter((e) => e.url.includes('/src/'))
      if (srcEntries.length) {
        fs.mkdirSync(RAW_DIR, { recursive: true })
        const file = path.join(RAW_DIR, `${testInfo.testId}-${counter++}.json`)
        fs.writeFileSync(file, JSON.stringify(srcEntries))
      }
    }
  },
})

export { expect } from '@playwright/test'
