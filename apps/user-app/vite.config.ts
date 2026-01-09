import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5174,
    host: '0.0.0.0', // 监听所有网络接口，支持局域网访问
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // 如果需要通过代理访问，确保支持局域网IP
        // 但实际开发中，手机直接访问时不会经过vite proxy，而是直接请求配置的baseUrl
      },
    },
  },
})
