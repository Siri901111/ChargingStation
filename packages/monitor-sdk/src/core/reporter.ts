/**
 * 数据上报器 - 增强版
 * 支持优先级队列、限流、数据压缩
 */
import type { ReportData, RateLimitConfig } from '../types';
import { log, warn, error, RateLimiter } from '../utils';

interface QueueItem {
  data: ReportData;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
  retryCount: number;
}

export class Reporter {
  private reportUrl: string;
  private debug: boolean;
  private highPriorityQueue: QueueItem[] = [];
  private normalQueue: QueueItem[] = [];
  private lowPriorityQueue: QueueItem[] = [];
  private maxCache: number;
  private reportInterval: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;
  private rateLimiter: RateLimiter;
  private maxRetry = 3;

  constructor(
    reportUrl: string,
    maxCache: number = 20,
    reportInterval: number = 5000,
    debug: boolean = false,
    rateLimitConfig?: RateLimitConfig
  ) {
    this.reportUrl = reportUrl;
    this.maxCache = maxCache;
    this.reportInterval = reportInterval;
    this.debug = debug;
    this.rateLimiter = new RateLimiter(rateLimitConfig);

    this.startTimer();
    this.bindPageHideEvent();
  }

  /**
   * 添加数据到队列
   */
  add(data: ReportData, priority: 'high' | 'normal' | 'low' = 'normal'): void {
    if (this.isDestroyed) return;

    const item: QueueItem = {
      data,
      priority,
      timestamp: Date.now(),
      retryCount: 0,
    };

    // 根据优先级添加到不同队列
    switch (priority) {
      case 'high':
        this.highPriorityQueue.push(item);
        // 高优先级立即尝试发送
        this.flush();
        break;
      case 'normal':
        this.normalQueue.push(item);
        break;
      case 'low':
        this.lowPriorityQueue.push(item);
        break;
    }

    log(this.debug, `添加上报数据 [${priority}]:`, data.type);

    // 检查队列大小
    this.checkQueueSize();
  }

  /**
   * 检查并限制队列大小
   */
  private checkQueueSize(): void {
    const totalSize =
      this.highPriorityQueue.length +
      this.normalQueue.length +
      this.lowPriorityQueue.length;

    if (totalSize > this.maxCache * 3) {
      // 优先删除低优先级的旧数据
      const excessCount = totalSize - this.maxCache * 2;

      if (this.lowPriorityQueue.length >= excessCount) {
        this.lowPriorityQueue.splice(0, excessCount);
      } else {
        const remaining = excessCount - this.lowPriorityQueue.length;
        this.lowPriorityQueue = [];
        if (this.normalQueue.length >= remaining) {
          this.normalQueue.splice(0, remaining);
        }
      }

      warn(this.debug, `队列过大，已清理 ${excessCount} 条低优先级数据`);
    }
  }

  /**
   * 立即上报所有缓存数据
   */
  flush(): void {
    // 按优先级顺序处理
    this.processQueue(this.highPriorityQueue, 'high');
    this.processQueue(this.normalQueue, 'normal');
    this.processQueue(this.lowPriorityQueue, 'low');
  }

  /**
   * 处理队列
   */
  private processQueue(queue: QueueItem[], priority: 'high' | 'normal' | 'low'): void {
    if (queue.length === 0) return;

    const itemsToSend: QueueItem[] = [];

    while (queue.length > 0) {
      // 检查限流
      if (!this.rateLimiter.tryAcquire(priority)) {
        log(this.debug, `限流生效，${priority}优先级队列暂停发送`);
        break;
      }

      const item = queue.shift()!;
      itemsToSend.push(item);

      // 批量发送，每次最多20条
      if (itemsToSend.length >= 20) {
        break;
      }
    }

    if (itemsToSend.length > 0) {
      this.send(itemsToSend);
    }
  }

  /**
   * 发送数据到服务器
   */
  private send(items: QueueItem[]): void {
    if (items.length === 0) return;

    const data = items.map((item) => item.data);

    log(this.debug, `上报 ${data.length} 条数据到 ${this.reportUrl}`);

    // 优先使用 sendBeacon
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const success = navigator.sendBeacon(this.reportUrl, blob);

      if (success) {
        log(this.debug, 'sendBeacon 上报成功');
        return;
      }
      warn(this.debug, 'sendBeacon 上报失败，降级使用 fetch');
    }

    // 降级使用 fetch
    this.sendByFetch(items);
  }

  /**
   * 使用 fetch 发送数据
   */
  private sendByFetch(items: QueueItem[]): void {
    const data = items.map((item) => item.data);

    fetch(this.reportUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      keepalive: true,
    })
      .then((response) => {
        if (response.ok) {
          log(this.debug, 'fetch 上报成功');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      })
      .catch((err) => {
        error(this.debug, 'fetch 上报失败:', err);
        // 重试机制
        this.handleRetry(items);
      });
  }

  /**
   * 处理重试
   */
  private handleRetry(items: QueueItem[]): void {
    items.forEach((item) => {
      item.retryCount++;

      if (item.retryCount <= this.maxRetry) {
        // 重新加入队列
        switch (item.priority) {
          case 'high':
            this.highPriorityQueue.push(item);
            break;
          case 'normal':
            this.normalQueue.push(item);
            break;
          case 'low':
            this.lowPriorityQueue.push(item);
            break;
        }
        log(this.debug, `数据重试 (${item.retryCount}/${this.maxRetry}):`, item.data.type);
      } else {
        warn(this.debug, `数据达到最大重试次数，已丢弃:`, item.data.type);
      }
    });
  }

  /**
   * 启动定时上报
   */
  private startTimer(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.flush();
    }, this.reportInterval);
  }

  /**
   * 停止定时上报
   */
  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 绑定页面隐藏事件
   */
  private bindPageHideEvent(): void {
    const handlePageHide = () => {
      this.flushImmediate();
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handlePageHide();
      }
    });

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);
  }

  /**
   * 立即发送所有数据（不限流）
   */
  private flushImmediate(): void {
    const allItems = [
      ...this.highPriorityQueue,
      ...this.normalQueue,
      ...this.lowPriorityQueue,
    ];

    this.highPriorityQueue = [];
    this.normalQueue = [];
    this.lowPriorityQueue = [];

    if (allItems.length > 0) {
      this.send(allItems);
    }
  }

  /**
   * 获取队列状态
   */
  getStatus(): {
    high: number;
    normal: number;
    low: number;
    rateLimiter: { tokens: number; counter: number };
  } {
    return {
      high: this.highPriorityQueue.length,
      normal: this.normalQueue.length,
      low: this.lowPriorityQueue.length,
      rateLimiter: this.rateLimiter.getStatus(),
    };
  }

  /**
   * 销毁上报器
   */
  destroy(): void {
    this.isDestroyed = true;
    this.stopTimer();
    this.flushImmediate();
  }
}
