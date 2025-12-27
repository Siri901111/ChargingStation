declare module 'monitor-sdk' {
  import type { App } from 'vue';

  export interface MonitorOptions {
    appId: string;
    reportUrl: string;
    userId?: string;
    enableError?: boolean;
    enablePerformance?: boolean;
    enableBehavior?: boolean;
    enableNetwork?: boolean;
    sampleRate?: number;
    maxCache?: number;
    reportInterval?: number;
    debug?: boolean;
    enableLongTask?: boolean;
    longTaskThreshold?: number;
  }

  export interface MonitorPlugin {
    name: string;
    setup(monitor: Monitor): void;
    destroy?(): void;
  }

  export interface Monitor {
    use(plugin: MonitorPlugin): void;
    setUserId(userId: string): void;
    setExtra(extra: Record<string, any>): void;
    trackEvent(eventName: string, eventData?: Record<string, any>): void;
    destroy(): void;
  }

  export function createMonitor(options: MonitorOptions): Monitor;
  export function createVuePlugin(app: App): MonitorPlugin;
  export function createErrorPlugin(): MonitorPlugin;
  export function createPerformancePlugin(): MonitorPlugin;
  export function createBehaviorPlugin(): MonitorPlugin;
  export function createNetworkPlugin(): MonitorPlugin;
}
