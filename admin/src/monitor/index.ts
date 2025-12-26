/**
 * 前端监控SDK集成配置
 *
 * 本文件用于在Vue项目中集成自研的monitor-sdk
 */
import { createMonitor, createVuePlugin, type Monitor } from '../../monitor-sdk/src';
import type { App } from 'vue';
import type { Router } from 'vue-router';

// 全局监控实例
let monitorInstance: Monitor | null = null;

/**
 * 初始化监控SDK
 */
export function initMonitor(options: {
  app: App;
  router: Router;
  appId?: string;
  userId?: string;
  debug?: boolean;
}) {
  const { app, router, appId = 'charging-station-admin', userId, debug = false } = options;

  // 创建监控实例
  monitorInstance = createMonitor({
    appId,
    reportUrl: 'http://localhost:3001/api/monitor/report', // 上报到后端API
    userId,
    enableError: true,
    enablePerformance: true,
    enableBehavior: true,
    enableNetwork: true,
    sampleRate: 1, // 100% 采样率，生产环境可调低
    maxCache: 20,
    reportInterval: 5000,
    debug,
    enableLongTask: true,
    longTaskThreshold: 50,
  });

  // 注册Vue插件以捕获Vue错误
  const vuePlugin = createVuePlugin(app);
  monitorInstance.use(vuePlugin);

  // 监听路由变化，设置用户上下文
  router.afterEach((to) => {
    if (monitorInstance) {
      monitorInstance.setExtra({
        routeName: to.name as string,
        routePath: to.path,
      });
    }
  });

  console.log('[Monitor SDK] 监控已初始化');

  return monitorInstance;
}

/**
 * 获取监控实例
 */
export function getMonitor(): Monitor | null {
  return monitorInstance;
}

/**
 * 设置用户ID
 */
export function setMonitorUserId(userId: string) {
  if (monitorInstance) {
    monitorInstance.setUserId(userId);
  }
}

/**
 * 手动上报自定义事件
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (monitorInstance) {
    monitorInstance.trackEvent(eventName, eventData);
  }
}

/**
 * 销毁监控SDK
 */
export function destroyMonitor() {
  if (monitorInstance) {
    monitorInstance.destroy();
    monitorInstance = null;
    console.log('[Monitor SDK] 监控已销毁');
  }
}

export default {
  initMonitor,
  getMonitor,
  setMonitorUserId,
  trackEvent,
  destroyMonitor,
};
