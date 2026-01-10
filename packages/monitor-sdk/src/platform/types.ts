/**
 * 平台适配器类型定义
 */

// 平台类型
export type Platform = 'web' | 'uniapp' | 'mini-program';

// 存储接口
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): boolean;
  removeItem(key: string): boolean;
  clear(): boolean;
}

// 网络请求选项
export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

// 网络请求响应
export interface RequestResponse {
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
}

// 事件监听器
export type EventListener = (event: any) => void;

// 页面信息
export interface PageInfo {
  url: string;
  title: string;
  path: string;
}

// 设备信息（简化版，用于平台适配）
export interface PlatformDeviceInfo {
  platform: string;
  system: string;
  version: string;
  brand?: string;
  model?: string;
}

// 网络信息（简化版）
export interface PlatformNetworkInfo {
  type: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

// 平台能力接口
export interface PlatformAdapter {
  // 平台类型
  platform: Platform;

  // 存储能力
  storage: {
    local: StorageAdapter;
    session: StorageAdapter;
  };

  // 网络请求
  request(options: RequestOptions): Promise<RequestResponse>;
  sendBeacon?(url: string, data: string | Blob): boolean;

  // 页面信息
  getPageInfo(): PageInfo;
  
  // 全局对象
  getGlobal(): any;

  // 事件监听
  onError?(handler: (message: string, source?: string, lineno?: number, colno?: number, error?: Error) => void): () => void;
  onUnhandledRejection?(handler: (reason: any, promise: Promise<any>) => void): () => void;
  onPageHide?(handler: () => void): () => void;
  onVisibilityChange?(handler: (hidden: boolean) => void): () => void;
  addEventListener?(event: string, handler: EventListener): () => void;

  // 定时器
  setTimeout(callback: () => void, delay: number): number;
  clearTimeout(timerId: number): void;
  setInterval(callback: () => void, delay: number): number;
  clearInterval(timerId: number): void;

  // 设备信息
  getDeviceInfo(): PlatformDeviceInfo;
  getNetworkInfo(): PlatformNetworkInfo;
  getScreenInfo(): {
    width: number;
    height: number;
    pixelRatio: number;
  };

  // 页面路由
  getCurrentRoute?(): { path: string; params?: Record<string, any> };
  onRouteChange?(handler: (from: string, to: string) => void): () => void;

  // 其他能力
  getSystemInfo?(): Record<string, any>;
  isAvailable(): boolean;
}
