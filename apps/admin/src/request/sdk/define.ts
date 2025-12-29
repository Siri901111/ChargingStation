/**
 * API 定义工具
 * @description 提供类型安全的 API 定义方式
 */

import type { RequestConfig, ApiResponse, PaginatedResponse, PaginationParams } from '../core/types'
import { http } from './client'

/**
 * API 端点定义
 */
export interface ApiEndpoint<TParams = void, TResponse = any> {
  (params: TParams, config?: RequestConfig): Promise<ApiResponse<TResponse>>
}

/**
 * 分页 API 端点定义
 */
export interface PaginatedApiEndpoint<TParams = void, TItem = any> {
  (params: TParams & PaginationParams, config?: RequestConfig): Promise<PaginatedResponse<TItem>>
}

/**
 * 创建 GET API
 */
export function createGetApi<TParams = void, TResponse = any>(
  url: string | ((params: TParams) => string)
): ApiEndpoint<TParams, TResponse> {
  return (params: TParams, config?: RequestConfig) => {
    const finalUrl = typeof url === 'function' ? url(params) : url
    return http.get<TResponse>(finalUrl, params as any, config)
  }
}

/**
 * 创建 POST API
 */
export function createPostApi<TParams = void, TResponse = any>(
  url: string | ((params: TParams) => string)
): ApiEndpoint<TParams, TResponse> {
  return (params: TParams, config?: RequestConfig) => {
    const finalUrl = typeof url === 'function' ? url(params) : url
    return http.post<TResponse>(finalUrl, params, config)
  }
}

/**
 * 创建 PUT API
 */
export function createPutApi<TParams = void, TResponse = any>(
  url: string | ((params: TParams) => string)
): ApiEndpoint<TParams, TResponse> {
  return (params: TParams, config?: RequestConfig) => {
    const finalUrl = typeof url === 'function' ? url(params) : url
    return http.put<TResponse>(finalUrl, params, config)
  }
}

/**
 * 创建 DELETE API
 */
export function createDeleteApi<TParams = void, TResponse = any>(
  url: string | ((params: TParams) => string)
): ApiEndpoint<TParams, TResponse> {
  return (params: TParams, config?: RequestConfig) => {
    const finalUrl = typeof url === 'function' ? url(params) : url
    return http.delete<TResponse>(finalUrl, params as any, config)
  }
}

/**
 * 创建 PATCH API
 */
export function createPatchApi<TParams = void, TResponse = any>(
  url: string | ((params: TParams) => string)
): ApiEndpoint<TParams, TResponse> {
  return (params: TParams, config?: RequestConfig) => {
    const finalUrl = typeof url === 'function' ? url(params) : url
    return http.patch<TResponse>(finalUrl, params, config)
  }
}

/**
 * 创建分页查询 API
 */
export function createPaginatedApi<TParams = void, TItem = any>(
  url: string,
  method: 'GET' | 'POST' = 'POST'
): PaginatedApiEndpoint<TParams, TItem> {
  return (params: TParams & PaginationParams, config?: RequestConfig) => {
    if (method === 'GET') {
      return http.get(url, params, config) as Promise<PaginatedResponse<TItem>>
    }
    return http.post(url, params, config) as Promise<PaginatedResponse<TItem>>
  }
}

/**
 * API 模块定义类型
 */
export type ApiModule<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never
}

/**
 * 定义 API 模块
 */
export function defineApi<T extends Record<string, (...args: any[]) => any>>(apis: T): ApiModule<T> {
  return apis
}

/**
 * RESTful 资源 API 创建器
 */
export function createResourceApi<
  TItem extends { id: string | number },
  TCreateParams = Omit<TItem, 'id'>,
  TUpdateParams = Partial<TItem>,
  TListParams = void
>(baseUrl: string) {
  return {
    /** 获取列表 */
    list: createPaginatedApi<TListParams, TItem>(`${baseUrl}/list`, 'POST'),

    /** 获取详情 */
    get: createGetApi<{ id: string | number }, TItem>((params) => `${baseUrl}/${params.id}`),

    /** 创建 */
    create: createPostApi<TCreateParams, TItem>(baseUrl),

    /** 更新 */
    update: createPutApi<TUpdateParams & { id: string | number }, TItem>(
      (params) => `${baseUrl}/${params.id}`
    ),

    /** 删除 */
    delete: createDeleteApi<{ id: string | number }, void>((params) => `${baseUrl}/${params.id}`),

    /** 批量删除 */
    batchDelete: createPostApi<{ ids: (string | number)[] }, void>(`${baseUrl}/batch-delete`)
  }
}

/**
 * API 请求配置工厂
 */
export const apiConfig = {
  /** 带幂等性的请求 */
  idempotent: (key?: string): RequestConfig => ({
    idempotencyKey: key
  }),

  /** 静默请求（不显示任何提示） */
  silent: (): RequestConfig => ({
    silent: true,
    showError: false,
    showSuccess: false,
    showLoading: false
  }),

  /** 带 Loading 的请求 */
  withLoading: (text?: string): RequestConfig => ({
    showLoading: true,
    loadingText: text
  }),

  /** 带成功提示的请求 */
  withSuccessMessage: (message?: string): RequestConfig => ({
    showSuccess: true,
    successMessage: message
  }),

  /** 带缓存的请求 */
  cached: (time?: number): RequestConfig => ({
    cache: true,
    cacheTime: time
  }),

  /** 防抖请求 */
  debounced: (time: number = 300): RequestConfig => ({
    debounceTime: time
  }),

  /** 节流请求 */
  throttled: (time: number = 300): RequestConfig => ({
    throttleTime: time
  }),

  /** 高优先级请求 */
  highPriority: (): RequestConfig => ({
    priority: 'high'
  }),

  /** 关键请求（最高优先级） */
  critical: (): RequestConfig => ({
    priority: 'critical'
  }),

  /** 离线队列请求 */
  offlineEnabled: (): RequestConfig => ({
    offlineQueue: true
  }),

  /** 带重试的请求 */
  withRetry: (count: number = 3, delay: number = 1000): RequestConfig => ({
    retryCount: count,
    retryDelay: delay
  }),

  /** 组合多个配置 */
  combine: (...configs: RequestConfig[]): RequestConfig => {
    return configs.reduce((acc, config) => ({ ...acc, ...config }), {})
  }
}
