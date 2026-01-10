/**
 * 前端监控SDK类型定义
 */

// 平台类型
export type Platform = 'web' | 'uniapp' | 'mini-program';

// SDK配置选项
export interface MonitorOptions {
  // 应用唯一标识
  appId: string;
  // 上报地址
  reportUrl: string;
  // 平台类型（可选，默认自动检测）
  platform?: Platform;
  // 用户ID（可选）
  userId?: string;
  // 是否开启错误监控，默认true
  enableError?: boolean;
  // 是否开启性能监控，默认true
  enablePerformance?: boolean;
  // 是否开启用户行为监控，默认true
  enableBehavior?: boolean;
  // 是否开启网络请求监控，默认true
  enableNetwork?: boolean;
  // 采样率 0-1，默认1
  sampleRate?: number;
  // 最大缓存数量，默认20
  maxCache?: number;
  // 上报间隔（毫秒），默认5000
  reportInterval?: number;
  // 是否开启控制台日志，默认false
  debug?: boolean;
  // 额外的全局数据
  extra?: Record<string, any>;
  // 行为栈最大长度，默认30
  maxBehaviorStack?: number;
  // 限流配置
  rateLimit?: RateLimitConfig;
  // 是否上报长任务，默认true
  enableLongTask?: boolean;
  // 长任务阈值（毫秒），默认50
  longTaskThreshold?: number;
}

// 限流配置
export interface RateLimitConfig {
  // 每秒最大上报数量
  maxPerSecond?: number;
  // 令牌桶容量
  bucketCapacity?: number;
  // 令牌恢复速率（每秒）
  tokenRefillRate?: number;
}

// 上报数据类型枚举
export enum ReportType {
  // 错误类型
  JS_ERROR = 'js_error',
  PROMISE_ERROR = 'promise_error',
  RESOURCE_ERROR = 'resource_error',
  HTTP_ERROR = 'http_error',
  VUE_ERROR = 'vue_error',
  CONSOLE_ERROR = 'console_error',
  // 性能类型
  PERFORMANCE = 'performance',
  RESOURCE_TIMING = 'resource_timing',
  LONG_TASK = 'long_task',
  FIRST_PAINT = 'first_paint',
  FIRST_CONTENTFUL_PAINT = 'first_contentful_paint',
  LARGEST_CONTENTFUL_PAINT = 'largest_contentful_paint',
  FIRST_INPUT_DELAY = 'first_input_delay',
  CUMULATIVE_LAYOUT_SHIFT = 'cumulative_layout_shift',
  TIME_TO_FIRST_BYTE = 'time_to_first_byte',
  INTERACTION_TO_NEXT_PAINT = 'interaction_to_next_paint',
  // 行为类型
  PAGE_VIEW = 'page_view',
  PAGE_LEAVE = 'page_leave',
  CLICK = 'click',
  ROUTE_CHANGE = 'route_change',
  CUSTOM_EVENT = 'custom_event',
  BEHAVIOR_STACK = 'behavior_stack',
  // 网络类型
  HTTP_REQUEST = 'http_request',
  // 会话类型
  SESSION_START = 'session_start',
  SESSION_END = 'session_end'
}

// 设备信息
export interface DeviceInfo {
  // 浏览器信息
  browser: {
    name: string;
    version: string;
    major: string;
  };
  // 操作系统
  os: {
    name: string;
    version: string;
  };
  // 设备类型
  device: {
    type: string; // mobile, tablet, desktop
    vendor: string;
    model: string;
  };
  // 引擎
  engine: {
    name: string;
    version: string;
  };
  // CPU架构
  cpu: {
    architecture: string;
  };
}

// 访问来源信息
export interface ReferrerInfo {
  // 完整来源URL
  url: string;
  // 来源域名
  host: string;
  // 来源路径
  path: string;
  // 来源类型：direct(直接访问), search(搜索引擎), social(社交媒体), link(外部链接), internal(站内)
  type: 'direct' | 'search' | 'social' | 'link' | 'internal';
  // 来源关键词（搜索引擎）
  keyword?: string;
  // UTM参数
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

// 用户环境信息
export interface EnvironmentInfo {
  // 屏幕信息
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
    orientation: string;
  };
  // 视口信息
  viewport: {
    width: number;
    height: number;
  };
  // 网络信息
  network: {
    type: string; // wifi, 4g, 3g, 2g, slow-2g, offline
    effectiveType: string;
    downlink: number; // Mbps
    rtt: number; // ms
    saveData: boolean;
  };
  // 语言
  language: string;
  // 语言列表
  languages: string[];
  // 时区
  timezone: string;
  // 时区偏移（分钟）
  timezoneOffset: number;
  // Cookie是否启用
  cookieEnabled: boolean;
  // 是否支持触摸
  touchSupport: boolean;
  // 最大触摸点数
  maxTouchPoints: number;
  // 硬件并发数
  hardwareConcurrency: number;
  // 设备内存（GB）
  deviceMemory: number;
  // 平台
  platform: string;
}

