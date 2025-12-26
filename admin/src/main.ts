import { createApp } from 'vue'
import './style.less'
import './assets/styles/tailwind.css'
import App from './App.vue'
import router from './router'
import "@/router/guard"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
// import "./mock" // 已移除Mock，使用真实后端接口
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import permission from './directives/permission'
import * as Sentry from "@sentry/vue";
import { initMonitor } from './monitor'

const app = createApp(App);


Sentry.init({
  app,
  dsn: "https://fa653e6b984506b325e3213eddf20255@o4510594588868608.ingest.us.sentry.io/4510594590179328",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration()
  ],
  // Tracing
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.,
  // Logs
  enableLogs: true
});


for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia=createPinia()
app.directive("permission",permission)
app.use(ElementPlus)
app.use(pinia)
app.use(router);
app.mount('#app')

// 初始化自研监控SDK（与Sentry并行使用）
initMonitor({
  app,
  router,
  appId: 'charging-station-admin',
  debug: import.meta.env.DEV, // 开发环境开启调试日志
})


