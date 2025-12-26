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
import {
  generateId,
  getTimestamp,
  getPageUrl,
  getPageTitle,
  deepMerge,
  log,
  getDeviceInfo,
  getEnvironmentInfo,
  getOrCreateSession,
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

    // 合并配置
    this.options = deepMerge(defaultOptions, options);

    // 初始化基础信息
    this.initBaseInfo();

    // 初始化上报器
    this.reporter = new Reporter(
      this.options.reportUrl,
      this.options.maxCache,
      this.options.reportInterval,
      this.options.debug,
      this.options.rateLimit
    );

    // 自动注册默认插件
    this.registerDefaultPlugins();

    // 上报会话开始
    this.reportSessionStart();

    log(this.options.debug, '监控SDK已初始化', this.options);
  }

  /**
   * 初始化基础信息
   */
  private initBaseInfo(): void {
    this.deviceInfo = getDeviceInfo();
    this.environmentInfo = getEnvironmentInfo();
    this.sessionInfo = getOrCreateSession();
    this.referrerInfo = getReferrerInfo();

    log(this.options.debug, '设备信息:', this.deviceInfo);
    log(this.options.debug, '环境信息:', this.environmentInfo);
    log(this.options.debug, '会话信息:', this.sessionInfo);
  }

  /**
   * 上报会话开始
   */
  private reportSessionStart(): void {
    if (Math.random() > this.options.sampleRate) return;

    this.report({
      type: ReportType.SESSION_START,
      referrerInfo: this.referrerInfo,
      landingPage: window.location.pathname,
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

    // 构建完整的上报数据
    const reportData: ReportData = {
      ...data,
      id: generateId(),
      appId: this.options.appId,
      userId: this.options.userId,
      timestamp: getTimestamp(),
      pageUrl: getPageUrl(),
      pageTitle: getPageTitle(),
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
      this.sessionInfo = getOrCreateSession();
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
    this.addBehavior({
      type: 'custom',
      path: window.location.pathname,
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
