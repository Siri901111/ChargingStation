/**
 * 工具函数
 */
import UAParser from 'ua-parser-js';
import type { DeviceInfo, EnvironmentInfo, ReferrerInfo, SessionInfo, RateLimitConfig } from '../types';

// ==================== 基础工具 ====================

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 获取当前时间戳
 */
export function getTimestamp(): number {
  return Date.now();
}

/**
 * 获取页面URL
 */
export function getPageUrl(): string {
  return window.location.href;
}

/**
 * 获取页面标题
 */
export function getPageTitle(): string {
  return document.title || '';
}

/**
 * 截取字符串
 */
export function truncate(str: string, maxLength: number = 200): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * 安全地获取错误信息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * 安全地获取错误堆栈
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * 判断是否为SDK自身的上报请求
 */
export function isSdkRequest(url: string, reportUrl: string): boolean {
  return url.includes(reportUrl);
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        (result as any)[key] = deepMerge(targetValue, sourceValue as any);
      } else if (sourceValue !== undefined) {
        (result as any)[key] = sourceValue;
      }
    }
  }

  return result;
}

/**
 * 判断是否为对象
 */
export function isObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = delay - (now - lastTime);

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

// ==================== 日志工具 ====================

export function log(debug: boolean, ...args: any[]): void {
  if (debug) {
    console.log('[Monitor SDK]', ...args);
  }
}

export function warn(debug: boolean, ...args: any[]): void {
  if (debug) {
    console.warn('[Monitor SDK]', ...args);
  }
}

export function error(debug: boolean, ...args: any[]): void {
  if (debug) {
    console.error('[Monitor SDK]', ...args);
  }
}

// ==================== 设备信息检测 ====================

// UA解析器实例缓存
let uaParserResult: UAParser.IResult | null = null;

/**
 * 获取UA解析结果
 */
function getUAResult(): UAParser.IResult {
  if (!uaParserResult) {
    uaParserResult = UAParser(navigator.userAgent);
  }
  return uaParserResult;
}

/**
 * 获取设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  const parser = getUAParser();
  const result = parser.getResult();

  return {
    browser: {
      name: result.browser.name || 'unknown',
      version: result.browser.version || 'unknown',
      major: result.browser.major || 'unknown',
    },
    os: {
      name: result.os.name || 'unknown',
      version: result.os.version || 'unknown',
    },
    device: {
      type: result.device.type || 'desktop',
      vendor: result.device.vendor || 'unknown',
      model: result.device.model || 'unknown',
    },
    engine: {
      name: result.engine.name || 'unknown',
      version: result.engine.version || 'unknown',
    },
    cpu: {
      architecture: result.cpu.architecture || 'unknown',
    },
  };
}

// ==================== 环境信息检测 ====================

/**
 * 获取网络连接信息
 */
function getNetworkInfo(): EnvironmentInfo['network'] {
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (connection) {
    return {
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
    };
  }

  return {
    type: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
  };
}

/**
 * 获取屏幕方向
 */
