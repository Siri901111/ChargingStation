/**
 * HTTP SDK 工具函数
 * @description 提供请求库所需的工具函数
 */

import type { HttpError, RequestMetrics, InternalRequestConfig } from './types'
import { HttpErrorCode } from './types'
import { NONCE_LENGTH } from './constants'

/**
 * 生成唯一请求 ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 生成追踪 ID（用于分布式追踪）
 */
export function generateTraceId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}-${random}`
}

/**
 * 生成幂等键
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now().toString(36)
  const random = crypto.getRandomValues(new Uint8Array(8))
  const randomStr = Array.from(random, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `idem_${timestamp}_${randomStr}`
}

/**
 * 生成 Nonce（用于请求签名）
 */
export function generateNonce(length: number = NONCE_LENGTH): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(array, (byte) => chars[byte % chars.length]).join('')
}

/**
 * 生成缓存键
 */
export function generateCacheKey(config: InternalRequestConfig): string {
  const { url, method, params, data } = config
  const paramsStr = params ? JSON.stringify(sortObject(params)) : ''
  const dataStr = data ? JSON.stringify(sortObject(data)) : ''
  return `${method}:${url}:${paramsStr}:${dataStr}`
}

/**
 * 对象排序（用于生成一致的缓存键）
 */
export function sortObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObject)
  }
  return Object.keys(obj)
    .sort()
    .reduce((result: any, key) => {
      result[key] = sortObject(obj[key])
      return result
    }, {})
}

/**
 * 创建 HTTP 错误
 */
export function createHttpError(
  code: HttpErrorCode,
  message: string,
  options?: Partial<HttpError>
): HttpError {
  const error = new Error(message) as HttpError
  error.name = 'HttpError'
  error.code = code
  error.status = options?.status
  error.response = options?.response
  error.config = options?.config
  error.isCancelled = code === HttpErrorCode.CANCELLED
  error.details = options?.details
  error.traceId = options?.traceId
  error.retryable = isRetryableError(code)
  return error
}

/**
 * 判断错误是否可重试
 */
export function isRetryableError(code: HttpErrorCode): boolean {
  const retryableCodes = [
    HttpErrorCode.NETWORK_ERROR,
    HttpErrorCode.TIMEOUT,
    HttpErrorCode.SERVER_ERROR,
    HttpErrorCode.RATE_LIMITED
  ]
  return retryableCodes.includes(code)
}

/**
 * 判断是否为取消错误
 */
export function isCancel(error: any): boolean {
  return error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED'
}

/**
 * 判断是否为网络错误
 */
export function isNetworkError(error: any): boolean {
  return !error.response && error.code !== 'ERR_CANCELED'
}

/**
 * 判断是否为超时错误
 */
export function isTimeoutError(error: any): boolean {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout')
}

/**
 * 判断是否离线
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

/**
 * 获取错误消息
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error
  }
  if (error?.message) {
    return error.message
  }
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  return '未知错误'
}

/**
 * 格式化请求耗时
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * 计算请求大小（估算）
 */
export function calculateRequestSize(config: InternalRequestConfig): number {
  let size = 0
  // URL 大小
  size += (config.url || '').length
  // Headers 大小
  if (config.headers) {
    size += JSON.stringify(config.headers).length
  }
  // Body 大小
  if (config.data) {
    if (typeof config.data === 'string') {
      size += config.data.length
    } else if (config.data instanceof FormData) {
      // FormData 大小估算
      config.data.forEach((value) => {
        if (typeof value === 'string') {
          size += value.length
        } else if (value instanceof Blob) {
          size += value.size
        }
      })
    } else {
      size += JSON.stringify(config.data).length
    }
  }
  return size
}

/**
 * 计算响应大小（估算）
 */
export function calculateResponseSize(data: any): number {
  if (!data) return 0
  if (typeof data === 'string') {
    return data.length
  }
  return JSON.stringify(data).length
}

/**
 * 创建请求监控数据
 */
export function createRequestMetrics(
  config: InternalRequestConfig,
  response?: any,
  error?: any
): RequestMetrics {
  const startTime = config._startTime || Date.now()
  const duration = Date.now() - startTime

  return {
    url: config.url,
    method: config.method,
    status: response?.status || error?.response?.status,
    duration,
    requestSize: calculateRequestSize(config),
    responseSize: response ? calculateResponseSize(response.data) : 0,
    success: !error,
    error: error ? getErrorMessage(error) : undefined,
    timestamp: Date.now(),
    retryCount: config._retryCount || 0,
    cacheHit: false,
    fromOfflineQueue: config._fromOfflineQueue || false
  }
}

/**
 * 日志打印
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(`[HTTP SDK] ${message}`, ...args)
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn(`[HTTP SDK] ${message}`, ...args)
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[HTTP SDK] ${message}`, ...args)
  },
  debug: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.debug(`[HTTP SDK] ${message}`, ...args)
    }
  },
  request: (config: InternalRequestConfig) => {
    if (import.meta.env.DEV) {
      console.groupCollapsed(
        `%c[HTTP SDK] → ${config.method} ${config.url}`,
        'color: #1890ff; font-weight: bold'
      )
      console.log('Config:', config)
      if (config.idempotencyKey) {
        console.log('Idempotency Key:', config.idempotencyKey)
      }
      console.groupEnd()
    }
  },
  response: (config: InternalRequestConfig, response: any, duration: number) => {
    if (import.meta.env.DEV) {
      console.groupCollapsed(
        `%c[HTTP SDK] ← ${config.method} ${config.url} - ${formatDuration(duration)}`,
        'color: #52c41a; font-weight: bold'
      )
      console.log('Response:', response)
      console.groupEnd()
    }
  },
  responseError: (config: InternalRequestConfig, error: any, duration: number) => {
    console.groupCollapsed(
      `%c[HTTP SDK] ✗ ${config.method} ${config.url} - ${formatDuration(duration)} - Error`,
      'color: #ff4d4f; font-weight: bold'
    )
    console.log('Error:', error)
    console.groupEnd()
  }
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key] as object, source[key] as object)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 判断是否为对象
 */
export function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 序列化参数为 URL 查询字符串
 */
export function serializeParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)))
      } else if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })
  return searchParams.toString()
}

/**
 * 判断 URL 是否在白名单中（支持通配符）
 */
export function isInWhiteList(url: string, whiteList: string[]): boolean {
  return whiteList.some((pattern) => {
    // 支持通配符 *
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
      return regex.test(url)
    }
    return url === pattern || url.startsWith(pattern + '/')
  })
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= wait) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 重试执行函数
 */
export async function retryExecute<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number
    delay: number
    backoff?: number
    onRetry?: (error: Error, retryCount: number) => void
  }
): Promise<T> {
  const { maxRetries, delay: initialDelay, backoff = 2, onRetry } = options
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries) {
        const waitTime = initialDelay * Math.pow(backoff, i)
        onRetry?.(lastError, i + 1)
        await delay(waitTime)
      }
    }
  }

  throw lastError!
}

/**
 * 获取平台信息
 */
export function getPlatformInfo(): string {
  if (typeof window === 'undefined') return 'node'
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('electron')) return 'electron'
  if (ua.includes('mobile')) return 'mobile'
  return 'web'
}

/**
 * 获取客户端版本
 */
export function getClientVersion(): string {
  return import.meta.env.VITE_APP_VERSION || '1.0.0'
}

/**
 * 安全的 JSON 解析
 */
export function safeJSONParse<T>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return defaultValue
  }
}

/**
 * 安全的 JSON 序列化
 */
export function safeJSONStringify(obj: any): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return ''
  }
}
