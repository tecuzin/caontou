// Configuration Cucumber (BDD) — ESM, réutilise le PCOM Playwright (e2e/pages).
export default {
  paths: ['features/**/*.feature'],
  import: ['features/support/*.js', 'features/step_definitions/*.js'],
  format: ['progress'],
  publishQuiet: true,
}
