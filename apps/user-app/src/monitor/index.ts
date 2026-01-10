/**
 * 前端监控SDK集成配置（UniApp端）
 *
 * 本文件用于在UniApp项目中集成自研的monitor-sdk
 * 通过平台适配器自动适配UniApp环境
 */
import { createMonitor, type Monitor } from '@charging/monitor-sdk'
import config from '@/config'

// 全局监控实例
let monitorInstance: Monitor | null = null

/**
 * 获取上报地址
 */
function getReportUrl(): string {
  // 根据环境构建上报地址
  // 将 /api/mobile 替换为 /api/monitor/report
  const baseUrl = config.baseUrl.replace('/api/mobile', '')
  return `${baseUrl}/api/monitor/report`
}

/**
 * 初始化监控SDK
 */
export function initMonitor(options?: {
  appId?: string
  userId?: string
  debug?: boolean
}) {
  const {
    appId = 'charging-station-user-app',
    userId,
    debug = config.debug,
  } = options || {}

  // 创建监控实例（使用UniApp平台适配器）
  monitorInstance = createMonitor({
    appId,
    reportUrl: getReportUrl(),
    platform: 'uniapp', // 指定为UniApp平台
    userId,
    enableError: true, // 开启错误监控
    enablePerformance: true, // 开启性能监控
    enableBehavior: true, // 开启用户行为监控
    enableNetwork: true, // 开启网络请求监控
    sampleRate: 1, // 100% 采样率，生产环境可调低
    maxCache: 20,
    reportInterval: 5000,
    debug,
    enableLongTask: true,
    longTaskThreshold: 50,
    // 添加额外的全局数据
    extra: {
      platform: 'uniapp',
      // #ifdef H5
      env: 'h5',
      // #endif
      // #ifdef MP-WEIXIN
      env: 'mp-weixin',
      // #endif
      version: '1.0.0',
    },
  })

  // 监听路由变化（UniApp 路由监听）
  // 注意：路由变化需要在实际页面切换时手动触发
  // 可以在页面 onLoad/onShow 中调用 trackEvent 上报路由变化

  if (debug) {
    console.log('[Monitor SDK] UniApp监控已初始化', {
      platform: 'uniapp',
      reportUrl: getReportUrl(),
    })
  }

  return monitorInstance
}

/**
 * 获取监控实例
 */
export function getMonitor(): Monitor | null {
  return monitorInstance
}

/**
 * 设置用户ID
 */
export function setMonitorUserId(userId: string) {
  if (monitorInstance) {
    monitorInstance.setUserId(userId)
    // 同时更新额外信息
    monitorInstance.setExtra({
      userId,
      timestamp: Date.now(),
    })
    
    if (monitorInstance.options.debug) {
      console.log('[Monitor SDK] 用户ID已设置:', userId)
    }
  }
}

/**
 * 手动上报自定义事件
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (monitorInstance) {
    monitorInstance.trackEvent(eventName, eventData)
  }
}

/**
 * 销毁监控SDK
 */
export function destroyMonitor() {
  if (monitorInstance) {
    monitorInstance.destroy()
    monitorInstance = null
    console.log('[Monitor SDK] 监控已销毁')
  }
}

export default {
  initMonitor,
  getMonitor,
  setMonitorUserId,
  trackEvent,
  destroyMonitor,
}
