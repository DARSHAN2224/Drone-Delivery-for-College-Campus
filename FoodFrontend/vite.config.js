import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Fix React refresh issues
      fastRefresh: true,
      // Ensure proper JSX handling
      jsxRuntime: 'automatic'
    })
  ],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    // HMR configuration - Fix WebSocket connection issues
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
  },
  resolve: {
    alias: {
      // Ensure single React instance and prevent duplicates
      'react': 'react',
      'react-dom': 'react-dom',
    }
  },
})
