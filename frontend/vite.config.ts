import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

const BUILD_MODE = (process.env.VITE_APP_MODE ?? 'user') as 'user' | 'admin'

const restrictEntry = () => ({
  name: 'restrict-entry',
  configureServer(server: import('vite').ViteDevServer) {
    server.middlewares.use((req, res, next) => {
      const url = (req.url ?? '').split('?')[0]

      // Vite 내부 경로(/@vite, /@fs, /@react-refresh 등)와 정적 자산은 그대로 통과
      const isViteInternal = url.startsWith('/@') || url.startsWith('/node_modules')
      const isAssetLike = /\.[a-zA-Z0-9]+$/.test(url)

      if (BUILD_MODE === 'user') {
        if (url === '/admin.html' || url === '/admin' || url.startsWith('/admin/')) {
          res.statusCode = 404
          res.end('Not found in user app')
          return
        }
      }

      if (BUILD_MODE === 'admin') {
        if (url === '/index.html') {
          res.statusCode = 404
          res.end('Not found in admin app')
          return
        }
        // SPA 라우트(/, /login, /admin/* 등)는 admin.html 을 서빙해서
        // BrowserRouter 가 클라이언트 사이드 라우팅을 처리하도록 함
        if (req.method === 'GET' && !isViteInternal && !isAssetLike) {
          req.url = '/admin.html'
        }
      }

      next()
    })
  },
})

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    restrictEntry(),
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
