/**
 * 性能监控插件 - 完整版
 * 使用 Navigation Timing API Level 2 和 Web Vitals
 */
import type { MonitorPlugin, MonitorCore } from '../types';
import { ReportType } from '../types';
import { log, getNavigationTiming, getPaintTimings, getResourceTimings } from '../utils';

export class PerformancePlugin implements MonitorPlugin {
  name = 'performance';
  private monitor: MonitorCore | null = null;
  private lcpObserver: PerformanceObserver | null = null;
  private fidObserver: PerformanceObserver | null = null;
  private clsObserver: PerformanceObserver | null = null;
  private inpObserver: PerformanceObserver | null = null;
  private longTaskObserver: PerformanceObserver | null = null;
  private clsValue = 0;
  private inpValue = 0;
  private lcpValue = 0;
  private fidValue: number | null = null;
  private hasReportedPerformance = false;

  init(monitor: MonitorCore): void {
    this.monitor = monitor;

    // 等待页面加载完成后收集性能数据
    if (document.readyState === 'complete') {
      setTimeout(() => this.collectPerformance(), 0);
    } else {
      window.addEventListener('load', () => {
        // 延迟收集，确保数据完整
        setTimeout(() => this.collectPerformance(), 100);
      });
    }

    // 收集Web Vitals核心指标
    this.collectWebVitals();

    // 监听长任务
    if (monitor.options.enableLongTask) {
      this.observeLongTasks();
    }

    // 页面隐藏时上报最终数据
    this.setupVisibilityHandler();

    log(monitor.options.debug, '性能监控插件已初始化');
  }

  /**
   * 收集页面性能数据 - 使用 Navigation Timing API Level 2
   */
  private collectPerformance(): void {
    if (this.hasReportedPerformance) return;

    const timing = getNavigationTiming();
    if (!timing) {
      log(this.monitor!.options.debug, '当前浏览器不支持Navigation Timing API Level 2');
      return;
    }

    const paintTimings = getPaintTimings();

    // 使用 Navigation Timing API Level 2 计算各项指标
    const performanceData = {
      // === 以用户为核心的指标 ===
      firstPaint: paintTimings.fp,
      firstContentfulPaint: paintTimings.fcp,
      timeToFirstByte: Math.round(timing.responseStart - timing.requestStart),

      // === 以技术为中心的指标 ===
      // DNS解析耗时
      dnsLookup: Math.round(timing.domainLookupEnd - timing.domainLookupStart),
      // TCP连接耗时
      tcpConnection: Math.round(timing.connectEnd - timing.connectStart),
      // SSL握手耗时（仅HTTPS）
      sslHandshake: timing.secureConnectionStart > 0
        ? Math.round(timing.connectEnd - timing.secureConnectionStart)
        : 0,
      // 请求耗时
      request: Math.round(timing.responseStart - timing.requestStart),
      // 响应耗时
      response: Math.round(timing.responseEnd - timing.responseStart),
      // DOM解析耗时
      domParsing: Math.round(timing.domInteractive - timing.responseEnd),
      // 资源加载耗时
      resourceLoading: Math.round(timing.loadEventStart - timing.domContentLoadedEventEnd),
      // DOM准备就绪
      domContentLoaded: Math.round(timing.domContentLoadedEventEnd - timing.fetchStart),
      // 页面完全加载
      loadComplete: Math.round(timing.loadEventEnd - timing.fetchStart),

      // === 其他指标 ===
      redirectCount: timing.redirectCount || 0,
      redirectTime: Math.round(timing.redirectEnd - timing.redirectStart),
      transferSize: timing.transferSize || 0,
      encodedBodySize: timing.encodedBodySize || 0,
      decodedBodySize: timing.decodedBodySize || 0,
    };

    // 采样率判断
    if (Math.random() > this.monitor!.options.sampleRate) {
      return;
    }

    this.hasReportedPerformance = true;

    this.monitor!.report({
      type: ReportType.PERFORMANCE,
      ...performanceData,
      // Web Vitals 指标会在后续更新
      largestContentfulPaint: this.lcpValue || undefined,
      firstInputDelay: this.fidValue || undefined,
      cumulativeLayoutShift: this.clsValue || undefined,
      interactionToNextPaint: this.inpValue || undefined,
    });

    // 收集资源加载性能
    this.collectResourceTimings();
  }

  /**
   * 收集资源加载性能
   */
  private collectResourceTimings(): void {
    const resources = getResourceTimings();
    if (resources.length === 0) return;

    // 只上报较大的资源或加载慢的资源
    const significantResources = resources
      .filter((r) => r.duration > 100 || r.transferSize > 50000)
      .slice(0, 50) // 最多50个
      .map((r) => ({
        name: r.name,
        type: r.initiatorType,
        duration: Math.round(r.duration),
        transferSize: r.transferSize,
        startTime: Math.round(r.startTime),
        cached: r.transferSize === 0 && r.decodedBodySize > 0,
      }));

    if (significantResources.length > 0 && Math.random() <= this.monitor!.options.sampleRate) {
      this.monitor!.report({
        type: ReportType.RESOURCE_TIMING,
        resources: significantResources,
      }, 'low');
    }
  }

  /**
   * 收集Web Vitals核心指标
   */
  private collectWebVitals(): void {
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeINP();
  }

