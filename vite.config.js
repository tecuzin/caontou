import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

// Numéro de build exposé au web (pour « Quoi de neuf ? » + historique) :
// l'env BUILD_NUMBER (injectée dans le conteneur Docker) prime, sinon on lit
// le fichier build.number, sinon 0 (dev).
function buildNumber() {
  if (process.env.BUILD_NUMBER) return Number(process.env.BUILD_NUMBER)
  try { return Number(readFileSync('./build.number', 'utf8').trim()) || 0 } catch { return 0 }
}

export default defineConfig({
  plugins: [react()],
  define: { __BUILD_NUMBER__: JSON.stringify(buildNumber()) },
  build: { outDir: 'dist' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/test/**/*.{test,spec}.{js,jsx}'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
})
