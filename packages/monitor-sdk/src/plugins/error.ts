/**
 * 错误监控插件
 */
import type { MonitorPlugin, MonitorCore } from '../types';
import { ReportType } from '../types';
import { getErrorMessage, getErrorStack, truncate, log } from '../utils';

export class ErrorPlugin implements MonitorPlugin {
  name = 'error';
  private monitor: MonitorCore | null = null;
  private originalOnError: OnErrorEventHandler = null;
  private originalOnUnhandledRejection: ((ev: PromiseRejectionEvent) => any) | null = null;

  init(monitor: MonitorCore): void {
    this.monitor = monitor;

    // 监听JS运行时错误
    this.listenJsError();
    // 监听Promise未捕获错误
    this.listenPromiseError();
    // 监听资源加载错误
    this.listenResourceError();

    log(monitor.options.debug, '错误监控插件已初始化');
  }

  /**
   * 监听JS运行时错误
   */
  private listenJsError(): void {
    this.originalOnError = window.onerror;

    window.onerror = (
      message: string | Event,
      filename?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ): boolean => {
      // 采样率判断
      if (Math.random() > this.monitor!.options.sampleRate) {
        return false;
      }

      this.monitor!.report({
        type: ReportType.JS_ERROR,
        message: typeof message === 'string' ? message : message.type,
        stack: getErrorStack(error),
        filename: filename || '',
        lineno: lineno || 0,
        colno: colno || 0,
      });

      // 调用原有的onerror处理函数
      if (this.originalOnError) {
        return this.originalOnError.call(window, message, filename, lineno, colno, error);
      }

      return false;
    };
  }

  /**
   * 监听Promise未捕获错误
   */
  private listenPromiseError(): void {
    this.originalOnUnhandledRejection = window.onunhandledrejection;

    window.onunhandledrejection = (event: PromiseRejectionEvent): void => {
      // 采样率判断
      if (Math.random() > this.monitor!.options.sampleRate) {
        return;
      }

      const reason = event.reason;
      const message = getErrorMessage(reason);
      const stack = getErrorStack(reason);

      this.monitor!.report({
        type: ReportType.PROMISE_ERROR,
        message: truncate(message, 500),
        stack: stack ? truncate(stack, 1000) : undefined,
        reason: truncate(String(reason), 500),
      });

      // 调用原有的处理函数
      if (this.originalOnUnhandledRejection) {
        this.originalOnUnhandledRejection.call(window, event);
      }
    };
  }

  /**
   * 监听资源加载错误
   */
  private listenResourceError(): void {
    window.addEventListener(
      'error',
      (event: ErrorEvent) => {
        const target = event.target as HTMLElement;

        // 只处理资源加载错误（script, link, img等）
        if (!target || !['SCRIPT', 'LINK', 'IMG', 'VIDEO', 'AUDIO'].includes(target.tagName)) {
          return;
        }

        // 采样率判断
        if (Math.random() > this.monitor!.options.sampleRate) {
          return;
        }

        const resourceUrl =
          (target as HTMLScriptElement).src ||
          (target as HTMLLinkElement).href ||
          (target as HTMLImageElement).src ||
          '';

        this.monitor!.report({
          type: ReportType.RESOURCE_ERROR,
          resourceType: target.tagName.toLowerCase(),
          resourceUrl: resourceUrl,
        });
      },
      true // 使用捕获阶段，因为资源错误不会冒泡
    );
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    // 恢复原有的错误处理函数
    if (this.originalOnError !== null) {
      window.onerror = this.originalOnError;
    }
    if (this.originalOnUnhandledRejection !== null) {
      window.onunhandledrejection = this.originalOnUnhandledRejection;
    }
    this.monitor = null;
  }
}

/**
 * 创建错误监控插件
 */
export function createErrorPlugin(): MonitorPlugin {
  return new ErrorPlugin();
}
