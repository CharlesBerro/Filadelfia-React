import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Importado
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
  ],
  resolve: {
    alias: {
      // 2. Define tu alias. El '@' apunta a la carpeta 'src'
      '@': path.resolve(__dirname, './src'),
    },
  },
})
