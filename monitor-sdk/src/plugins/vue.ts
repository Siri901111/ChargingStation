/**
 * Vue框架专用监控插件
 */
import type { MonitorPlugin, MonitorCore } from '../types';
import { ReportType } from '../types';
import { getErrorMessage, getErrorStack, truncate, log } from '../utils';
import type { App, ComponentPublicInstance } from 'vue';

export class VuePlugin implements MonitorPlugin {
  name = 'vue';
  private monitor: MonitorCore | null = null;
  private app: App | null = null;

  constructor(app?: App) {
    this.app = app || null;
  }

  init(monitor: MonitorCore): void {
    this.monitor = monitor;

    if (this.app) {
      this.setupErrorHandler(this.app);
    }

    log(monitor.options.debug, 'Vue监控插件已初始化');
  }

  /**
   * 设置Vue应用实例
   */
  setApp(app: App): void {
    this.app = app;
    if (this.monitor) {
      this.setupErrorHandler(app);
    }
  }

  /**
   * 设置Vue错误处理器
   */
  private setupErrorHandler(app: App): void {
    const originalHandler = app.config.errorHandler;

    app.config.errorHandler = (
      err: unknown,
      instance: ComponentPublicInstance | null,
      info: string
    ) => {
      // 采样率判断
      if (Math.random() <= this.monitor!.options.sampleRate) {
        const componentName = instance?.$options?.name || instance?.$options?.__name || 'Anonymous';

        this.monitor!.report({
          type: ReportType.VUE_ERROR,
          message: truncate(getErrorMessage(err), 500),
          stack: getErrorStack(err) ? truncate(getErrorStack(err)!, 1000) : undefined,
          componentName,
          info: truncate(info, 100),
        });
      }

      // 调用原有的错误处理函数
      if (originalHandler) {
        originalHandler(err, instance, info);
      } else {
        // 默认行为：在控制台输出错误
        console.error('[Vue Error]', err);
      }
    };

    // 设置Vue警告处理器（开发模式下）
    const originalWarnHandler = app.config.warnHandler;
    app.config.warnHandler = (
      msg: string,
      instance: ComponentPublicInstance | null,
      trace: string
    ) => {
      // 仅在debug模式下记录警告
      if (this.monitor!.options.debug) {
        log(true, 'Vue Warning:', msg, trace);
      }

      if (originalWarnHandler) {
        originalWarnHandler(msg, instance, trace);
      }
    };
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    // Vue的错误处理器无法恢复，只能置空
    this.monitor = null;
    this.app = null;
  }
}

/**
 * 创建Vue监控插件
 */
export function createVuePlugin(app?: App): VuePlugin {
  return new VuePlugin(app);
}
