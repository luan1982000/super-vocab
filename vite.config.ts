import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages phục vụ app dưới /<ten-repo>/ — workflow set BASE_PATH lúc build.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
