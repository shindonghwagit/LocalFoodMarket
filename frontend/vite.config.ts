import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

const BUILD_MODE = (process.env.VITE_APP_MODE ?? 'user') as 'user' | 'admin'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: BUILD_MODE === 'admin' ? 5174 : 5173,
    open: BUILD_MODE === 'admin' ? '/admin.html' : '/',
  },
  build: {
    outDir: BUILD_MODE === 'admin' ? 'dist-admin' : 'dist',
    sourcemap: false,
    rollupOptions: {
      input: BUILD_MODE === 'admin'
        ? resolve(__dirname, 'admin.html')
        : resolve(__dirname, 'index.html'),
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/zustand')) return 'state';
          if (id.includes('node_modules/axios')) return 'http';
        },
      },
    },
  },
})
