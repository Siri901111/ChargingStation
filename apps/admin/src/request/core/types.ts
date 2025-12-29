/**
 * HTTP SDK 核心类型定义
 * @description 定义请求库所需的所有类型接口，遵循大厂标准
 */

import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// ==================== 基础类型 ====================

/**
 * HTTP 请求方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/**
 * 内容类型
 */
export type ContentType =
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain'

/**
 * 请求状态
 */
export type RequestStatus = 'pending' | 'loading' | 'success' | 'error' | 'cancelled'

/**
 * 请求优先级
 */
export type RequestPriority = 'low' | 'normal' | 'high' | 'critical'

// ==================== 配置类型 ====================

/**
 * 请求配置选项
 */
export interface RequestConfig<D = any> extends Omit<AxiosRequestConfig<D>, 'url' | 'method'> {
  /** 请求唯一标识，用于取消请求和幂等控制 */
  requestId?: string
  /** 幂等键（用于POST等非幂等请求的幂等控制） */
  idempotencyKey?: string
  /** 是否显示 loading */
  showLoading?: boolean
  /** loading 提示文字 */
  loadingText?: string
  /** 是否显示错误提示 */
  showError?: boolean
  /** 自定义错误提示文字 */
  errorMessage?: string
  /** 是否显示成功提示 */
  showSuccess?: boolean
  /** 自定义成功提示文字 */
  successMessage?: string
  /** 重试次数 */
  retryCount?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 是否跳过 token 验证 */
  skipAuth?: boolean
  /** 是否缓存请求结果 */
  cache?: boolean
  /** 缓存时间（毫秒） */
  cacheTime?: number
  /** 缓存策略 */
  cacheStrategy?: CacheStrategy
  /** 是否允许重复请求 */
  allowDuplicate?: boolean
  /** 请求超时时间（覆盖默认） */
  timeout?: number
  /** 是否静默请求（不显示任何提示） */
  silent?: boolean
  /** 自定义响应处理 */
  transformResponse?: (response: any) => any
  /** 元数据，可携带任意信息 */
  meta?: Record<string, any>
  /** 请求优先级 */
  priority?: RequestPriority
  /** 防抖延迟（毫秒） */
  debounceTime?: number
  /** 节流间隔（毫秒） */
  throttleTime?: number
  /** 是否离线时缓存请求 */
  offlineQueue?: boolean
  /** 请求签名（用于接口安全） */
  sign?: boolean
  /** 是否需要刷新Token后重试 */
  refreshTokenOnExpired?: boolean
  /** 上传/下载进度回调 */
  onProgress?: (percent: number) => void
}

/**
 * 完整请求配置（内部使用）
 */
export interface InternalRequestConfig<D = any> extends RequestConfig<D> {
  url: string
  method: HttpMethod
  /** 开始时间戳 */
  _startTime?: number
  /** 重试次数计数 */
  _retryCount?: number
  /** 是否来自离线队列 */
  _fromOfflineQueue?: boolean
  /** 请求签名 */
  _signature?: string
  /** 请求时间戳 */
  _timestamp?: number
  /** 请求nonce */
  _nonce?: string
}

/**
 * HTTP 客户端配置
 */
export interface HttpClientConfig {
  /** 基础 URL */
  baseURL: string
  /** 默认超时时间 */
  timeout?: number
  /** 默认请求头 */
  headers?: Record<string, string>
  /** 是否携带 cookie */
  withCredentials?: boolean
  /** 默认重试次数 */
  retryCount?: number
  /** 默认重试延迟 */
  retryDelay?: number
  /** 是否开启请求日志 */
  enableLog?: boolean
  /** 是否开启性能监控 */
  enableMonitor?: boolean
  /** 是否开启请求签名 */
  enableSign?: boolean
  /** 签名密钥 */
  signSecret?: string
  /** 最大并发请求数 */
  maxConcurrent?: number
  /** 是否开启离线队列 */
  enableOfflineQueue?: boolean
}

// ==================== 缓存策略 ====================

/**
 * 缓存策略
 */