// 会话信息
export interface SessionInfo {
  // 会话ID
  sessionId: string;
  // 访客ID（持久化）
  visitorId: string;
  // 是否新访客
  isNewVisitor: boolean;
  // 会话开始时间
  startTime: number;
  // 访问次数
  visitCount: number;
  // 页面浏览数
  pageViews: number;
}

// 行为记录
export interface BehaviorRecord {
  // 行为类型
  type: 'click' | 'input' | 'scroll' | 'route' | 'custom' | 'error' | 'request';
  // 时间戳
  timestamp: number;
  // 页面路径
  path: string;
  // 行为数据
  data: Record<string, any>;
}

// 基础上报数据结构
export interface BaseReportData {
  // 数据唯一ID
  id: string;
  // 应用ID
  appId: string;
  // 用户ID
  userId?: string;
  // 上报类型
  type: ReportType;
  // 时间戳
  timestamp: number;
  // 页面URL
  pageUrl: string;
  // 页面标题
  pageTitle: string;
  // 设备信息
  deviceInfo: DeviceInfo;
  // 环境信息
  environmentInfo: EnvironmentInfo;
  // 会话信息
  sessionInfo: SessionInfo;
  // 额外数据
  extra?: Record<string, any>;
}

// JS错误数据
export interface JsErrorData extends BaseReportData {
  type: ReportType.JS_ERROR;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  // 错误发生时的行为栈
  behaviorStack?: BehaviorRecord[];
}

// Promise错误数据
export interface PromiseErrorData extends BaseReportData {
  type: ReportType.PROMISE_ERROR;
  message: string;
  stack?: string;
  reason?: string;
  behaviorStack?: BehaviorRecord[];
}

// 资源加载错误数据
export interface ResourceErrorData extends BaseReportData {
  type: ReportType.RESOURCE_ERROR;
  resourceType: string;
  resourceUrl: string;
}

// HTTP错误数据
export interface HttpErrorData extends BaseReportData {
  type: ReportType.HTTP_ERROR;
  url: string;
  method: string;
  status: number;
  statusText: string;
  duration: number;
  requestData?: any;
  responseData?: any;
  behaviorStack?: BehaviorRecord[];
}

// Vue错误数据
export interface VueErrorData extends BaseReportData {
  type: ReportType.VUE_ERROR;
  message: string;
  stack?: string;
  componentName?: string;
  hook?: string;
  info?: string;
  behaviorStack?: BehaviorRecord[];
}

// 性能数据 - 使用 Navigation Timing API Level 2
export interface PerformanceData extends BaseReportData {
  type: ReportType.PERFORMANCE;
  // === 以用户为核心的指标 ===
  // 首次绘制 (FP)
  firstPaint: number;
  // 首次内容绘制 (FCP)
  firstContentfulPaint: number;
  // 最大内容绘制 (LCP)
  largestContentfulPaint?: number;
  // 首次输入延迟 (FID)
  firstInputDelay?: number;
  // 累积布局偏移 (CLS)
  cumulativeLayoutShift?: number;
  // 交互到下一次绘制 (INP)
  interactionToNextPaint?: number;
  // 首字节时间 (TTFB)
  timeToFirstByte: number;
  // 可交互时间 (TTI) - 估算
  timeToInteractive?: number;
  // 首次有效绘制 (FMP) - 估算
  firstMeaningfulPaint?: number;

  // === 以技术为中心的指标 ===
  // DNS解析耗时
  dnsLookup: number;
  // TCP连接耗时
  tcpConnection: number;
  // SSL握手耗时
  sslHandshake: number;
  // 请求耗时
  request: number;
  // 响应耗时
  response: number;
  // DOM解析耗时
  domParsing: number;
  // 资源加载耗时
  resourceLoading: number;
  // DOM准备就绪
  domContentLoaded: number;
  // 页面完全加载
  loadComplete: number;

  // === 其他指标 ===
  // 重定向次数
  redirectCount: number;
  // 重定向耗时
  redirectTime: number;
  // 页面大小
  transferSize: number;
  // 编码后大小
  encodedBodySize: number;
  // 解码后大小
  decodedBodySize: number;
}

