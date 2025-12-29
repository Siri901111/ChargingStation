/**
 * HTTP SDK 核心客户端
 * @description 封装 axios，提供统一的请求接口和扩展能力
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import type {
  HttpClientConfig,
  RequestConfig,
  InternalRequestConfig,
  ApiResponse,
  RequestInterceptor,
  ResponseInterceptor,
  HttpMethod,
  MonitorCallback,
  RequestHooks,
  TokenInfo
} from './core/types'
import { DEFAULT_HTTP_CONFIG, DEFAULT_REQUEST_OPTIONS } from './core/constants'
import { defaultRequestInterceptors, defaultResponseInterceptors } from './interceptors'
import {
  cancelManager,
  cacheManager,
  retryManager,
  idempotencyManager,
  dedupeManager,
  tokenManager,
  signManager,
  offlineQueueManager
} from './managers'
import {
  createHttpError,
  isCancel,
  isOffline,
  generateRequestId,
  createRequestMetrics,
  deepMerge,
  logger
} from './core/utils'
import { HttpErrorCode } from './core/types'

/**
 * HTTP 客户端类
 */
export class HttpClient {
  /** Axios 实例 */
  private instance: AxiosInstance
  /** 客户端配置 */
  private config: HttpClientConfig
  /** 请求拦截器列表 */
  private requestInterceptors: RequestInterceptor[] = []
  /** 响应拦截器列表 */
  private responseInterceptors: ResponseInterceptor[] = []
  /** 监控回调 */
  private monitorCallbacks: MonitorCallback[] = []
  /** 请求钩子 */
  private hooks: RequestHooks = {}

