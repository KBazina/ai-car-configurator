import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  base: '/', // ⬅️ VAŽNO za Netlify
  build: {
    outDir: 'dist'
  },
  server: {
    historyApiFallback: true // ⬅️ za lokalni dev server (nije obvezno za Netlify)
  }
})