export type CacheStrategy =
  | 'cache-first'      // 优先使用缓存
  | 'network-first'    // 优先使用网络
  | 'cache-only'       // 仅使用缓存
  | 'network-only'     // 仅使用网络
  | 'stale-while-revalidate'  // 返回缓存同时更新

// ==================== 响应类型 ====================

/**
 * 标准 API 响应格式
 */
export interface ApiResponse<T = any> {
  /** 响应码 */
  code: number
  /** 响应数据 */
  data: T
  /** 响应消息 */
  message: string
  /** 时间戳 */
  timestamp?: number
  /** 请求 ID */
  requestId?: string
  /** 追踪 ID */
  traceId?: string
}

/**
 * 分页响应数据
 */
export interface PaginatedData<T> {
  /** 数据列表 */
  list: T[]
  /** 总数 */
  total: number
  /** 当前页 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 总页数 */
  totalPages?: number
  /** 是否有下一页 */
  hasNext?: boolean
  /** 是否有上一页 */
  hasPrev?: boolean
}

/**
 * 分页 API 响应
 */
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

// ==================== 拦截器类型 ====================

/**
 * 请求拦截器
 */
export interface RequestInterceptor {
  /** 拦截器名称 */
  name: string
  /** 优先级（数字越小优先级越高） */
  priority?: number
  /** 请求拦截处理 */
  onRequest?: (config: InternalRequestConfig) => InternalRequestConfig | Promise<InternalRequestConfig>
  /** 请求错误处理 */
  onRequestError?: (error: AxiosError) => any
}

/**
 * 响应拦截器
 */
export interface ResponseInterceptor {
  /** 拦截器名称 */
  name: string
  /** 优先级（数字越小优先级越高） */
  priority?: number
  /** 响应拦截处理 */
  onResponse?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
  /** 响应错误处理 */
  onResponseError?: (error: AxiosError) => any
}

// ==================== 错误类型 ====================

/**
 * HTTP 错误码枚举
 */
export enum HttpErrorCode {
  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 超时 */
  TIMEOUT = 'TIMEOUT',
  /** 请求取消 */
  CANCELLED = 'CANCELLED',
  /** 未授权 */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** 禁止访问 */
  FORBIDDEN = 'FORBIDDEN',
  /** 未找到 */
  NOT_FOUND = 'NOT_FOUND',
  /** 服务器错误 */
  SERVER_ERROR = 'SERVER_ERROR',
  /** 业务错误 */
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN',
  /** 幂等性冲突 */
  IDEMPOTENCY_CONFLICT = 'IDEMPOTENCY_CONFLICT',
  /** 请求限流 */
  RATE_LIMITED = 'RATE_LIMITED',
  /** 签名错误 */
  SIGNATURE_ERROR = 'SIGNATURE_ERROR',
  /** Token过期 */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  /** 离线错误 */
  OFFLINE = 'OFFLINE'
}

/**
 * 自定义 HTTP 错误
 */
export interface HttpError extends Error {
  /** 错误码 */
  code: HttpErrorCode
  /** HTTP 状态码 */
  status?: number
  /** 原始响应 */
  response?: AxiosResponse
  /** 请求配置 */
  config?: InternalRequestConfig
  /** 是否为取消错误 */
  isCancelled?: boolean
  /** 错误详情 */
  details?: any
  /** 追踪ID */
  traceId?: string
  /** 是否可重试 */
  retryable?: boolean
}

// ==================== 缓存类型 ====================

/**
 * 缓存条目
 */
export interface CacheEntry<T = any> {
  /** 缓存数据 */
  data: T
  /** 过期时间戳 */
  expireAt: number
  /** 创建时间戳 */
  createdAt: number
  /** 缓存标签 */
  tags?: string[]
  /** ETag */
  etag?: string
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled: boolean
  /** 默认缓存时间（毫秒） */
  defaultTTL: number
  /** 最大缓存条目数 */
  maxEntries: number
  /** 缓存键前缀 */
  keyPrefix: string
  /** 是否使用持久化存储 */
  persistent?: boolean
  /** 存储类型 */
  storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB'
}

// ==================== 监控类型 ====================

/**
 * 请求监控数据
 */
