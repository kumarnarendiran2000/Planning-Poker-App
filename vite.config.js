import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Firebase into its own chunk
          firebase: ['firebase/app', 'firebase/auth', 'firebase/database', 'firebase/firestore'],
          // Separate React and related libraries
          react: ['react', 'react-dom'],
          // Separate utility libraries
          utils: ['uuid', 'react-hot-toast']
        }
      }
    },
    // Increase chunk size warning limit to 800kb (current size is acceptable)
    chunkSizeWarningLimit: 800,
    // Use default esbuild minifier (faster and no additional deps needed)
    minify: 'esbuild'
  }
})
