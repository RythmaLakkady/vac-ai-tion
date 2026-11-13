import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: ['.vercel.run', '.vercel.app', 'localhost']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    env: {
      VITE_FIREBASE_API_KEY: 'AIzaSyMockKeyForEnvironmentSafety00',
      VITE_FUNCTION_URL: 'https://vac-ai-tion.onrender.com',
      VITE_PRICE_FUNCTION_URL: 'https://vac-ai-tion.onrender.com',
    },
  }
})