export interface RequestMetrics {
  /** 请求 URL */
  url: string
  /** 请求方法 */
  method: HttpMethod
  /** 响应状态码 */
  status?: number
  /** 请求耗时（毫秒） */
  duration: number
  /** 请求大小（字节） */
  requestSize?: number
  /** 响应大小（字节） */
  responseSize?: number
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 时间戳 */
  timestamp: number
  /** 追踪ID */
  traceId?: string
  /** 重试次数 */
  retryCount?: number
  /** 是否命中缓存 */
  cacheHit?: boolean
  /** 是否来自离线队列 */
  fromOfflineQueue?: boolean
}

/**
 * 监控回调
 */
export type MonitorCallback = (metrics: RequestMetrics) => void

// ==================== 幂等性类型 ====================

/**
 * 幂等性记录
 */
export interface IdempotencyRecord {
  /** 幂等键 */
  key: string
  /** 请求URL */
  url: string
  /** 请求方法 */
  method: HttpMethod
  /** 响应数据 */
  response?: any
  /** 创建时间 */
  createdAt: number
  /** 过期时间 */
  expireAt: number
  /** 请求状态 */
  status: 'pending' | 'completed' | 'failed'
}

/**
 * 幂等性配置
 */
export interface IdempotencyConfig {
  /** 是否启用 */
  enabled: boolean
  /** 幂等键过期时间（毫秒） */
  ttl: number
  /** 幂等键头名称 */
  headerName: string
  /** 存储类型 */
  storage: 'memory' | 'localStorage' | 'sessionStorage'
}

// ==================== 队列类型 ====================

/**
 * 队列请求项
 */
export interface QueueItem {
  /** 唯一ID */
  id: string
  /** 请求配置 */
  config: InternalRequestConfig
  /** 优先级 */
  priority: RequestPriority
  /** 创建时间 */
  createdAt: number
  /** 重试次数 */
  retryCount: number
  /** Promise resolve */
  resolve: (value: any) => void
  /** Promise reject */
  reject: (reason: any) => void
}

/**
 * 离线队列项
 */
export interface OfflineQueueItem {
  /** 唯一ID */
  id: string
  /** 请求配置 */
  config: InternalRequestConfig
  /** 创建时间 */
  createdAt: number
  /** 最大重试次数 */
  maxRetries: number
  /** 当前重试次数 */
  retryCount: number
}

// ==================== Token类型 ====================

/**
 * Token信息
 */
export interface TokenInfo {
  /** 访问令牌 */
  accessToken: string
  /** 刷新令牌 */
  refreshToken?: string
  /** 过期时间（时间戳） */
  expiresAt?: number
  /** Token类型 */
  tokenType?: string
}

/**
 * Token刷新配置
 */
export interface TokenRefreshConfig {
  /** 是否启用自动刷新 */
  enabled: boolean
  /** Token过期提前刷新时间（毫秒） */
  refreshThreshold: number
  /** 刷新Token的URL */
  refreshUrl: string
  /** 刷新失败的处理方式 */
  onRefreshFailed?: 'logout' | 'retry' | 'ignore'
}

// ==================== 工具类型 ====================

/**
 * 请求参数类型
 */
export type RequestParams = Record<string, any>

/**
 * 请求数据类型
 */
export type RequestData = Record<string, any> | FormData | string

/**
 * 取消令牌
 */
export interface CancelToken {
  /** 取消请求 */
  cancel: (reason?: string) => void
  /** 是否已取消 */
  isCancelled: () => boolean
}

/**
 * 请求钩子
 */
export interface RequestHooks {
  /** 请求前钩子 */
  beforeRequest?: (config: InternalRequestConfig) => InternalRequestConfig | Promise<InternalRequestConfig> | void
  /** 请求后钩子 */
  afterResponse?: (response: ApiResponse) => ApiResponse | Promise<ApiResponse> | void
  /** 错误钩子 */
  onError?: (error: HttpError) => void
  /** 重试钩子 */
  onRetry?: (config: InternalRequestConfig, error: Error, retryCount: number) => void
  /** 取消钩子 */
  onCancel?: (config: InternalRequestConfig, reason: string) => void
}
