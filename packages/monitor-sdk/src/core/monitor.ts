/**
 * 前端监控SDK核心 - 增强版
 */
import type {
  MonitorOptions,
  MonitorPlugin,
  MonitorCore,
  ReportData,
  ReportDataInput,
  DeviceInfo,
  EnvironmentInfo,
  SessionInfo,
  BehaviorRecord,
  ReferrerInfo,
  RateLimitConfig,
} from '../types';
import { ReportType } from '../types';
import { Reporter } from './reporter';
import { createPlatformAdapter, type PlatformAdapter } from '../platform';
import {
  generateId,
  getTimestamp,
  deepMerge,
  log,
  getDeviceInfo,
  getEnvironmentInfo,
  getReferrerInfo,
} from '../utils';
import {
  createErrorPlugin,
  createPerformancePlugin,
  createBehaviorPlugin,
  createNetworkPlugin,
  BehaviorPlugin,
} from '../plugins';

// 默认限流配置
const defaultRateLimitConfig: RateLimitConfig = {
  maxPerSecond: 20,
  bucketCapacity: 50,
  tokenRefillRate: 10,
};

// 默认配置
const defaultOptions: Required<MonitorOptions> = {
  appId: '',
  reportUrl: '',
  platform: undefined as any, // 平台会自动检测，所以这里是 undefined
  userId: '',
  enableError: true,
  enablePerformance: true,
  enableBehavior: true,
  enableNetwork: true,
  sampleRate: 1,
  maxCache: 20,
  reportInterval: 5000,
  debug: false,
  extra: {},
  maxBehaviorStack: 30,
  rateLimit: defaultRateLimitConfig,
  enableLongTask: true,
  longTaskThreshold: 50,
};

/**
 * 监控核心类
 */
export class Monitor implements MonitorCore {
  options: Required<MonitorOptions>;
  private reporter: Reporter;
  private plugins: MonitorPlugin[] = [];
  private isDestroyed = false;
  private platformAdapter: PlatformAdapter;

  // 缓存信息
  private deviceInfo: DeviceInfo | null = null;
  private environmentInfo: EnvironmentInfo | null = null;
  private sessionInfo: SessionInfo | null = null;
  private referrerInfo: ReferrerInfo | null = null;

  // 行为栈
  private behaviorStack: BehaviorRecord[] = [];

  constructor(options: MonitorOptions) {
    // 验证必填参数
    if (!options.appId) {
      throw new Error('[Monitor SDK] appId is required');
    }
    if (!options.reportUrl) {
      throw new Error('[Monitor SDK] reportUrl is required');
    }

    // 合并配置（platform 需要特殊处理，因为可能是 undefined）
    const mergedOptions = deepMerge(defaultOptions, options);
    // 如果用户没有指定 platform，保持为 undefined（会在创建适配器时自动检测）
    if (options.platform !== undefined) {
      mergedOptions.platform = options.platform;
    }
    this.options = mergedOptions as Required<MonitorOptions>;

    // 初始化平台适配器
    this.platformAdapter = createPlatformAdapter(this.options.platform);

    if (!this.platformAdapter.isAvailable()) {
      log(this.options.debug, '警告: 平台适配器不可用，某些功能可能无法正常工作');
    }

    // 初始化基础信息
    this.initBaseInfo();

    // 初始化上报器
    this.reporter = new Reporter(
      this.options.reportUrl,
      this.options.maxCache,
      this.options.reportInterval,
      this.options.debug,
      this.options.rateLimit,
      this.platformAdapter
    );

    // 自动注册默认插件
    this.registerDefaultPlugins();

    // 上报会话开始
    this.reportSessionStart();

    log(this.options.debug, '监控SDK已初始化', {
      ...this.options,
      platform: this.platformAdapter.platform,
    });
  }

  /**
   * 获取平台适配器
   */
  getPlatformAdapter(): PlatformAdapter {
    return this.platformAdapter;
  }

  /**
   * 初始化基础信息
   */
  private initBaseInfo(): void {
    this.deviceInfo = getDeviceInfo();
    this.environmentInfo = getEnvironmentInfo();
    this.sessionInfo = this.getOrCreateSessionWithAdapter();
    this.referrerInfo = getReferrerInfo();

    log(this.options.debug, '设备信息:', this.deviceInfo);
    log(this.options.debug, '环境信息:', this.environmentInfo);
    log(this.options.debug, '会话信息:', this.sessionInfo);
  }

