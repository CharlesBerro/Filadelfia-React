// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Asegúrate de que esto cubra tus archivos
  ],
  theme: {
    extend: {
      colors: {
        'filadelfia-blue': '#004A99',
      }
    },
  },
  plugins: [],
} satisfies Config
