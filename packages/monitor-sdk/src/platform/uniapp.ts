/**
 * UniApp 平台适配器
 */
import type { PlatformAdapter, StorageAdapter, RequestOptions, RequestResponse, PageInfo } from './types';

// UniApp 全局对象类型声明
declare const uni: any;
declare const getCurrentPages: () => any[];
declare function getApp(): any;

/**
 * UniApp LocalStorage 适配器（使用 uni.setStorageSync）
 */
class UniAppLocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      if (typeof uni !== 'undefined' && uni.getStorageSync) {
        return uni.getStorageSync(key) || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): boolean {
    try {
      if (typeof uni !== 'undefined' && uni.setStorageSync) {
        uni.setStorageSync(key, value);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  removeItem(key: string): boolean {
    try {
      if (typeof uni !== 'undefined' && uni.removeStorageSync) {
        uni.removeStorageSync(key);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  clear(): boolean {
    try {
      if (typeof uni !== 'undefined' && uni.clearStorageSync) {
        uni.clearStorageSync();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

/**
 * UniApp SessionStorage 适配器（使用内存存储）
 */
class UniAppSessionStorageAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): boolean {
    try {
      this.storage.set(key, value);
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key: string): boolean {
    try {
      this.storage.delete(key);
      return true;
    } catch {
      return false;
    }
  }

  clear(): boolean {
    try {
      this.storage.clear();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * UniApp 平台适配器实现
 */
export class UniAppPlatformAdapter implements PlatformAdapter {
  platform: 'uniapp' = 'uniapp';

  storage = {
    local: new UniAppLocalStorageAdapter(),
    session: new UniAppSessionStorageAdapter(),
  };

  private errorHandler: ((message: string, source?: string, lineno?: number, colno?: number, error?: Error) => void) | null = null;
  private unhandledRejectionHandler: ((reason: any, promise: Promise<any>) => void) | null = null;
  private routeChangeHandlers: Array<(from: string, to: string) => void> = [];
  private currentRoute: string = '';

  /**
   * 网络请求（使用 uni.request）
   */
  async request(options: RequestOptions): Promise<RequestResponse> {
    return new Promise((resolve) => {
      if (typeof uni === 'undefined' || !uni.request) {
        resolve({
          success: false,
          error: 'uni.request is not available',
        });
        return;
      }

      uni.request({
        url: options.url,
        method: options.method || 'POST',
        header: options.headers || {},
        data: options.data,
        timeout: options.timeout || 60000,
        success: (res: any) => {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: res.data,
          });
        },
        fail: (err: any) => {
          resolve({
            success: false,
            error: err.errMsg || String(err),
          });
        },
      });
    });
  }

  /**
   * SendBeacon（UniApp 不支持，返回 false）
   */
  sendBeacon(_url: string, _data: string | Blob): boolean {
    // UniApp 不支持 sendBeacon，返回 false 让上报器使用 request
    return false;
  }

  /**
   * 获取页面信息
   */
  getPageInfo(): PageInfo {
    try {
      if (typeof getCurrentPages !== 'undefined') {
        const pages = getCurrentPages();
        if (pages.length > 0) {
          const currentPage = pages[pages.length - 1];
          const route = currentPage.route || '';
          const options = currentPage.options || {};
          
          // 构建路径
          let path = '/' + route;
          const query = Object.keys(options)
            .map((key) => `${key}=${options[key]}`)
            .join('&');
          if (query) {
            path += '?' + query;
          }

          return {
            url: path,
            title: currentPage.$page?.meta?.navigationBarTitleText || '',
            path,
          };
        }
      }

      // 降级方案：尝试从 uni 获取
      if (typeof uni !== 'undefined') {
        // 获取系统信息（虽然这里不使用，但保持 API 调用的一致性）
        uni.getSystemInfoSync();
        return {
          url: '',
          title: '',
          path: '',
        };
      }
    } catch (error) {
      // 忽略错误
    }

    return {
      url: '',
      title: '',
      path: '',
    };
  }

  /**
   * 获取全局对象
   */
  getGlobal(): any {
    if (typeof uni !== 'undefined') {
      return uni;
    }
    if (typeof global !== 'undefined') {
      return global;
    }
    return {};
  }

  /**
   * 监听全局错误（使用 uni.onError）
   */
  onError(handler: (message: string, source?: string, lineno?: number, colno?: number, error?: Error) => void): () => void {
    if (typeof uni === 'undefined' || !uni.onError) {
      return () => {};
    }

    this.errorHandler = handler;

    uni.onError((error: string) => {
      if (this.errorHandler) {
        this.errorHandler(error, undefined, undefined, undefined, new Error(error));
      }
    });

    // 小程序环境也可以监听 App 的 onError
    if (typeof getApp !== 'undefined') {
      try {
        const app = getApp();
        if (app && app.onError) {
          const originalOnError = app.onError;
          app.onError = (error: string) => {
            if (this.errorHandler) {
              this.errorHandler(error);
            }
            if (originalOnError) {
              originalOnError.call(app, error);
            }
          };
        }
      } catch {
        // 忽略
      }
    }

    return () => {
      this.errorHandler = null;
    };
  }

  /**
   * 监听未捕获的 Promise 错误
   */
  onUnhandledRejection(handler: (reason: any, promise: Promise<any>) => void): () => void {
    this.unhandledRejectionHandler = handler;

    // 使用全局 Promise 错误处理
    if (typeof window !== 'undefined') {
      window.onunhandledrejection = (event: PromiseRejectionEvent) => {
        if (this.unhandledRejectionHandler) {
          this.unhandledRejectionHandler(event.reason, event.promise);
        }
      };
    }

    return () => {
      this.unhandledRejectionHandler = null;
      if (typeof window !== 'undefined') {
        window.onunhandledrejection = null;
      }
    };
  }

  /**
   * 监听页面隐藏（使用 uni.onHide）
   */
  onPageHide(handler: () => void): () => void {
    if (typeof uni === 'undefined' || !uni.onHide) {
      // 降级到 visibilitychange
      if (typeof document !== 'undefined') {
        const wrappedHandler = () => {
          if (document.visibilityState === 'hidden') {
            handler();
          }
        };
        document.addEventListener('visibilitychange', wrappedHandler);
        return () => {
          document.removeEventListener('visibilitychange', wrappedHandler);
        };
      }
      return () => {};
    }

    uni.onHide(() => {
      handler();
    });

    return () => {
      // UniApp 没有提供移除监听的方法
    };
  }

  /**
   * 监听页面可见性变化
   */
  onVisibilityChange(handler: (hidden: boolean) => void): () => void {
    if (typeof document !== 'undefined') {
      const wrappedHandler = () => {
        handler(document.visibilityState === 'hidden');
      };
      document.addEventListener('visibilitychange', wrappedHandler);
      return () => {
        document.removeEventListener('visibilitychange', wrappedHandler);
      };
    }

    // 降级：使用 onPageHide
    return this.onPageHide(() => handler(true));
  }

  /**
   * 添加事件监听（部分支持）
   */
  addEventListener(event: string, handler: EventListener): () => void {
    if (typeof window !== 'undefined') {
      window.addEventListener(event, handler);
      return () => {
        window.removeEventListener(event, handler);
      };
    }
    return () => {};
  }

  /**
   * 定时器
   */
  setTimeout(callback: () => void, delay: number): number {
    if (typeof setTimeout !== 'undefined') {
      return setTimeout(callback, delay) as any as number;
    }
    return 0;
  }

  clearTimeout(timerId: number): void {
    if (typeof clearTimeout !== 'undefined') {
      clearTimeout(timerId as any);
    }
  }

  setInterval(callback: () => void, delay: number): number {
    if (typeof setInterval !== 'undefined') {
      return setInterval(callback, delay) as any as number;
    }
    return 0;
  }

  clearInterval(timerId: number): void {
    if (typeof clearInterval !== 'undefined') {
      clearInterval(timerId);
    }
  }

  /**
   * 获取设备信息（使用 uni.getSystemInfoSync）
   */
  getDeviceInfo() {
    try {
      if (typeof uni !== 'undefined' && uni.getSystemInfoSync) {
        const systemInfo = uni.getSystemInfoSync();
        return {
          platform: systemInfo.platform || 'unknown',
          system: systemInfo.system || 'unknown',
          version: systemInfo.version || '',
          brand: systemInfo.brand || '',
          model: systemInfo.model || '',
        };
      }
    } catch {
      // 忽略错误
    }

    return {
      platform: 'unknown',
      system: 'unknown',
      version: '',
      brand: '',
      model: '',
    };
  }

  /**
   * 获取网络信息（使用 uni.getNetworkType）
   */
  getNetworkInfo(): import('./types').PlatformNetworkInfo {
    try {
      if (typeof uni !== 'undefined' && uni.getSystemInfoSync) {
        const systemInfo = uni.getSystemInfoSync();
        return {
          type: systemInfo.networkType || 'unknown',
        };
      }
    } catch {
      // 忽略错误
    }

    return {
      type: 'unknown',
    };
  }

  /**
   * 获取屏幕信息（使用 uni.getSystemInfoSync）
   */
  getScreenInfo() {
    try {
      if (typeof uni !== 'undefined' && uni.getSystemInfoSync) {
        const systemInfo = uni.getSystemInfoSync();
        return {
          width: systemInfo.windowWidth || systemInfo.screenWidth || 0,
          height: systemInfo.windowHeight || systemInfo.screenHeight || 0,
          pixelRatio: systemInfo.pixelRatio || 1,
        };
      }
    } catch {
      // 忽略错误
    }

    return {
      width: 0,
      height: 0,
      pixelRatio: 1,
    };
  }

  /**
   * 获取当前路由
   */
  getCurrentRoute() {
    try {
      if (typeof getCurrentPages !== 'undefined') {
        const pages = getCurrentPages();
        if (pages.length > 0) {
          const currentPage = pages[pages.length - 1];
          return {
            path: '/' + (currentPage.route || ''),
            params: currentPage.options || {},
          };
        }
      }
    } catch {
      // 忽略错误
    }

    return {
      path: '',
      params: {},
    };
  }

  /**
   * 监听路由变化
   */
  onRouteChange(handler: (from: string, to: string) => void): () => void {
    this.routeChangeHandlers.push(handler);

    const currentRoute = this.getCurrentRoute().path;
    this.currentRoute = currentRoute;

    // 定期检查路由变化（因为 UniApp 没有全局路由监听）
    const checkRoute = () => {
      const newRoute = this.getCurrentRoute().path;
      if (newRoute !== this.currentRoute) {
        this.routeChangeHandlers.forEach((h) => {
          h(this.currentRoute, newRoute);
        });
        this.currentRoute = newRoute;
      }
    };

    const timer = this.setInterval(checkRoute, 500);

    return () => {
      this.clearInterval(timer);
      this.routeChangeHandlers = this.routeChangeHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * 获取系统信息
   */
  getSystemInfo(): Record<string, any> {
    try {
      if (typeof uni !== 'undefined' && uni.getSystemInfoSync) {
        return uni.getSystemInfoSync();
      }
    } catch {
      // 忽略错误
    }

    return {};
  }

  /**
   * 检查平台是否可用
   */
  isAvailable(): boolean {
    return typeof uni !== 'undefined';
  }
}

/**
 * 创建 UniApp 平台适配器实例
 */
export function createUniAppPlatformAdapter(): PlatformAdapter {
  return new UniAppPlatformAdapter();
}
