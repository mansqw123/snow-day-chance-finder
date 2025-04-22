import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/snow-day-chance-finder/',  // यही लाइन वेबसाइट सही करने के लिए जरूरी है
  plugins: [react()],
})
