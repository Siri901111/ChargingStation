import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./src"),
      'monitor-sdk': path.resolve(__dirname, "../monitor-sdk/dist/index.mjs")
    },
    // 允许解析软链接
    preserveSymlinks: true
  },
  optimizeDeps: {
    // 排除npm link的包，避免预构建问题
    exclude: ['monitor-sdk']
  }
})
