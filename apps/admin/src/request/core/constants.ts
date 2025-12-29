/**
 * HTTP SDK 常量定义
 * @description 定义请求库使用的常量，遵循大厂标准
 */

import type { HttpClientConfig, CacheConfig, IdempotencyConfig, TokenRefreshConfig } from './types'

// ==================== HTTP 状态码 ====================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const

// ==================== 业务状态码 ====================

export const BUSINESS_CODE = {
  SUCCESS: 200,
  CREATED: 201,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  BUSINESS_ERROR: 500,
  TOKEN_EXPIRED: 10001,
  TOKEN_INVALID: 10002,
  PERMISSION_DENIED: 10003,
  IDEMPOTENCY_CONFLICT: 10004,
  RATE_LIMITED: 10005,
  SIGNATURE_INVALID: 10006,
  TIMESTAMP_EXPIRED: 10007,
  NONCE_DUPLICATE: 10008
} as const

// ==================== 错误消息 ====================

export const ERROR_MESSAGES: Record<number, string> = {
  [HTTP_STATUS.BAD_REQUEST]: '请求参数错误',
  [HTTP_STATUS.UNAUTHORIZED]: '未授权，请重新登录',
  [HTTP_STATUS.PAYMENT_REQUIRED]: '需要付费',
  [HTTP_STATUS.FORBIDDEN]: '拒绝访问，权限不足',
  [HTTP_STATUS.NOT_FOUND]: '请求的资源不存在',
  [HTTP_STATUS.METHOD_NOT_ALLOWED]: '请求方法不允许',
  [HTTP_STATUS.NOT_ACCEPTABLE]: '请求格式不正确',
  [HTTP_STATUS.TIMEOUT]: '请求超时',
  [HTTP_STATUS.CONFLICT]: '资源冲突',
  [HTTP_STATUS.GONE]: '资源已删除',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: '请求参数验证失败',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: '请求过于频繁，请稍后再试',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: '服务器内部错误',
  [HTTP_STATUS.BAD_GATEWAY]: '网关错误',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: '服务暂不可用',
  [HTTP_STATUS.GATEWAY_TIMEOUT]: '网关超时'
}

// ==================== 默认配置 ====================

export const DEFAULT_HTTP_CONFIG: HttpClientConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 15000,
  withCredentials: false,
  retryCount: 0,
  retryDelay: 1000,
  enableLog: import.meta.env.DEV,
  enableMonitor: true,
  enableSign: false,
  signSecret: '',
  maxConcurrent: 6,
  enableOfflineQueue: true,
  headers: {
    'Content-Type': 'application/json'
  }
}

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: false,
  defaultTTL: 5 * 60 * 1000, // 5分钟
  maxEntries: 100,
  keyPrefix: 'http_cache_',
  persistent: false,
  storage: 'memory'
}

export const DEFAULT_IDEMPOTENCY_CONFIG: IdempotencyConfig = {
  enabled: true,
  ttl: 24 * 60 * 60 * 1000, // 24小时
  headerName: 'X-Idempotency-Key',
  storage: 'memory'
}

export const DEFAULT_TOKEN_REFRESH_CONFIG: TokenRefreshConfig = {
  enabled: true,
  refreshThreshold: 5 * 60 * 1000, // 过期前5分钟刷新
  refreshUrl: '/api/refresh-token',
  onRefreshFailed: 'logout'
}

// ==================== 请求配置默认值 ====================

export const DEFAULT_REQUEST_OPTIONS = {
  showLoading: false,
  showError: true,
  showSuccess: false,
  retryCount: 0,
  retryDelay: 1000,
  skipAuth: false,
  cache: false,
  cacheTime: 5 * 60 * 1000,
  cacheStrategy: 'network-first' as const,
  allowDuplicate: true,
  silent: false,
  priority: 'normal' as const,
  offlineQueue: false,
  sign: false,
  refreshTokenOnExpired: true
}

// ==================== 优先级权重 ====================

export const PRIORITY_WEIGHT = {
  critical: 100,
  high: 75,
  normal: 50,
  low: 25
} as const

// ==================== 存储键名 ====================

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_EXPIRES_AT: 'tokenExpiresAt',
  USER_INFO: 'userInfo',
  PERMISSIONS: 'permissions',
  OFFLINE_QUEUE: 'offline_queue',
  IDEMPOTENCY_CACHE: 'idempotency_cache',
  HTTP_CACHE: 'http_cache'
} as const

// ==================== 请求头 ====================

export const HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  REQUEST_ID: 'X-Request-Id',
  TRACE_ID: 'X-Trace-Id',
  TIMESTAMP: 'X-Timestamp',
  NONCE: 'X-Nonce',
  SIGNATURE: 'X-Signature',
  IDEMPOTENCY_KEY: 'X-Idempotency-Key',
  TOKEN: 'token',
  CLIENT_VERSION: 'X-Client-Version',
  PLATFORM: 'X-Platform'
} as const

// ==================== 内容类型 ====================

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
  STREAM: 'application/octet-stream'
} as const

// ==================== 白名单 URL ====================

/** 不需要 token 的接口列表 */
export const AUTH_WHITE_LIST = [
  '/api/login',
  '/api/register',
  '/api/forgot-password',
  '/api/captcha',
  '/api/public',
  '/api/refresh-token'
]

/** 不需要显示错误提示的接口列表 */
export const SILENT_ERROR_LIST: string[] = []

/** 不需要幂等控制的接口（支持通配符） */
export const IDEMPOTENCY_WHITE_LIST = [
  '/api/login',
  '/api/register',
  '/api/refresh-token',
  '/api/*/query',
  '/api/*/list',
  '/api/*/get'
]

// ==================== 重试配置 ====================

/** 需要重试的状态码 */
export const RETRY_STATUS_CODES = [
  HTTP_STATUS.TIMEOUT,
  HTTP_STATUS.TOO_MANY_REQUESTS,
  HTTP_STATUS.INTERNAL_SERVER_ERROR,
  HTTP_STATUS.BAD_GATEWAY,
  HTTP_STATUS.SERVICE_UNAVAILABLE,
  HTTP_STATUS.GATEWAY_TIMEOUT
]

/** 需要重试的错误码 */
export const RETRY_ERROR_CODES = [
  'ECONNABORTED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ENETUNREACH',
  'ERR_NETWORK'
]

/** 不需要重试的HTTP方法（非幂等方法默认不重试，除非显式指定） */
export const NON_IDEMPOTENT_METHODS = ['POST', 'PATCH', 'DELETE']

// ==================== 并发控制 ====================

/** 默认最大并发数 */
export const DEFAULT_MAX_CONCURRENT = 6

/** 请求队列最大长度 */
export const MAX_QUEUE_SIZE = 100

// ==================== 签名配置 ====================

/** 签名算法 */
export const SIGN_ALGORITHM = 'HmacSHA256'

/** 签名有效期（毫秒） */
export const SIGN_EXPIRE_TIME = 5 * 60 * 1000 // 5分钟

/** Nonce长度 */
export const NONCE_LENGTH = 16