  constructor(config?: Partial<HttpClientConfig>) {
    this.config = deepMerge({}, DEFAULT_HTTP_CONFIG, config || {})

    // 创建 Axios 实例
    this.instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
      withCredentials: this.config.withCredentials
    })

    // 设置离线队列执行器
    offlineQueueManager.setExecutor((config) => this.executeRequest(config))

    // 注册默认拦截器
    this.useDefaultInterceptors()
  }

  /**
   * 使用默认拦截器
   */
  private useDefaultInterceptors(): void {
    defaultRequestInterceptors.forEach((interceptor) => {
      this.useRequestInterceptor(interceptor)
    })
    defaultResponseInterceptors.forEach((interceptor) => {
      this.useResponseInterceptor(interceptor)
    })
    this.applyInterceptors()
  }

  /**
   * 添加请求拦截器
   */
  useRequestInterceptor(interceptor: RequestInterceptor): this {
    this.requestInterceptors.push(interceptor)
    // 按优先级排序
    this.requestInterceptors.sort((a, b) => (a.priority || 50) - (b.priority || 50))
    return this
  }

  /**
   * 添加响应拦截器
   */
  useResponseInterceptor(interceptor: ResponseInterceptor): this {
    this.responseInterceptors.push(interceptor)
    // 按优先级排序
    this.responseInterceptors.sort((a, b) => (a.priority || 50) - (b.priority || 50))
    return this
  }

  /**
   * 应用拦截器到 Axios 实例
   */
  private applyInterceptors(): void {
    // 请求拦截器（后添加的先执行，所以倒序添加）
    this.requestInterceptors
      .slice()
      .reverse()
      .forEach((interceptor) => {
        this.instance.interceptors.request.use(
          interceptor.onRequest as any,
          interceptor.onRequestError
        )
      })

    // 响应拦截器
    this.responseInterceptors.forEach((interceptor) => {
      this.instance.interceptors.response.use(interceptor.onResponse, interceptor.onResponseError)
    })
  }

  /**
   * 设置请求钩子
   */
  setHooks(hooks: RequestHooks): this {
    this.hooks = { ...this.hooks, ...hooks }
    return this
  }

  /**
   * 添加监控回调
   */
  onMonitor(callback: MonitorCallback): this {
    this.monitorCallbacks.push(callback)
    return this
  }

  /**
   * 设置 Token
   */
  setToken(tokenInfo: TokenInfo): this {
    tokenManager.setToken(tokenInfo)
    return this
  }

  /**
   * 清除 Token
   */
  clearToken(): this {
    tokenManager.clearToken()
    return this
  }

  /**
   * 设置 Token 刷新函数
   */
  setTokenRefreshFn(fn: (refreshToken: string) => Promise<TokenInfo>): this {
    tokenManager.setRefreshFn(fn)
    return this
  }

  /**
   * 设置登出函数
   */
  setLogoutFn(fn: () => void): this {
    tokenManager.setLogoutFn(fn)
    return this
  }

  /**
   * 设置签名密钥
   */
  setSignSecret(secret: string): this {
    signManager.setSecret(secret)
    return this
  }

  /**
   * 执行实际请求
   */
  private async executeRequest<T>(config: InternalRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.request<any, AxiosResponse<ApiResponse<T>>>(config)
    return response.data
  }

  /**
   * 发送请求
   */
  async request<T = any>(
    method: HttpMethod,
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    // 合并配置
    const mergedConfig: InternalRequestConfig = {
      ...DEFAULT_REQUEST_OPTIONS,
      ...config,
      url,
      method,
      requestId: config?.requestId || generateRequestId()
    }

    // 执行请求前钩子
    if (this.hooks.beforeRequest) {
      const result = await this.hooks.beforeRequest(mergedConfig)
      if (result) Object.assign(mergedConfig, result)
    }

    // 检查离线状态
    if (isOffline()) {
      if (mergedConfig.offlineQueue) {
        offlineQueueManager.add(mergedConfig)
        throw createHttpError(HttpErrorCode.OFFLINE, '当前处于离线状态，请求已加入离线队列')
      }
      throw createHttpError(HttpErrorCode.OFFLINE, '当前处于离线状态')
    }

    // 检查幂等性缓存
    if (idempotencyManager.needsIdempotency(mergedConfig)) {
      const key = idempotencyManager.getIdempotencyKey(mergedConfig)
      const result = await idempotencyManager.handleIdempotentRequest(key, mergedConfig)
      if (result.cached) {
        return result.data
      }
      idempotencyManager.setPending(key, mergedConfig)
    }

    // 请求去重
    const duplicateResult = await dedupeManager.handleDedupe<ApiResponse<T>>(mergedConfig)
    if (duplicateResult) {
      return duplicateResult
    }

    // 处理防抖
    if (mergedConfig.debounceTime && mergedConfig.debounceTime > 0) {
      return dedupeManager.debounce(mergedConfig, (cfg) =>
        this.executeRequestWithRetry(cfg)
      ) as Promise<ApiResponse<T>>
    }

    // 处理节流
    if (mergedConfig.throttleTime && mergedConfig.throttleTime > 0) {
      return dedupeManager.throttle(mergedConfig, (cfg) =>
        this.executeRequestWithRetry(cfg)
      ) as Promise<ApiResponse<T>>
    }

    return this.executeRequestWithRetry(mergedConfig)
  }

  /**
   * 执行请求（包含重试和缓存逻辑）
   */
  private async executeRequestWithRetry<T>(config: InternalRequestConfig): Promise<ApiResponse<T>> {
    // 检查缓存
    if (config.cache && config.method === 'GET') {
      const cachedData = cacheManager.get<ApiResponse<T>>(config)
      if (cachedData) {
        return cachedData
      }
    }

    // 添加到取消管理器
    cancelManager.add(config)

    // 添加到去重列表
    const requestPromise = this.doRequest<T>(config)
    dedupeManager.addPending(config, requestPromise)

    try {
      const result = await requestPromise

      // 缓存响应
      if (config.cache && config.method === 'GET') {
        cacheManager.set(config, result)
      }

      // 清理取消管理器
      cancelManager.clear(config)

      // 执行响应后钩子
      if (this.hooks.afterResponse) {
        const hookResult = await this.hooks.afterResponse(result)
        if (hookResult) return hookResult as ApiResponse<T>
      }

      // 发送监控数据
      if (this.config.enableMonitor) {
        const metrics = createRequestMetrics(config, { data: result })
        this.monitorCallbacks.forEach((cb) => cb(metrics))
      }

      return result
    } catch (error) {
      // 清理取消管理器
      cancelManager.clear(config)

      // 检查是否需要重试
      if (error instanceof Error && !isCancel(error)) {
        const axiosError = error as AxiosError
        if (retryManager.shouldRetry(axiosError, config)) {
          // 执行重试钩子
          if (this.hooks.onRetry) {
            this.hooks.onRetry(config, error, (config._retryCount || 0) + 1)
          }
          return retryManager.retry(axiosError, config, (newConfig) =>
            this.executeRequestWithRetry(newConfig)
          )
        }
      }

      // 执行错误钩子
      if (this.hooks.onError && error instanceof Error) {
        this.hooks.onError(error as any)
      }

      // 发送监控数据
      if (this.config.enableMonitor) {
        const metrics = createRequestMetrics(config, undefined, error)
        this.monitorCallbacks.forEach((cb) => cb(metrics))
      }

      throw error
    }
  }

  /**
   * 执行实际请求
   */
  private async doRequest<T>(config: InternalRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.request<any, AxiosResponse<ApiResponse<T>>>(config)
    return response.data
  }

  /**
   * GET 请求
   */
  get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, { ...config, params })
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, { ...config, data })
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, { ...config, data })
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, { ...config, params })
  }

  /**
   * PATCH 请求
   */
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, { ...config, data })
  }

  /**
   * 上传文件
   */
  upload<T = any>(
    url: string,
    file: File | FormData,
    config?: RequestConfig & { onProgress?: (percent: number) => void }
  ): Promise<ApiResponse<T>> {
    let formData: FormData
    if (file instanceof FormData) {
      formData = file
    } else {
      formData = new FormData()
      formData.append('file', file)
    }

    return this.request<T>('POST', url, {
      ...config,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      },
      onUploadProgress: config?.onProgress
        ? (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
            config.onProgress!(percent)
          }
        : undefined
    })
  }

  /**
   * 下载文件
   */
  async download(url: string, filename?: string, config?: RequestConfig): Promise<Blob> {
    const response = await this.instance.request({
      ...config,
      url,
      method: 'GET',
      responseType: 'blob'
    })

    const blob = response.data

    // 自动下载
    if (filename) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    }

    return blob
  }

  /**
   * 取消请求
   */
  cancelRequest(requestId: string, reason?: string): boolean {
    const cancelled = cancelManager.cancel(requestId, reason)
    if (cancelled && this.hooks.onCancel) {
      this.hooks.onCancel({} as InternalRequestConfig, reason || '')
    }
    return cancelled
  }

  /**
   * 批量取消请求
   */
  cancelRequests(requestIds: string[], reason?: string): number {
    return cancelManager.cancelBatch(requestIds, reason)
  }

  /**
   * 按模式取消请求
   */
  cancelByPattern(pattern: string | RegExp, reason?: string): number {
    return cancelManager.cancelByPattern(pattern, reason)
  }

  /**
   * 取消所有请求
   */
  cancelAllRequests(reason?: string): void {
    cancelManager.cancelAll(reason)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    cacheManager.clear()
  }

  /**
   * 按标签清除缓存
   */
  clearCacheByTag(tag: string): number {
    return cacheManager.deleteByTag(tag)
  }

  /**
   * 按模式清除缓存
   */
  clearCacheByPattern(pattern: string | RegExp): number {
    return cacheManager.deleteByPattern(pattern)
  }

  /**
   * 处理离线队列
   */
  processOfflineQueue(): Promise<void> {
    return offlineQueueManager.processQueue()
  }

  /**
   * 获取 Axios 实例
   */
  getAxiosInstance(): AxiosInstance {
    return this.instance
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<HttpClientConfig>): void {
    this.config = { ...this.config, ...config }
    if (config.baseURL) {
      this.instance.defaults.baseURL = config.baseURL
    }
    if (config.timeout) {
      this.instance.defaults.timeout = config.timeout
    }
    if (config.headers) {
      Object.assign(this.instance.defaults.headers, config.headers)
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      cancel: cancelManager.getStats(),
      cache: cacheManager.getStats(),
      retry: retryManager.getStats(),
      idempotency: idempotencyManager.getStats(),
      dedupe: dedupeManager.getStats(),
      offlineQueue: offlineQueueManager.getStats(),
      token: tokenManager.getStatus()
    }
  }
}

// 创建默认实例
export const http = new HttpClient()

// 导出便捷方法
export const get = http.get.bind(http)
export const post = http.post.bind(http)
export const put = http.put.bind(http)
export const del = http.delete.bind(http)
export const patch = http.patch.bind(http)
export const upload = http.upload.bind(http)
export const download = http.download.bind(http)
