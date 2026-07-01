import { remote } from 'webdriverio'

const APK_PATH = process.env.APK_PATH || 'build/outputs/apk/cantou-release.apk'

export const CAPS = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:app': require('path').resolve(process.cwd(), APK_PATH),
  'appium:appPackage': 'fr.douastart.cantou',
  'appium:appActivity': '.MainActivity',
  'appium:noReset': false,
  'appium:newCommandTimeout': 60,
  'appium:autoGrantPermissions': true,
}

export async function createDriver() {
  return remote({
    hostname: '127.0.0.1',
    port: 4723,
    capabilities: CAPS,
  })
}

// Attendre qu'un élément soit présent (timeout 10 s)
export async function waitFor(driver, selector, timeout = 10000) {
  const el = await driver.$(selector)
  await el.waitForExist({ timeout })
  return el
}

// Vider localStorage via execute dans la WebView
export async function clearStorage(driver) {
  await driver.execute('mobile: executeScript', {
    script: "localStorage.clear()",
    args: [],
  })
}

// Redémarrer l'app pour tester la persistance
export async function restartApp(driver) {
  await driver.execute('mobile: activateApp', { bundleId: 'fr.douastart.cantou' })
}
