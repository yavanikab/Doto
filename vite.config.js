import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: 'dist-vite',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js']
  }
})
