import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@mediapipe/pose',
      '@mediapipe/camera_utils',
      '@mediapipe/drawing_utils'
    ]
  },
  resolve: {
    alias: {
      '@mediapipe/pose': '@mediapipe/pose',
      '@mediapipe/camera_utils': '@mediapipe/camera_utils',
      '@mediapipe/drawing_utils': '@mediapipe/drawing_utils'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    target: 'es2018',
  },
  server: {
    port: 3000,
    host: true
  }
})
