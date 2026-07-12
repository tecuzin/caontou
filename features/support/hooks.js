import { BeforeAll, AfterAll, Before, After, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'

setDefaultTimeout(30_000)

const PORT = 5174
const BASE = `http://localhost:${PORT}`
let browser
let server

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try { const r = await fetch(url); if (r.ok) return } catch { /* pas encore prêt */ }
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`Serveur Vite injoignable sur ${url}`)
}

BeforeAll(async function () {
  // Démarre le serveur Vite dédié (port distinct de Playwright) puis le navigateur.
  server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
  await waitForServer(BASE)
  browser = await chromium.launch()
})

AfterAll(async function () {
  if (browser) await browser.close()
  if (server) server.kill()
})

Before(async function () {
  this.context = await browser.newContext({ viewport: { width: 402, height: 874 }, baseURL: BASE })
  this.page = await this.context.newPage()
  this.app = this.appFor(this.page)
})

After(async function () {
  if (this.page) await this.page.close()
  if (this.context) await this.context.close()
})