function getScreenOrientation(): string {
  if (screen.orientation) {
    return screen.orientation.type;
  }
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

/**
 * 获取环境信息
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  const nav = navigator as any;

  return {
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: getScreenOrientation(),
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    network: getNetworkInfo(),
    language: navigator.language || 'unknown',
    languages: Array.from(navigator.languages || [navigator.language]),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
    timezoneOffset: new Date().getTimezoneOffset(),
    cookieEnabled: navigator.cookieEnabled,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: nav.deviceMemory || 0,
    platform: navigator.platform || 'unknown',
  };
}

// ==================== 来源信息解析 ====================

// 搜索引擎列表
const SEARCH_ENGINES = [
  { name: 'google', pattern: /google\./i, keywordParam: 'q' },
  { name: 'baidu', pattern: /baidu\./i, keywordParam: 'wd' },
  { name: 'bing', pattern: /bing\./i, keywordParam: 'q' },
  { name: 'yahoo', pattern: /yahoo\./i, keywordParam: 'p' },
  { name: 'sogou', pattern: /sogou\./i, keywordParam: 'query' },
  { name: '360', pattern: /so\.com/i, keywordParam: 'q' },
  { name: 'shenma', pattern: /sm\.cn/i, keywordParam: 'q' },
  { name: 'duckduckgo', pattern: /duckduckgo\./i, keywordParam: 'q' },
  { name: 'yandex', pattern: /yandex\./i, keywordParam: 'text' },
];

// 社交媒体列表
const SOCIAL_MEDIA = [
  /facebook\./i,
  /twitter\./i,
  /x\.com/i,
  /linkedin\./i,
  /instagram\./i,
  /weibo\./i,
  /wechat\./i,
  /qq\.com/i,
  /zhihu\./i,
  /douyin\./i,
  /tiktok\./i,
  /pinterest\./i,
  /reddit\./i,
  /youtube\./i,
  /bilibili\./i,
];

/**
 * 解析UTM参数
 */
function parseUtmParams(urlString: string): ReferrerInfo['utm'] {
  try {
    const url = new URL(urlString);
    const params = url.searchParams;

    return {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      term: params.get('utm_term') || undefined,
      content: params.get('utm_content') || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * 获取来源信息
 */
export function getReferrerInfo(): ReferrerInfo {
  const referrer = document.referrer;
  const currentUrl = window.location.href;
  const utm = parseUtmParams(currentUrl);

  // 直接访问
  if (!referrer) {
    return {
      url: '',
      host: '',
      path: '',
      type: 'direct',
      utm,
    };
  }

  try {
    const refUrl = new URL(referrer);
    const currentHost = window.location.host;

    // 站内跳转
    if (refUrl.host === currentHost) {
      return {
        url: referrer,
        host: refUrl.host,
        path: refUrl.pathname,
        type: 'internal',
        utm,
      };
    }

    // 检查是否为搜索引擎
    for (const engine of SEARCH_ENGINES) {
      if (engine.pattern.test(refUrl.host)) {
        const keyword = refUrl.searchParams.get(engine.keywordParam) || undefined;
        return {
          url: referrer,
          host: refUrl.host,
          path: refUrl.pathname,
          type: 'search',
          keyword,
          utm,
        };
      }
    }

    // 检查是否为社交媒体
    for (const social of SOCIAL_MEDIA) {
      if (social.test(refUrl.host)) {
        return {
          url: referrer,
          host: refUrl.host,
          path: refUrl.pathname,
          type: 'social',
          utm,
        };
      }
    }

    // 外部链接
    return {
      url: referrer,
      host: refUrl.host,
      path: refUrl.pathname,
      type: 'link',
      utm,
    };
  } catch {
    return {
      url: referrer,
      host: '',
      path: '',
      type: 'link',
      utm,
    };
  }
}

// ==================== 会话管理 ====================

const SESSION_KEY = '__monitor_session__';
const VISITOR_KEY = '__monitor_visitor__';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分钟

interface StoredSession {
  sessionId: string;
  startTime: number;
  lastActiveTime: number;
  pageViews: number;
  visitCount: number;
}

interface StoredVisitor {
  visitorId: string;
  firstVisitTime: number;
  visitCount: number;
}

/**
 * 获取或创建访客信息
 */
function getOrCreateVisitor(): StoredVisitor {
  try {
    const stored = localStorage.getItem(VISITOR_KEY);
    if (stored) {
      const visitor = JSON.parse(stored) as StoredVisitor;
      return visitor;
    }
  } catch {
    // 忽略localStorage错误
  }

  const visitor: StoredVisitor = {
    visitorId: generateId(),
    firstVisitTime: Date.now(),
    visitCount: 0,
  };

  try {
    localStorage.setItem(VISITOR_KEY, JSON.stringify(visitor));
  } catch {
    // 忽略localStorage错误
  }

  return visitor;
}

/**
 * 获取或创建会话
 */
export function getOrCreateSession(): SessionInfo {
  const visitor = getOrCreateVisitor();
  const now = Date.now();
  let isNewSession = false;

  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const session = JSON.parse(stored) as StoredSession;
      // 检查会话是否过期
      if (now - session.lastActiveTime < SESSION_TIMEOUT) {
        // 更新最后活跃时间
        session.lastActiveTime = now;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

        return {
          sessionId: session.sessionId,
          visitorId: visitor.visitorId,
          isNewVisitor: visitor.visitCount === 0,
          startTime: session.startTime,
          visitCount: session.visitCount,
          pageViews: session.pageViews,
        };
      }
      isNewSession = true;
    } else {
      isNewSession = true;
    }
  } catch {
    isNewSession = true;
  }

  // 创建新会话
  if (isNewSession) {
    visitor.visitCount++;
    try {
      localStorage.setItem(VISITOR_KEY, JSON.stringify(visitor));
    } catch {
      // 忽略
    }
  }

  const session: StoredSession = {
    sessionId: generateId(),
    startTime: now,
    lastActiveTime: now,
    pageViews: 0,
    visitCount: visitor.visitCount,
  };

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // 忽略
  }

  return {
    sessionId: session.sessionId,
    visitorId: visitor.visitorId,
    isNewVisitor: visitor.visitCount === 1,
    startTime: session.startTime,
    visitCount: session.visitCount,
    pageViews: session.pageViews,
  };
}

/**
 * 增加页面浏览数
 */
export function incrementPageViews(): void {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const session = JSON.parse(stored) as StoredSession;
      session.pageViews++;
      session.lastActiveTime = Date.now();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // 忽略
  }
}

