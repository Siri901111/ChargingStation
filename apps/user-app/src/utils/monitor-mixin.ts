/**
 * UniApp 页面监控混入工具
 * 用于自动上报页面访问和路由变化
 */
import { trackEvent, getMonitor } from '@/monitor'

/**
 * 获取当前页面路径
 */
function getCurrentPagePath(): string {
  try {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      const route = currentPage.route || ''
      return '/' + route
    }
  } catch {
    // 忽略错误
  }
  return '/'
}

/**
 * 获取当前页面选项
 */
function getCurrentPageOptions(): Record<string, any> {
  try {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      return currentPage.options || {}
    }
  } catch {
    // 忽略错误
  }
  return {}
}

/**
 * UniApp 页面混入 - 在页面 onLoad 时调用
 * 使用方式：
 * 
 * import { useMonitorPage } from '@/utils/monitor-mixin'
 * 
 * onLoad((options) => {
 *   useMonitorPage(options)
 *   // 你的其他逻辑...
 * })
 */
export function useMonitorPage(options?: Record<string, any>) {
  const monitor = getMonitor()
  if (!monitor) return

  const pagePath = getCurrentPagePath()
  const pageOptions = options || getCurrentPageOptions()

  // 构建完整路径（包含参数）
  let fullPath = pagePath
  const query = Object.keys(pageOptions)
    .map((key) => `${key}=${pageOptions[key]}`)
    .join('&')
  if (query) {
    fullPath += '?' + query
  }

  // 更新监控额外信息（包含路由信息）
  monitor.setExtra({
    routePath: pagePath,
    toRoute: pagePath,
    pagePath: pagePath,
    fullPath: fullPath,
  })

  // 上报页面访问事件
  trackEvent('page_view', {
    path: pagePath,
    fullPath: fullPath,
    options: pageOptions,
  })
}

/**
 * UniApp 路由变化混入 - 在页面切换时调用
 * 使用方式：
 * 
 * import { useMonitorRouteChange } from '@/utils/monitor-mixin'
 * 
 * // 在路由跳转后
 * useMonitorRouteChange('/pages/new/page')
 */
export function useMonitorRouteChange(toPath: string) {
  const monitor = getMonitor()
  if (!monitor) return

  const fromPath = getCurrentPagePath()

  if (fromPath !== toPath) {
    // 更新监控额外信息
    monitor.setExtra({
      fromRoute: fromPath,
      toRoute: toPath,
      routePath: toPath,
    })

    // 上报路由变化事件
    trackEvent('route_change', {
      from: fromPath,
      to: toPath,
    })
  }
}
