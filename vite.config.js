import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 所有 /api 开头的请求，都会转到 http://localhost:3001
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // 如果你还有 socket.io 用到 /socket.io 路径，也要代理
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
      // 如果有直接访问 /wordlists/... 且路径不以 /api 开头
      '/wordlists': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})