  /**
   * 使用平台适配器获取或创建会话
   */
  private getOrCreateSessionWithAdapter(): SessionInfo {
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

    // 获取或创建访客信息
    const getOrCreateVisitor = (): StoredVisitor => {
      try {
        const stored = this.platformAdapter.storage.local.getItem(VISITOR_KEY);
        if (stored) {
          return JSON.parse(stored) as StoredVisitor;
        }
      } catch {
        // 忽略错误
      }

      const visitor: StoredVisitor = {
        visitorId: generateId(),
        firstVisitTime: Date.now(),
        visitCount: 0,
      };

      try {
        this.platformAdapter.storage.local.setItem(VISITOR_KEY, JSON.stringify(visitor));
      } catch {
        // 忽略错误
      }

      return visitor;
    };

    const visitor = getOrCreateVisitor();
    const now = Date.now();
    let isNewSession = false;

    try {
      const stored = this.platformAdapter.storage.session.getItem(SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored) as StoredSession;
        // 检查会话是否过期
        if (now - session.lastActiveTime < SESSION_TIMEOUT) {
          // 更新最后活跃时间
          session.lastActiveTime = now;
          this.platformAdapter.storage.session.setItem(SESSION_KEY, JSON.stringify(session));

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
        this.platformAdapter.storage.local.setItem(VISITOR_KEY, JSON.stringify(visitor));
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
      this.platformAdapter.storage.session.setItem(SESSION_KEY, JSON.stringify(session));
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
   * 上报会话开始
   */
  private reportSessionStart(): void {
    if (Math.random() > this.options.sampleRate) return;

    const pageInfo = this.platformAdapter.getPageInfo();

    this.report({
      type: ReportType.SESSION_START,
      referrerInfo: this.referrerInfo,
      landingPage: pageInfo.path,
    }, 'high');
  }

  /**
   * 注册默认插件
   */
  private registerDefaultPlugins(): void {
    if (this.options.enableError) {
      this.use(createErrorPlugin());
    }
    if (this.options.enablePerformance) {
      this.use(createPerformancePlugin());
    }
    if (this.options.enableBehavior) {
      this.use(createBehaviorPlugin());
    }
    if (this.options.enableNetwork) {
      this.use(createNetworkPlugin());
    }
  }

  /**
   * 注册插件
   */
  use(plugin: MonitorPlugin): void {
    if (this.isDestroyed) {
      log(this.options.debug, '监控SDK已销毁，无法注册插件');
      return;
    }

    // 检查插件是否已注册
    const existingPlugin = this.plugins.find((p) => p.name === plugin.name);
    if (existingPlugin) {
      log(this.options.debug, `插件 ${plugin.name} 已存在，跳过注册`);
      return;
    }

    // 初始化插件
    plugin.init(this);
    this.plugins.push(plugin);

    log(this.options.debug, `插件 ${plugin.name} 已注册`);
  }

  /**
   * 上报数据
   */
  report(data: ReportDataInput, priority: 'high' | 'normal' | 'low' = 'normal'): void {
    if (this.isDestroyed) {
      return;
    }

    const pageInfo = this.platformAdapter.getPageInfo();

    // 构建完整的上报数据
    const reportData: ReportData = {
      ...data,
      id: generateId(),
      appId: this.options.appId,
      userId: this.options.userId,
      timestamp: getTimestamp(),
      pageUrl: pageInfo.url,
      pageTitle: pageInfo.title,
      deviceInfo: this.getDeviceInfo(),
      environmentInfo: this.getEnvironmentInfo(),
      sessionInfo: this.getSessionInfo(),
      extra: {
        ...this.options.extra,
        ...(data as any).extra,
      },
    } as ReportData;

    // 添加到上报队列
    this.reporter.add(reportData, priority);
  }

  /**
   * 设置用户ID
   */
  setUserId(userId: string): void {
    this.options.userId = userId;
    log(this.options.debug, `用户ID已设置: ${userId}`);
  }

  /**
   * 设置额外数据
   */
  setExtra(extra: Record<string, any>): void {
    this.options.extra = {
      ...this.options.extra,
      ...extra,
    };
    log(this.options.debug, '额外数据已更新', this.options.extra);
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo {
    if (!this.deviceInfo) {
      this.deviceInfo = getDeviceInfo();
    }
    return this.deviceInfo;
  }

  /**
   * 获取环境信息
   */
  getEnvironmentInfo(): EnvironmentInfo {
    // 环境信息可能变化（如网络状态），每次重新获取
    this.environmentInfo = getEnvironmentInfo();
    return this.environmentInfo;
  }

  /**
   * 获取会话信息
   */
  getSessionInfo(): SessionInfo {
    if (!this.sessionInfo) {
      this.sessionInfo = this.getOrCreateSessionWithAdapter();
    }
    return this.sessionInfo;
  }

  /**
   * 获取来源信息
   */
  getReferrerInfo(): ReferrerInfo {
    if (!this.referrerInfo) {
      this.referrerInfo = getReferrerInfo();
    }
    return this.referrerInfo;
  }

  /**
   * 获取行为栈
   */
  getBehaviorStack(): BehaviorRecord[] {
    // 优先从行为插件获取
    const behaviorPlugin = this.getPlugin<BehaviorPlugin>('behavior');
    if (behaviorPlugin && typeof behaviorPlugin.getBehaviorStack === 'function') {
      return behaviorPlugin.getBehaviorStack();
    }
    return [...this.behaviorStack];
  }

  /**
   * 添加行为记录
   */
  addBehavior(record: Omit<BehaviorRecord, 'timestamp'>): void {
    const fullRecord: BehaviorRecord = {
      ...record,
      timestamp: Date.now(),
    };

    this.behaviorStack.push(fullRecord);

    // 保持栈的大小限制
    if (this.behaviorStack.length > this.options.maxBehaviorStack) {
      this.behaviorStack.shift();
    }
  }

  /**
   * 手动上报自定义事件
   */
  trackEvent(eventName: string, eventData?: Record<string, any>): void {
    if (this.isDestroyed) {
      return;
    }

    // 添加到行为栈
    const pageInfo = this.platformAdapter.getPageInfo();
    this.addBehavior({
      type: 'custom',
      path: pageInfo.path,
      data: { eventName, ...eventData },
    });

    this.report({
      type: ReportType.CUSTOM_EVENT,
      eventName,
      eventData,
    });

    log(this.options.debug, `自定义事件已上报: ${eventName}`, eventData);
  }

  /**
   * 手动上报行为栈（用于错误追踪）
   */
  reportBehaviorStack(trigger: 'error' | 'manual' | 'session_end' = 'manual'): void {
    const stack = this.getBehaviorStack();
    if (stack.length === 0) return;

    this.report({
      type: ReportType.BEHAVIOR_STACK,
      records: stack,
      trigger,
    }, 'high');
  }

  /**
   * 立即上报所有缓存数据
   */
  flush(): void {
    this.reporter.flush();
  }

  /**
   * 获取已注册的插件
   */
  getPlugin<T extends MonitorPlugin>(name: string): T | undefined {
    return this.plugins.find((p) => p.name === name) as T | undefined;
  }

  /**
   * 获取上报器状态
   */
  getReporterStatus(): ReturnType<Reporter['getStatus']> {
    return this.reporter.getStatus();
  }

  /**
   * 销毁SDK
   */
  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    // 上报会话结束
    const sessionInfo = this.getSessionInfo();
    const behaviorStack = this.getBehaviorStack();

    this.report({
      type: ReportType.SESSION_END,
      duration: Date.now() - sessionInfo.startTime,
      pageViews: sessionInfo.pageViews,
      totalInteractions: behaviorStack.length,
      behaviorStack,
    }, 'high');

    // 销毁所有插件
    this.plugins.forEach((plugin) => {
      if (plugin.destroy) {
        plugin.destroy();
      }
    });
    this.plugins = [];

    // 销毁上报器
    this.reporter.destroy();

    log(this.options.debug, '监控SDK已销毁');
  }
}

/**
 * 创建监控实例
 */
export function createMonitor(options: MonitorOptions): Monitor {
  return new Monitor(options);
}