  /**
   * 观察LCP（最大内容绘制）
   */
  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      this.lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.lcpValue = Math.round(lastEntry.startTime);
        }
      });

      this.lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      log(this.monitor!.options.debug, 'LCP观察器创建失败:', e);
    }
  }

  /**
   * 观察FID（首次输入延迟）
   */
  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      this.fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0] as PerformanceEventTiming;
        if (firstEntry && this.fidValue === null) {
          this.fidValue = Math.round(firstEntry.processingStart - firstEntry.startTime);
        }
      });

      this.fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      log(this.monitor!.options.debug, 'FID观察器创建失败:', e);
    }
  }

  /**
   * 观察CLS（累积布局偏移）
   */
  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let sessionValue = 0;
      let sessionEntries: PerformanceEntry[] = [];

      this.clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries() as any[];

        entries.forEach((entry) => {
          // 只统计没有用户输入的布局偏移
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0] as any;
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1] as any;

            // 如果是新会话（间隔超过1秒或超过5秒总时长）
            if (
              sessionEntries.length === 0 ||
              entry.startTime - lastSessionEntry.startTime > 1000 ||
              entry.startTime - firstSessionEntry.startTime > 5000
            ) {
              sessionEntries = [entry];
              sessionValue = entry.value;
            } else {
              sessionEntries.push(entry);
              sessionValue += entry.value;
            }

            // 更新最大会话值
            if (sessionValue > this.clsValue) {
              this.clsValue = sessionValue;
            }
          }
        });
      });

      this.clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      log(this.monitor!.options.debug, 'CLS观察器创建失败:', e);
    }
  }

  /**
   * 观察INP（交互到下一次绘制）- 新的核心指标
   */
  private observeINP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const interactions: number[] = [];

      this.inpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries() as any[];

        entries.forEach((entry) => {
          // 只处理有interactionId的事件
          if (entry.interactionId) {
            const duration = entry.duration;
            interactions.push(duration);

            // 计算INP（取第98百分位，如果交互少于50个则取最大值）
            if (interactions.length >= 50) {
              interactions.sort((a, b) => a - b);
              const index = Math.floor(interactions.length * 0.98);
              this.inpValue = interactions[index];
            } else {
              this.inpValue = Math.max(...interactions);
            }
          }
        });
      });

      this.inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 } as any);
    } catch (e) {
      log(this.monitor!.options.debug, 'INP观察器创建失败:', e);
    }
  }

  /**
   * 观察长任务
   */
  private observeLongTasks(): void {
    if (!('PerformanceObserver' in window)) return;

    const threshold = this.monitor!.options.longTaskThreshold || 50;

    try {
      this.longTaskObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();

        entries.forEach((entry) => {
          if (entry.duration >= threshold) {
            // 获取任务归因
            const attribution = (entry as any).attribution?.[0]?.name || 'unknown';

            if (Math.random() <= this.monitor!.options.sampleRate) {
              this.monitor!.report({
                type: ReportType.LONG_TASK,
                duration: Math.round(entry.duration),
                startTime: Math.round(entry.startTime),
                attribution,
              }, 'low');
            }
          }
        });
      });

      this.longTaskObserver.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      log(this.monitor!.options.debug, '长任务观察器创建失败:', e);
    }
  }

  /**
   * 设置页面可见性变化处理
   */
  private setupVisibilityHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportFinalMetrics();
      }
    });
  }

  /**
   * 上报最终的Web Vitals指标
   */
  private reportFinalMetrics(): void {
    if (Math.random() > this.monitor!.options.sampleRate) return;

    // 上报LCP
    if (this.lcpValue > 0) {
      this.monitor!.report({
        type: ReportType.LARGEST_CONTENTFUL_PAINT,
        largestContentfulPaint: this.lcpValue,
      } as any, 'high');
    }

    // 上报FID
    if (this.fidValue !== null) {
      this.monitor!.report({
        type: ReportType.FIRST_INPUT_DELAY,
        firstInputDelay: this.fidValue,
      } as any, 'high');
    }

    // 上报CLS
    if (this.clsValue > 0) {
      this.monitor!.report({
        type: ReportType.CUMULATIVE_LAYOUT_SHIFT,
        cumulativeLayoutShift: Math.round(this.clsValue * 1000) / 1000,
      } as any, 'high');
    }

    // 上报INP
    if (this.inpValue > 0) {
      this.monitor!.report({
        type: ReportType.INTERACTION_TO_NEXT_PAINT,
        interactionToNextPaint: this.inpValue,
      } as any, 'high');
    }
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    this.reportFinalMetrics();

    if (this.lcpObserver) {
      this.lcpObserver.disconnect();
      this.lcpObserver = null;
    }
    if (this.fidObserver) {
      this.fidObserver.disconnect();
      this.fidObserver = null;
    }
    if (this.clsObserver) {
      this.clsObserver.disconnect();
      this.clsObserver = null;
    }
    if (this.inpObserver) {
      this.inpObserver.disconnect();
      this.inpObserver = null;
    }
    if (this.longTaskObserver) {
      this.longTaskObserver.disconnect();
      this.longTaskObserver = null;
    }
    this.monitor = null;
  }
}

/**
 * 创建性能监控插件
 */
export function createPerformancePlugin(): MonitorPlugin {
  return new PerformancePlugin();
}
