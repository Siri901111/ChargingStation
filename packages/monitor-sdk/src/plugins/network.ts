/**
 * 网络请求监控插件
 */
import type { MonitorPlugin, MonitorCore } from '../types';
import { ReportType } from '../types';
import { isSdkRequest, truncate, log } from '../utils';

export class NetworkPlugin implements MonitorPlugin {
  name = 'network';
  private monitor: MonitorCore | null = null;
  private originalXhrOpen: typeof XMLHttpRequest.prototype.open | null = null;
  private originalXhrSend: typeof XMLHttpRequest.prototype.send | null = null;
  private originalFetch: typeof fetch | null = null;

  init(monitor: MonitorCore): void {
    this.monitor = monitor;

    // 拦截XMLHttpRequest
    this.interceptXhr();
    // 拦截fetch
    this.interceptFetch();

    log(monitor.options.debug, '网络请求监控插件已初始化');
  }

  /**
   * 拦截XMLHttpRequest
   */
  private interceptXhr(): void {
    const self = this;
    this.originalXhrOpen = XMLHttpRequest.prototype.open;
    this.originalXhrSend = XMLHttpRequest.prototype.send;

    // 重写open方法
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) {
      // 保存请求信息到xhr对象上
      (this as any)._monitorData = {
        method: method.toUpperCase(),
        url: url.toString(),
        startTime: 0,
      };

      return self.originalXhrOpen!.apply(this, [
        method,
        url,
        async ?? true,
        username ?? null,
        password ?? null,
      ]);
    };

    // 重写send方法
    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
      const monitorData = (this as any)._monitorData;

      if (!monitorData) {
        return self.originalXhrSend!.apply(this, [body]);
      }

      // 过滤SDK自身的上报请求
      if (isSdkRequest(monitorData.url, self.monitor!.options.reportUrl)) {
        return self.originalXhrSend!.apply(this, [body]);
      }

      monitorData.startTime = Date.now();
      monitorData.requestData = body;

      // 监听请求完成
      this.addEventListener('loadend', function () {
        const duration = Date.now() - monitorData.startTime;
        const status = this.status;
        const success = status >= 200 && status < 300;

        // 采样率判断
        if (Math.random() > self.monitor!.options.sampleRate) {
          return;
        }

        // 上报HTTP请求数据
        self.monitor!.report({
          type: ReportType.HTTP_REQUEST,
          url: truncate(monitorData.url, 500),
          method: monitorData.method,
          status,
          success,
          duration,
          requestSize: body ? self.getSize(body) : 0,
          responseSize: self.getResponseSize(this),
        });

        // 如果请求失败，额外上报HTTP错误
        if (!success) {
          self.monitor!.report({
            type: ReportType.HTTP_ERROR,
            url: truncate(monitorData.url, 500),
            method: monitorData.method,
            status,
            statusText: this.statusText || '',
            duration,
            requestData: self.safeStringify(body),
            responseData: self.getResponseText(this),
          });
        }
      });

      return self.originalXhrSend!.apply(this, [body]);
    };
  }

  /**
   * 拦截fetch
   */
  private interceptFetch(): void {
    if (!window.fetch) return;

    const self = this;
    this.originalFetch = window.fetch;

    window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const method = init?.method?.toUpperCase() || 'GET';

      // 过滤SDK自身的上报请求
      if (isSdkRequest(url, self.monitor!.options.reportUrl)) {
        return self.originalFetch!.apply(window, [input, init]);
      }

      const startTime = Date.now();
      const requestBody = init?.body;

      return self.originalFetch!.apply(window, [input, init])
        .then((response) => {
          const duration = Date.now() - startTime;
          const status = response.status;
          const success = response.ok;

          // 采样率判断
          if (Math.random() <= self.monitor!.options.sampleRate) {
            // 上报HTTP请求数据
            self.monitor!.report({
              type: ReportType.HTTP_REQUEST,
              url: truncate(url, 500),
              method,
              status,
              success,
              duration,
              requestSize: requestBody ? self.getSize(requestBody) : 0,
            });

            // 如果请求失败，额外上报HTTP错误
            if (!success) {
              // 克隆response以读取body
              response.clone().text().then((text) => {
                self.monitor!.report({
                  type: ReportType.HTTP_ERROR,
                  url: truncate(url, 500),
                  method,
                  status,
                  statusText: response.statusText || '',
                  duration,
                  requestData: self.safeStringify(requestBody),
                  responseData: truncate(text, 500),
                });
              }).catch(() => {
                self.monitor!.report({
                  type: ReportType.HTTP_ERROR,
                  url: truncate(url, 500),
                  method,
                  status,
                  statusText: response.statusText || '',
                  duration,
                  requestData: self.safeStringify(requestBody),
                });
              });
            }
          }

          return response;
        })
        .catch((error) => {
          const duration = Date.now() - startTime;

          // 采样率判断
          if (Math.random() <= self.monitor!.options.sampleRate) {
            // 网络错误
            self.monitor!.report({
              type: ReportType.HTTP_ERROR,
              url: truncate(url, 500),
              method,
              status: 0,
              statusText: error.message || 'Network Error',
              duration,
              requestData: self.safeStringify(requestBody),
            });
          }

          throw error;
        });
    };
  }

  /**
   * 获取请求体大小
   */
  private getSize(body: any): number {
    if (!body) return 0;

    if (typeof body === 'string') {
      return new Blob([body]).size;
    }

    if (body instanceof Blob) {
      return body.size;
    }

    if (body instanceof ArrayBuffer) {
      return body.byteLength;
    }

    if (body instanceof FormData) {
      // FormData无法直接获取大小，返回0
      return 0;
    }

    try {
      return new Blob([JSON.stringify(body)]).size;
    } catch {
      return 0;
    }
  }

  /**
   * 获取XHR响应大小
   */
  private getResponseSize(xhr: XMLHttpRequest): number {
    try {
      const contentLength = xhr.getResponseHeader('Content-Length');
      if (contentLength) {
        return parseInt(contentLength, 10);
      }
      if (xhr.responseText) {
        return new Blob([xhr.responseText]).size;
      }
    } catch {
      // 忽略错误
    }
    return 0;
  }

  /**
   * 获取XHR响应文本
   */
  private getResponseText(xhr: XMLHttpRequest): string | undefined {
    try {
      if (xhr.responseType === '' || xhr.responseType === 'text') {
        return truncate(xhr.responseText, 500);
      }
    } catch {
      // 忽略错误
    }
    return undefined;
  }

  /**
   * 安全地序列化数据
   */
  private safeStringify(data: any): string | undefined {
    if (!data) return undefined;

    try {
      if (typeof data === 'string') {
        return truncate(data, 500);
      }
      return truncate(JSON.stringify(data), 500);
    } catch {
      return undefined;
    }
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    // 恢复原始的XMLHttpRequest方法
    if (this.originalXhrOpen) {
      XMLHttpRequest.prototype.open = this.originalXhrOpen;
    }
    if (this.originalXhrSend) {
      XMLHttpRequest.prototype.send = this.originalXhrSend;
    }

    // 恢复原始的fetch
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
    }

    this.monitor = null;
  }
}

/**
 * 创建网络请求监控插件
 */
export function createNetworkPlugin(): MonitorPlugin {
  return new NetworkPlugin();
}
