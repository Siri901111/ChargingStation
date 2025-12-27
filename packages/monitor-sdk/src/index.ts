/**
 * 前端监控SDK - 入口文件（增强版）
 *
 * @description 一个功能完善的前端监控SDK，支持：
 * - 错误监控（JS错误、Promise错误、资源错误、Vue错误）
 * - 性能监控（Navigation Timing API Level 2、Web Vitals、长任务）
 * - 用户行为监控（行为栈、全链路追踪、滚动深度、来源分析）
 * - 网络请求监控（XHR/Fetch、请求耗时、错误率）
 * - 会话追踪（访客识别、会话管理）
 * - 数据上报（优先级队列、限流、失败重试）
 *
 * @author ChargingStation Team
 * @version 2.0.0
 */

// 导出核心模块
export { Monitor, createMonitor, Reporter } from './core';

// 导出插件
export {
  createErrorPlugin,
  createPerformancePlugin,
  createBehaviorPlugin,
  createNetworkPlugin,
  createVuePlugin,
  ErrorPlugin,
  PerformancePlugin,
  BehaviorPlugin,
  NetworkPlugin,
  VuePlugin,
} from './plugins';

// 导出工具函数
export {
  generateId,
  getTimestamp,
  getPageUrl,
  getPageTitle,
  truncate,
  getErrorMessage,
  getErrorStack,
  isSdkRequest,
  deepMerge,
  throttle,
  debounce,
  log,
  warn,
  error,
  getDeviceInfo,
  getEnvironmentInfo,
  getReferrerInfo,
  getOrCreateSession,
  incrementPageViews,
  updateSessionActivity,
  RateLimiter,
  getXPath,
  getElementSelector,
  getScrollDepth,
  getNavigationTiming,
  getResourceTimings,
  getPaintTimings,
} from './utils';

// 导出类型和枚举
export {
  ReportType,
  type MonitorOptions,
  type MonitorPlugin,
  type MonitorCore,
  type RateLimitConfig,
  type DeviceInfo,
  type EnvironmentInfo,
  type ReferrerInfo,
  type SessionInfo,
  type BehaviorRecord,
  type BaseReportData,
  type ReportData,
  type ReportDataInput,
  type JsErrorData,
  type PromiseErrorData,
  type ResourceErrorData,
  type HttpErrorData,
  type VueErrorData,
  type PerformanceData,
  type ResourceTimingData,
  type LongTaskData,
  type PageViewData,
  type PageLeaveData,
  type ClickData,
  type RouteChangeData,
  type CustomEventData,
  type BehaviorStackData,
  type HttpRequestData,
  type SessionStartData,
  type SessionEndData,
} from './types';

// 默认导出
import { createMonitor, Monitor } from './core';
export default {
  createMonitor,
  Monitor,
};