// 资源加载性能数据
export interface ResourceTimingData extends BaseReportData {
  type: ReportType.RESOURCE_TIMING;
  resources: Array<{
    name: string;
    type: string;
    duration: number;
    transferSize: number;
    startTime: number;
    // 是否命中缓存
    cached: boolean;
  }>;
}

// 长任务数据
export interface LongTaskData extends BaseReportData {
  type: ReportType.LONG_TASK;
  // 任务持续时间
  duration: number;
  // 任务开始时间
  startTime: number;
  // 任务归因
  attribution: string;
}

// 页面访问数据
export interface PageViewData extends BaseReportData {
  type: ReportType.PAGE_VIEW;
  // 来源信息
  referrerInfo: ReferrerInfo;
  // 页面路径
  path: string;
  // 页面加载时间
  loadTime?: number;
}

// 页面离开数据
export interface PageLeaveData extends BaseReportData {
  type: ReportType.PAGE_LEAVE;
  path: string;
  // 停留时间（毫秒）
  stayTime: number;
  // 滚动深度（百分比）
  scrollDepth: number;
  // 是否有交互
  hasInteraction: boolean;
  // 交互次数
  interactionCount: number;
}

// 点击事件数据
export interface ClickData extends BaseReportData {
  type: ReportType.CLICK;
  tagName: string;
  elementId?: string;
  className?: string;
  innerText?: string;
  x: number;
  y: number;
  xpath?: string;
  // 元素位置
  elementRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

// 路由变化数据
export interface RouteChangeData extends BaseReportData {
  type: ReportType.ROUTE_CHANGE;
  from: string;
  to: string;
  // 路由切换耗时
  duration?: number;
}

// 自定义事件数据
export interface CustomEventData extends BaseReportData {
  type: ReportType.CUSTOM_EVENT;
  eventName: string;
  eventData?: Record<string, any>;
}

// 行为栈数据
export interface BehaviorStackData extends BaseReportData {
  type: ReportType.BEHAVIOR_STACK;
  // 行为记录列表
  records: BehaviorRecord[];
  // 触发原因
  trigger: 'error' | 'manual' | 'session_end';
}

// HTTP请求数据
export interface HttpRequestData extends BaseReportData {
  type: ReportType.HTTP_REQUEST;
  url: string;
  method: string;
  status: number;
  success: boolean;
  duration: number;
  requestSize?: number;
  responseSize?: number;
  // 请求阶段耗时
  timing?: {
    dns: number;
    tcp: number;
    ssl: number;
    ttfb: number;
    download: number;
  };
}

// 会话开始数据
export interface SessionStartData extends BaseReportData {
  type: ReportType.SESSION_START;
  // 来源信息
  referrerInfo: ReferrerInfo;
  // 落地页
  landingPage: string;
}

// 会话结束数据
export interface SessionEndData extends BaseReportData {
  type: ReportType.SESSION_END;
  // 会话时长
  duration: number;
  // 浏览页面数
  pageViews: number;
  // 总交互次数
  totalInteractions: number;
  // 行为栈
  behaviorStack: BehaviorRecord[];
}

// 所有上报数据类型联合
export type ReportData =
  | JsErrorData
  | PromiseErrorData
  | ResourceErrorData
  | HttpErrorData
  | VueErrorData
  | PerformanceData
  | ResourceTimingData
  | LongTaskData
  | PageViewData
  | PageLeaveData
  | ClickData
  | RouteChangeData
  | CustomEventData
  | BehaviorStackData
  | HttpRequestData
  | SessionStartData
  | SessionEndData;

// 上报数据的输入类型（不包含自动填充的字段）
export type ReportDataInput = {
  type: ReportType;
  [key: string]: any;
};

// 插件接口
export interface MonitorPlugin {
  name: string;
  init(monitor: MonitorCore): void;
  destroy?(): void;
}

// 监控核心接口
export interface MonitorCore {
  options: Required<MonitorOptions>;
  report(data: ReportDataInput, priority?: 'high' | 'normal' | 'low'): void;
  use(plugin: MonitorPlugin): void;
  setUserId(userId: string): void;
  setExtra(extra: Record<string, any>): void;
  destroy(): void;
  // 获取设备信息
  getDeviceInfo(): DeviceInfo;
  // 获取环境信息
  getEnvironmentInfo(): EnvironmentInfo;
  // 获取会话信息
  getSessionInfo(): SessionInfo;
  // 获取行为栈
  getBehaviorStack(): BehaviorRecord[];
  // 添加行为记录
  addBehavior(record: Omit<BehaviorRecord, 'timestamp'>): void;
  // 获取来源信息
  getReferrerInfo(): ReferrerInfo;
  // 获取平台适配器（可选，用于插件访问平台能力）
  getPlatformAdapter?(): any;
}
