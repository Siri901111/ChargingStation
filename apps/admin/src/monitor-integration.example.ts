/**
 * 监控SDK集成示例
 *
 * 此文件展示如何在Vue 3项目中集成前端监控SDK
 * 可以替代或配合Sentry使用
 */

import { createApp } from 'vue';
import { createMonitor, createVuePlugin } from '@charging/monitor-sdk';
import App from './App.vue';
import router from './router';

const app = createApp(App);

// ========================================
// 方式一：基本集成
// ========================================

const monitor = createMonitor({
  // 应用唯一标识（用于区分不同项目）
  appId: 'charging-station-admin',

  // 上报接口地址
  reportUrl: 'http://localhost:3001/api/monitor/report',

  // 启用所有监控功能
  enableError: true,        // 错误监控
  enablePerformance: true,  // 性能监控
  enableBehavior: true,     // 用户行为监控
  enableNetwork: true,      // 网络请求监控

  // 采样率（1表示100%上报）
  sampleRate: 1,

  // 开发环境开启调试模式
  debug: import.meta.env.DEV,

  // 添加额外的全局数据
  extra: {
    version: '1.0.0',
    env: import.meta.env.MODE,
  },
});

// 添加Vue错误监控插件
const vuePlugin = createVuePlugin(app);
monitor.use(vuePlugin);

// ========================================
// 方式二：与用户系统集成
// ========================================

// 在用户登录后设置用户ID
// 例如在登录成功的回调中：
// monitor.setUserId(userInfo.userId);

// 可以在router守卫中设置用户信息
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token');
  const userInfo = sessionStorage.getItem('userInfo');

  if (token && userInfo) {
    try {
      const user = JSON.parse(userInfo);
      monitor.setUserId(user.id || user.userId || 'anonymous');
      monitor.setExtra({
        username: user.username,
        role: user.role,
      });
    } catch (e) {
      // 忽略解析错误
    }
  }

  next();
});

// ========================================
// 方式三：手动上报自定义事件
// ========================================

// 上报业务埋点
export function trackBusinessEvent(eventName: string, data?: Record<string, any>) {
  monitor.trackEvent(eventName, data);
}

// 使用示例：
// trackBusinessEvent('order_submit', { orderId: '123', amount: 100 });
// trackBusinessEvent('charging_start', { stationId: 'station-001', pileId: 'pile-001' });

// ========================================
// 方式四：全局挂载（可选）
// ========================================

// 将monitor挂载到全局，方便在任何组件中使用
app.config.globalProperties.$monitor = monitor;

// 在组件中使用：
// this.$monitor.trackEvent('button_click', { button: 'submit' });

// ========================================
// 导出monitor实例供其他模块使用
// ========================================

export { monitor };

// ========================================
// 注意事项
// ========================================

/*
1. 如果同时使用Sentry和自研监控SDK，建议：
   - Sentry用于生产环境的错误追踪和性能监控
   - 自研SDK用于业务埋点和自定义数据收集

2. 在生产环境中，建议：
   - 适当降低采样率以减少数据量
   - 关闭debug模式
   - 使用HTTPS上报接口

3. 数据上报：
   - SDK会自动批量上报数据
   - 页面关闭时会使用sendBeacon确保数据发送
   - 支持失败重试机制
*/
