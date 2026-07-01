import { CAPS } from './helpers/setup.js'

export const config = {
  runner: 'local',
  specs: ['./tests/appium/**/*.spec.js'],
  exclude: [],
  maxInstances: 1,
  capabilities: [CAPS],

  logLevel: 'warn',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    ['appium', {
      command: 'appium',
      args: { address: '127.0.0.1', port: 4723, relaxedSecurity: true },
    }],
  ],

  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
}
