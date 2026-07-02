import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/test/**/*.{test,spec}.{js,jsx}'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
})
