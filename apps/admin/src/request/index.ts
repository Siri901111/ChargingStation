/**
 * HTTP Request SDK
 * @description 企业级 HTTP 请求库，提供完整的请求管理能力
 *
 * 功能特性：
 * - 请求幂等性控制
 * - 请求去重/防抖/节流
 * - Token 自动刷新
 * - 请求队列和并发控制
 * - 离线请求队列
 * - 请求签名和安全机制
 * - 请求缓存
 * - 请求重试
 * - 请求取消
 * - 性能监控
 *
 * @example
 * ```typescript
 * import { http, createPostApi, apiConfig } from '@/request'
 *
 * // 基础使用
 * const response = await http.get('/api/users')
 *
 * // 带配置的请求
 * const response = await http.post('/api/users', data, {
 *   showLoading: true,
 *   showSuccess: true,
 *   idempotencyKey: 'create-user-xxx'
 * })
 *
 * // 使用 API 定义工具
 * const loginApi = createPostApi<LoginParams, LoginResult>('/api/login')
 * const result = await loginApi({ username: 'admin', password: '123456' })
 *
 * // 使用配置工厂
 * const result = await http.post('/api/order', data, apiConfig.combine(
 *   apiConfig.idempotent('order-xxx'),
 *   apiConfig.withLoading('提交中...'),
 *   apiConfig.withSuccessMessage('订单提交成功')
 * ))
 * ```
 */

// ==================== 核心类型导出 ====================
export type {
  // 基础类型
  HttpMethod,
  ContentType,
  RequestStatus,
  RequestPriority,
  CacheStrategy,
  // 配置类型
  RequestConfig,
  InternalRequestConfig,
  HttpClientConfig,
  CacheConfig,
  IdempotencyConfig,
  TokenRefreshConfig,
  // 响应类型
  ApiResponse,
  PaginatedData,
  PaginatedResponse,
  PaginationParams,
  // 拦截器类型
  RequestInterceptor,
  ResponseInterceptor,
  // 错误类型
  HttpError,
  // 监控类型
  RequestMetrics,
  MonitorCallback,
  // Token 类型
  TokenInfo,
  // 钩子类型
  RequestHooks
} from './core/types'

// 导出错误码枚举
export { HttpErrorCode } from './core/types'

// ==================== 常量导出 ====================
export {
  HTTP_STATUS,
  BUSINESS_CODE,
  ERROR_MESSAGES,
  DEFAULT_HTTP_CONFIG,
  DEFAULT_CACHE_CONFIG,
  DEFAULT_IDEMPOTENCY_CONFIG,
  DEFAULT_TOKEN_REFRESH_CONFIG,
  DEFAULT_REQUEST_OPTIONS,
  STORAGE_KEYS,
  HEADERS,
  CONTENT_TYPES,
  AUTH_WHITE_LIST,
  RETRY_STATUS_CODES,
  RETRY_ERROR_CODES
} from './core/constants'

// ==================== 工具函数导出 ====================
export {
  generateRequestId,
  generateTraceId,
  generateIdempotencyKey,
  generateNonce,
  generateCacheKey,
  createHttpError,
  isCancel,
  isNetworkError,
  isTimeoutError,
  isOffline,
  getErrorMessage,
  formatDuration,
  delay,
  deepMerge,
  serializeParams,
  isInWhiteList,
  debounce,
  throttle,
  retryExecute,
  logger
} from './core/utils'

// ==================== 管理器导出 ====================
export {
  // 幂等性管理器
  IdempotencyManager,
  idempotencyManager,
  // 去重管理器
  DedupeManager,
  dedupeManager,
  // Token 管理器
  TokenManager,
  tokenManager,
  // 队列管理器
  QueueManager,
  queueManager,
  // 离线队列管理器
  OfflineQueueManager,
  offlineQueueManager,
  // 签名管理器
  SignManager,
  signManager,
  // 缓存管理器
  CacheManager,
  cacheManager,
  // 取消管理器
  CancelManager,
  cancelManager,
  // 重试管理器
  RetryManager,
  retryManager
} from './managers'

export type { QueueConfig, OfflineQueueConfig, SignConfig, RetryConfig } from './managers'

// ==================== 拦截器导出 ====================
export {
  // 请求拦截器
  timestampInterceptor,
  traceIdInterceptor,
  tokenInterceptor,
  idempotencyInterceptor,
  signInterceptor,
  loadingInterceptor,
  logInterceptor,
  // 响应拦截器
  loadingCloseInterceptor,
  idempotencyResponseInterceptor,
  transformInterceptor,
  businessCodeInterceptor,
  errorHandlerInterceptor,
  logResponseInterceptor,
  // 默认拦截器配置
  defaultRequestInterceptors,
  defaultResponseInterceptors
} from './interceptors'

// ==================== SDK 核心导出 ====================
export {
  // HTTP 客户端
  HttpClient,
  http,
  // 便捷方法
  get,
  post,
  put,
  del,
  patch,
  upload,
  download,
  // API 定义工具
  createGetApi,
  createPostApi,
  createPutApi,
  createDeleteApi,
  createPatchApi,
  createPaginatedApi,
  createResourceApi,
  defineApi,
  apiConfig
} from './sdk'

export type { ApiEndpoint, PaginatedApiEndpoint, ApiModule } from './sdk'

// ==================== 默认导出 ====================
import { http } from './sdk'
export default http