/**
 * 更新会话活跃时间
 */
export function updateSessionActivity(): void {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const session = JSON.parse(stored) as StoredSession;
      session.lastActiveTime = Date.now();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // 忽略
  }
}

// ==================== 限流器（令牌桶算法） ====================

export class RateLimiter {
  private tokens: number;
  private capacity: number;
  private refillRate: number; // 每秒补充的令牌数
  private lastRefillTime: number;
  private counter: number = 0;
  private counterResetTime: number;
  private maxPerSecond: number;

  constructor(config: RateLimitConfig = {}) {
    this.capacity = config.bucketCapacity || 50;
    this.tokens = this.capacity;
    this.refillRate = config.tokenRefillRate || 10;
    this.lastRefillTime = Date.now();
    this.maxPerSecond = config.maxPerSecond || 20;
    this.counterResetTime = Date.now();
  }

  /**
   * 补充令牌
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefillTime) / 1000;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTime = now;

    // 重置计数器
    if (now - this.counterResetTime >= 1000) {
      this.counter = 0;
      this.counterResetTime = now;
    }
  }

  /**
   * 尝试获取令牌
   * @param priority 优先级，high优先级不受限流影响
   */
  tryAcquire(priority: 'high' | 'normal' | 'low' = 'normal'): boolean {
    // 高优先级直接通过
    if (priority === 'high') {
      return true;
    }

    this.refill();

    // 计数器限流
    if (this.counter >= this.maxPerSecond) {
      return false;
    }

    // 低优先级需要更多令牌
    const tokensNeeded = priority === 'low' ? 2 : 1;

    if (this.tokens >= tokensNeeded) {
      this.tokens -= tokensNeeded;
      this.counter++;
      return true;
    }

    return false;
  }

  /**
   * 获取当前状态
   */
  getStatus(): { tokens: number; counter: number } {
    this.refill();
    return {
      tokens: Math.floor(this.tokens),
      counter: this.counter,
    };
  }
}

// ==================== XPath工具 ====================

/**
 * 获取元素的XPath路径
 */
export function getXPath(element: Element): string {
  if (!element) return '';

  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  if (element === document.body) {
    return '/html/body';
  }

  let path = '';
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling: Element | null = current.previousElementSibling;

    while (sibling) {
      if (sibling.nodeName === current.nodeName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    const tagName = current.nodeName.toLowerCase();
    const pathIndex = index > 1 ? `[${index}]` : '';
    path = `/${tagName}${pathIndex}${path}`;

    current = current.parentElement;
  }

  return path;
}

/**
 * 获取元素的简短标识
 */
export function getElementSelector(element: Element): string {
  if (!element) return '';

  let selector = element.tagName.toLowerCase();

  if (element.id) {
    selector += `#${element.id}`;
  }

  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).slice(0, 2);
    if (classes.length) {
      selector += `.${classes.join('.')}`;
    }
  }

  return selector;
}

// ==================== 滚动深度计算 ====================

/**
 * 计算当前滚动深度（百分比）
 */
export function getScrollDepth(): number {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollHeight <= clientHeight) {
    return 100;
  }

  return Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
}

// ==================== 性能指标工具 ====================

/**
 * 安全获取性能条目
 */
export function getNavigationTiming(): PerformanceNavigationTiming | null {
  try {
    const entries = performance.getEntriesByType('navigation');
    if (entries.length > 0) {
      return entries[0] as PerformanceNavigationTiming;
    }
  } catch {
    // 忽略
  }
  return null;
}

/**
 * 获取资源加载性能
 */
export function getResourceTimings(): PerformanceResourceTiming[] {
  try {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  } catch {
    return [];
  }
}

/**
 * 获取绘制性能
 */
export function getPaintTimings(): { fp: number; fcp: number } {
  const result = { fp: 0, fcp: 0 };

  try {
    const entries = performance.getEntriesByType('paint');
    entries.forEach((entry) => {
      if (entry.name === 'first-paint') {
        result.fp = Math.round(entry.startTime);
      } else if (entry.name === 'first-contentful-paint') {
        result.fcp = Math.round(entry.startTime);
      }
    });
  } catch {
    // 忽略
  }

  return result;
}
