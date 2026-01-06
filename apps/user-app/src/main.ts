import { createSSRApp } from 'vue'
import App from './App.vue'
import { setupStore } from './store'

export function createApp() {
  const app = createSSRApp(App)

  // 安装 Pinia 状态管理
  setupStore(app)

  return {
    app,
  }
}
