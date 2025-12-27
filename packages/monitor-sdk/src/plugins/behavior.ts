/**
 * 用户行为监控插件 - 增强版
 * 支持行为栈、全链路追踪、滚动深度、来源分析
 */
import type { MonitorPlugin, MonitorCore, BehaviorRecord } from '../types';
import { ReportType } from '../types';
import {
  getXPath,
  truncate,
  throttle,
  log,
  getScrollDepth,
  getReferrerInfo,
  incrementPageViews,
  updateSessionActivity,
} from '../utils';

export class BehaviorPlugin implements MonitorPlugin {
  name = 'behavior';
  private monitor: MonitorCore | null = null;
  private pageEnterTime: number = 0;
  private currentPath: string = '';
  private clickHandler: ((event: MouseEvent) => void) | null = null;
  private inputHandler: ((event: Event) => void) | null = null;
  private scrollHandler: (() => void) | null = null;
  private historyHandler: (() => void) | null = null;
  private hashChangeHandler: (() => void) | null = null;
  private originalPushState: typeof history.pushState | null = null;
  private originalReplaceState: typeof history.replaceState | null = null;

  // 行为记录相关
  private behaviorStack: BehaviorRecord[] = [];
  private maxBehaviorStack: number = 30;

  // 页面交互统计
  private interactionCount: number = 0;
  private maxScrollDepth: number = 0;
  private hasInteraction: boolean = false;

  // 路由切换计时
  private routeChangeStartTime: number = 0;

  init(monitor: MonitorCore): void {
    this.monitor = monitor;
    this.pageEnterTime = Date.now();
    this.currentPath = window.location.pathname;
    this.maxBehaviorStack = monitor.options.maxBehaviorStack || 30;

    // 上报页面访问
    this.reportPageView();
    // 监听点击事件
    this.listenClick();
    // 监听输入事件
    this.listenInput();
    // 监听滚动事件
    this.listenScroll();
    // 监听路由变化
    this.listenRouteChange();
    // 监听页面离开
    this.listenPageLeave();

    log(monitor.options.debug, '用户行为监控插件已初始化');
  }

  /**
   * 添加行为记录到栈中
   */
  private addBehaviorRecord(record: Omit<BehaviorRecord, 'timestamp'>): void {
    const fullRecord: BehaviorRecord = {
      ...record,
      timestamp: Date.now(),
    };

    this.behaviorStack.push(fullRecord);

    // 保持栈的大小限制
    if (this.behaviorStack.length > this.maxBehaviorStack) {
      this.behaviorStack.shift();
    }

    // 更新交互统计
    this.hasInteraction = true;
    this.interactionCount++;

    // 更新会话活跃时间
    updateSessionActivity();
  }

  /**
   * 获取当前行为栈的副本
   */
  getBehaviorStack(): BehaviorRecord[] {
    return [...this.behaviorStack];
  }

  /**
   * 上报页面访问
   */
  private reportPageView(): void {
    // 增加页面浏览计数
    incrementPageViews();

    if (Math.random() > this.monitor!.options.sampleRate) {
      return;
    }

    const referrerInfo = getReferrerInfo();

    this.monitor!.report({
      type: ReportType.PAGE_VIEW,
      referrerInfo,
      path: window.location.pathname,
    });

    // 记录到行为栈
    this.addBehaviorRecord({
      type: 'route',
      path: window.location.pathname,
      data: {
        action: 'page_view',
        referrer: referrerInfo.type,
      },
    });
  }

  /**
   * 监听点击事件
   */
  private listenClick(): void {
    this.clickHandler = throttle((event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // 过滤掉一些不需要监控的元素
      const tagName = target.tagName.toLowerCase();
      const ignoreTags = ['html', 'body', 'document'];
      if (ignoreTags.includes(tagName)) return;

      // 获取元素信息
      const elementInfo = {
        tagName: target.tagName,
        id: target.id || undefined,
        className:
          target.className && typeof target.className === 'string'
            ? truncate(target.className, 100)
            : undefined,
        text: target.innerText ? truncate(target.innerText, 50) : undefined,
        xpath: getXPath(target),
      };

      // 记录到行为栈
      this.addBehaviorRecord({
        type: 'click',
        path: window.location.pathname,
        data: {
          ...elementInfo,
          x: event.clientX,
          y: event.clientY,
        },
      });

      // 采样率判断后上报
      if (Math.random() > this.monitor!.options.sampleRate) {
        return;
      }

      // 获取元素位置信息
      const rect = target.getBoundingClientRect();

      this.monitor!.report(
        {
          type: ReportType.CLICK,
          tagName: target.tagName,
          elementId: target.id || undefined,
          className: elementInfo.className,
          innerText: elementInfo.text,
          x: event.clientX,
          y: event.clientY,
          xpath: elementInfo.xpath,
          elementRect: {
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        },
        'low'
      );
    }, 300);

    document.addEventListener('click', this.clickHandler, true);
  }

  /**
   * 监听输入事件（用于行为栈记录，不上报具体内容）
   */
  private listenInput(): void {
    this.inputHandler = throttle((event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target) return;

      const tagName = target.tagName.toLowerCase();
      if (!['input', 'textarea', 'select'].includes(tagName)) return;

      // 只记录到行为栈，不上报具体输入内容（隐私保护）
      this.addBehaviorRecord({
        type: 'input',
        path: window.location.pathname,
        data: {
          tagName: target.tagName,
          type: (target as HTMLInputElement).type || 'text',
          name: target.name || undefined,
          id: target.id || undefined,
        },
      });
    }, 1000);

    document.addEventListener('input', this.inputHandler, true);
  }

