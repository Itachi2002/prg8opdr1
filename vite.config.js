import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    target: 'es2018',
    rollupOptions: {
      external: [
        '@mediapipe/pose',
        '@mediapipe/camera_utils',
        '@mediapipe/drawing_utils'
      ]
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
