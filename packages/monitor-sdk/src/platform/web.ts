/**
 * Web 平台适配器
 */
import type { PlatformAdapter, StorageAdapter, RequestOptions, RequestResponse, PageInfo } from './types';

/**
 * Web LocalStorage 适配器
 */
class WebLocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Web SessionStorage 适配器
 */
class WebSessionStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): boolean {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key: string): boolean {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  clear(): boolean {
    try {
      sessionStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Web 平台适配器实现
 */
export class WebPlatformAdapter implements PlatformAdapter {
  platform: 'web' = 'web';

  storage = {
    local: new WebLocalStorageAdapter(),
    session: new WebSessionStorageAdapter(),
  };

  private errorHandler: ((message: string, source?: string, lineno?: number, colno?: number, error?: Error) => void) | null = null;
  private originalOnError: OnErrorEventHandler | null = null;

  private unhandledRejectionHandler: ((reason: any, promise: Promise<any>) => void) | null = null;
  private originalOnUnhandledRejection: ((ev: PromiseRejectionEvent) => any) | null = null;

  private pageHideHandlers: Array<() => void> = [];
  private visibilityChangeHandlers: Array<(hidden: boolean) => void> = [];

  /**
   * 网络请求
   */
  async request(options: RequestOptions): Promise<RequestResponse> {
    try {
      const response = await fetch(options.url, {
        method: options.method || 'POST',
        headers: options.headers || {},
        body: options.data ? JSON.stringify(options.data) : undefined,
        keepalive: true,
      });

      const data = await response.json().catch(() => null);

      return {
        success: response.ok,
        status: response.status,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || String(error),
      };
    }
  }

  /**
   * SendBeacon API
   */
  sendBeacon(url: string, data: string | Blob): boolean {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      if (typeof data === 'string') {
        const blob = new Blob([data], { type: 'application/json' });
        return navigator.sendBeacon(url, blob);
      }
      return navigator.sendBeacon(url, data);
    }
    return false;
  }

  /**
   * 获取页面信息
   */
  getPageInfo(): PageInfo {
    if (typeof window === 'undefined') {
      return { url: '', title: '', path: '' };
    }

    return {
      url: window.location.href,
      title: document.title || '',
      path: window.location.pathname,
    };
  }

  /**
   * 获取全局对象
   */
  getGlobal(): any {
    return typeof window !== 'undefined' ? window : globalThis;
  }

  /**
   * 监听全局错误
   */
  onError(handler: (message: string, source?: string, lineno?: number, colno?: number, error?: Error) => void): () => void {
    this.errorHandler = handler;
    this.originalOnError = window.onerror;

    window.onerror = (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ): boolean => {
      if (this.errorHandler) {
        this.errorHandler(
          typeof message === 'string' ? message : message.type,
          source,
          lineno,
          colno,
          error
        );
      }

      if (this.originalOnError) {
        return this.originalOnError.call(window, message, source, lineno, colno, error);
      }

      return false;
    };

    return () => {
      window.onerror = this.originalOnError;
      this.errorHandler = null;
      this.originalOnError = null;
    };
  }

  /**
   * 监听未捕获的 Promise 错误
   */
  onUnhandledRejection(handler: (reason: any, promise: Promise<any>) => void): () => void {
    this.unhandledRejectionHandler = handler;
    this.originalOnUnhandledRejection = window.onunhandledrejection;

    window.onunhandledrejection = (event: PromiseRejectionEvent): void => {
      if (this.unhandledRejectionHandler) {
        this.unhandledRejectionHandler(event.reason, event.promise);
      }

      if (this.originalOnUnhandledRejection) {
        this.originalOnUnhandledRejection.call(window, event);
      }
    };

    return () => {
      window.onunhandledrejection = this.originalOnUnhandledRejection;
      this.unhandledRejectionHandler = null;
      this.originalOnUnhandledRejection = null;
    };
  }

  /**
   * 监听页面隐藏
   */
  onPageHide(handler: () => void): () => void {
    this.pageHideHandlers.push(handler);

    const wrappedHandler = () => handler();
    window.addEventListener('pagehide', wrappedHandler);
    window.addEventListener('beforeunload', wrappedHandler);

    return () => {
      this.pageHideHandlers = this.pageHideHandlers.filter((h) => h !== handler);
      window.removeEventListener('pagehide', wrappedHandler);
      window.removeEventListener('beforeunload', wrappedHandler);
    };
  }

  /**
   * 监听页面可见性变化
   */
  onVisibilityChange(handler: (hidden: boolean) => void): () => void {
    this.visibilityChangeHandlers.push(handler);

    const wrappedHandler = () => {
      handler(document.visibilityState === 'hidden');
    };
    document.addEventListener('visibilitychange', wrappedHandler);

    return () => {
      this.visibilityChangeHandlers = this.visibilityChangeHandlers.filter((h) => h !== handler);
      document.removeEventListener('visibilitychange', wrappedHandler);
    };
  }

  /**
   * 添加事件监听
   */
  addEventListener(event: string, handler: EventListener): () => void {
    if (typeof window === 'undefined') {
      return () => {};
    }

    window.addEventListener(event, handler);
    return () => {
      window.removeEventListener(event, handler);
    };
  }

  /**
   * 定时器
   */
  setTimeout(callback: () => void, delay: number): number {
    return window.setTimeout(callback, delay);
  }

  clearTimeout(timerId: number): void {
    window.clearTimeout(timerId);
  }

  setInterval(callback: () => void, delay: number): number {
    return window.setInterval(callback, delay);
  }

  clearInterval(timerId: number): void {
    window.clearInterval(timerId);
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || 'unknown';

    return {
      platform,
      system: this.getOS(ua),
      version: '',
      brand: '',
      model: '',
    };
  }

  /**
   * 解析操作系统
   */
  private getOS(ua: string): string {
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac/i.test(ua)) return 'MacOS';
    if (/Linux/i.test(ua)) return 'Linux';
    if (/Android/i.test(ua)) return 'Android';
    if (/iOS|iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    return 'Unknown';
  }

  /**
   * 获取网络信息
   */
  getNetworkInfo(): import('./types').PlatformNetworkInfo {
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
    };
  }

  /**
   * 获取屏幕信息
   */
  getScreenInfo() {
    if (typeof screen === 'undefined') {
      return {
        width: 0,
        height: 0,
        pixelRatio: 1,
      };
    }

    return {
      width: screen.width,
      height: screen.height,
      pixelRatio: window.devicePixelRatio || 1,
    };
  }

  /**
   * 获取系统信息
   */
  getSystemInfo(): Record<string, any> {
    if (typeof window === 'undefined') {
      return {};
    }

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
    };
  }

  /**
   * 检查平台是否可用
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
}

/**
 * 创建 Web 平台适配器实例
 */
export function createWebPlatformAdapter(): PlatformAdapter {
  return new WebPlatformAdapter();
}
