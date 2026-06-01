import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',   // relative asset paths — required for HA ingress subpath
  server: {
    proxy: {
      '/api': 'http://localhost:8099',
    },
  },
})
