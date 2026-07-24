import { mergeConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
// Mock unique pour tous les plugins Capacitor (aucune API native en catalogue).
const cap = resolve(here, 'capacitor-mock.js')

/** @type {import('@storybook/react-vite').StorybookConfig} */
export default {
  // Les stories vivent dans src/ (co-localisées avec les composants), mais les
  // dépendances Storybook restent ISOLÉES ici → zéro impact sur l'app / l'APK.
  stories: ['../../../src/**/*.stories.@(js|jsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@capacitor/core': cap,
          '@capacitor/haptics': cap,
          '@capacitor/share': cap,
          '@capacitor/filesystem': cap,
          '@capacitor/camera': cap,
          '@capacitor/geolocation': cap,
          '@capacitor/local-notifications': cap,
          '@capacitor/status-bar': cap,
        },
      },
    })
  },
}