  /**
   * 监听滚动事件
   */
  private listenScroll(): void {
    this.scrollHandler = throttle(() => {
      const currentDepth = getScrollDepth();

      // 更新最大滚动深度
      if (currentDepth > this.maxScrollDepth) {
        this.maxScrollDepth = currentDepth;
      }

      // 每25%记录一次到行为栈
      const depthMilestones = [25, 50, 75, 100];
      const milestone = depthMilestones.find(
        (m) => currentDepth >= m && this.maxScrollDepth < m
      );

      if (milestone) {
        this.addBehaviorRecord({
          type: 'scroll',
          path: window.location.pathname,
          data: {
            depth: milestone,
          },
        });
      }
    }, 500);

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  /**
   * 监听路由变化
   */
  private listenRouteChange(): void {
    this.originalPushState = history.pushState;
    this.originalReplaceState = history.replaceState;

    // 重写pushState
    history.pushState = (...args) => {
      this.routeChangeStartTime = Date.now();
      const result = this.originalPushState!.apply(history, args);
      this.handleRouteChange();
      return result;
    };

    // 重写replaceState
    history.replaceState = (...args) => {
      this.routeChangeStartTime = Date.now();
      const result = this.originalReplaceState!.apply(history, args);
      this.handleRouteChange();
      return result;
    };

    // 监听popstate事件
    this.historyHandler = () => {
      this.routeChangeStartTime = Date.now();
      this.handleRouteChange();
    };
    window.addEventListener('popstate', this.historyHandler);

    // 监听hashchange事件
    this.hashChangeHandler = () => {
      this.routeChangeStartTime = Date.now();
      this.handleRouteChange();
    };
    window.addEventListener('hashchange', this.hashChangeHandler);
  }

  /**
   * 处理路由变化
   */
  private handleRouteChange(): void {
    const newPath = window.location.pathname;

    if (newPath === this.currentPath) {
      return;
    }

    const from = this.currentPath;
    const to = newPath;
    const duration = this.routeChangeStartTime
      ? Date.now() - this.routeChangeStartTime
      : undefined;

    // 上报页面离开
    this.reportPageLeave(from);

    // 重置页面统计
    this.currentPath = newPath;
    this.pageEnterTime = Date.now();
    this.maxScrollDepth = 0;
    this.interactionCount = 0;
    this.hasInteraction = false;

    // 记录路由变化到行为栈
    this.addBehaviorRecord({
      type: 'route',
      path: to,
      data: {
        action: 'route_change',
        from,
        to,
        duration,
      },
    });

    // 采样率判断
    if (Math.random() <= this.monitor!.options.sampleRate) {
      this.monitor!.report({
        type: ReportType.ROUTE_CHANGE,
        from,
        to,
        duration,
      });
    }

    // 上报新页面访问
    this.reportPageView();
  }

  /**
   * 监听页面离开
   */
  private listenPageLeave(): void {
    const handlePageLeave = () => {
      this.reportPageLeave(this.currentPath);
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handlePageLeave();
      }
    });

    window.addEventListener('beforeunload', handlePageLeave);
    window.addEventListener('pagehide', handlePageLeave);
  }

  /**
   * 上报页面离开
   */
  private reportPageLeave(path: string): void {
    const stayTime = Date.now() - this.pageEnterTime;

    // 停留时间小于1秒不上报
    if (stayTime < 1000) {
      return;
    }

    // 采样率判断
    if (Math.random() > this.monitor!.options.sampleRate) {
      return;
    }

    this.monitor!.report(
      {
        type: ReportType.PAGE_LEAVE,
        path,
        stayTime,
        scrollDepth: this.maxScrollDepth,
        hasInteraction: this.hasInteraction,
        interactionCount: this.interactionCount,
      },
      'high'
    );
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler, true);
      this.clickHandler = null;
    }

    if (this.inputHandler) {
      document.removeEventListener('input', this.inputHandler, true);
      this.inputHandler = null;
    }

    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }

    if (this.originalPushState) {
      history.pushState = this.originalPushState;
    }
    if (this.originalReplaceState) {
      history.replaceState = this.originalReplaceState;
    }

    if (this.historyHandler) {
      window.removeEventListener('popstate', this.historyHandler);
      this.historyHandler = null;
    }
    if (this.hashChangeHandler) {
      window.removeEventListener('hashchange', this.hashChangeHandler);
      this.hashChangeHandler = null;
    }

    this.monitor = null;
  }
}

/**
 * 创建用户行为监控插件
 */
export function createBehaviorPlugin(): MonitorPlugin {
  return new BehaviorPlugin();
}
