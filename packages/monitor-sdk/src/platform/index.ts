/**
 * 平台适配器模块
 */
import type { Platform, PlatformAdapter } from './types';
import { createWebPlatformAdapter } from './web';
import { createUniAppPlatformAdapter } from './uniapp';

/**
 * 检查是否是 UniApp 环境
 * 使用函数来避免直接引用全局变量，解决 DTS 构建问题
 */
function isUniAppEnvironment(): boolean {
  try {
    // 使用 eval 来动态检查，避免 TypeScript 类型检查
    return typeof (globalThis as any).uni !== 'undefined';
  } catch {
    return false;
  }
}

// 自动检测平台
function detectPlatform(): Platform {
  // 检查是否是 UniApp 环境
  if (isUniAppEnvironment()) {
    return 'uniapp';
  }

  // 检查是否是 Web 环境
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'web';
  }

  // 默认返回 web
  return 'web';
}

/**
 * 创建平台适配器
 * @param platform 平台类型，如果不提供则自动检测
 */
export function createPlatformAdapter(platform?: Platform): PlatformAdapter {
  const targetPlatform = platform || detectPlatform();

  switch (targetPlatform) {
    case 'uniapp':
      return createUniAppPlatformAdapter();
    case 'web':
    default:
      return createWebPlatformAdapter();
  }
}

// 导出类型和适配器
export type { Platform, PlatformAdapter, StorageAdapter, RequestOptions, RequestResponse } from './types';
export { createWebPlatformAdapter } from './web';
export { createUniAppPlatformAdapter } from './uniapp';
