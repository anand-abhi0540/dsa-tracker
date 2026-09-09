import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { problemsApiMiddleware } from './server/apiMiddleware.js'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), problemsApiMiddleware()],
})

