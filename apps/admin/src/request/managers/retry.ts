/**
 * 请求重试管理器
 * @description 管理请求失败后的重试逻辑，支持指数退避
 */

import type { AxiosError } from 'axios'
import type { InternalRequestConfig } from '../core/types'
import { RETRY_STATUS_CODES, RETRY_ERROR_CODES, DEFAULT_REQUEST_OPTIONS, NON_IDEMPOTENT_METHODS } from '../core/constants'
import { delay, isCancel, logger } from '../core/utils'

/**
 * 重试配置
 */
export interface RetryConfig {
  /** 最大重试次数 */
  maxRetries: number
  /** 重试延迟（毫秒） */
  retryDelay: number
  /** 重试延迟倍数（指数退避） */
  retryDelayMultiplier?: number
  /** 最大重试延迟 */
  maxRetryDelay?: number
  /** 需要重试的状态码 */
  retryStatusCodes?: number[]
  /** 需要重试的错误码 */
  retryErrorCodes?: string[]
  /** 自定义重试条件 */
  retryCondition?: (error: AxiosError) => boolean
  /** 非幂等方法是否重试 */
  retryNonIdempotent?: boolean
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: DEFAULT_REQUEST_OPTIONS.retryCount,
  retryDelay: DEFAULT_REQUEST_OPTIONS.retryDelay,
  retryDelayMultiplier: 2,
  maxRetryDelay: 30000,
  retryStatusCodes: RETRY_STATUS_CODES,
  retryErrorCodes: RETRY_ERROR_CODES,
  retryNonIdempotent: false // 默认不重试非幂等请求
}

/**
 * 请求重试管理器
 */
export class RetryManager {
  private config: RetryConfig
  /** 重试统计 */
  private stats = {
    totalRetries: 0,
    successfulRetries: 0,
    failedRetries: 0
  }

  constructor(config?: Partial<RetryConfig>) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
  }

  /**
   * 判断是否应该重试
   */
  shouldRetry(error: AxiosError, config: InternalRequestConfig): boolean {
    // 已取消的请求不重试
    if (isCancel(error)) {
      return false
    }

    // 检查重试次数
    const retryCount = config._retryCount || 0
    const maxRetries = config.retryCount ?? this.config.maxRetries
    if (retryCount >= maxRetries) {
      return false
    }

    // 检查非幂等方法
    if (!this.config.retryNonIdempotent && NON_IDEMPOTENT_METHODS.includes(config.method)) {
      // 如果请求配置了幂等键，则可以重试
      if (!config.idempotencyKey) {
        logger.debug(`Retry: Skipping non-idempotent method ${config.method}`)
        return false
      }
    }

    // 自定义重试条件
    if (this.config.retryCondition) {
      return this.config.retryCondition(error)
    }

    // 检查状态码
    const status = error.response?.status
    if (status && this.config.retryStatusCodes?.includes(status)) {
      return true
    }

    // 检查错误码
    const errorCode = error.code
    if (errorCode && this.config.retryErrorCodes?.includes(errorCode)) {
      return true
    }

    // 网络错误重试
    if (!error.response && error.request) {
      return true
    }

    return false
  }

  /**
   * 计算重试延迟（指数退避 + 抖动）
   */
  getRetryDelay(config: InternalRequestConfig): number {
    const retryCount = config._retryCount || 0
    const baseDelay = config.retryDelay ?? this.config.retryDelay
    const multiplier = this.config.retryDelayMultiplier || 1
    const maxDelay = this.config.maxRetryDelay || 30000

    // 指数退避: delay * multiplier^retryCount
    const calculatedDelay = baseDelay * Math.pow(multiplier, retryCount)

    // 添加抖动（±20%）
    const jitter = calculatedDelay * 0.2 * (Math.random() * 2 - 1)

    return Math.min(calculatedDelay + jitter, maxDelay)
  }

  /**
   * 执行重试
   */
  async retry<T>(
    error: AxiosError,
    config: InternalRequestConfig,
    requestFn: (config: InternalRequestConfig) => Promise<T>
  ): Promise<T> {
    const retryCount = (config._retryCount || 0) + 1
    const retryDelay = this.getRetryDelay(config)
    const maxRetries = config.retryCount || this.config.maxRetries

    logger.warn(
      `Retry: Attempt ${retryCount}/${maxRetries} for ${config.url} after ${retryDelay}ms`
    )

    this.stats.totalRetries++

    // 等待延迟
    await delay(retryDelay)

    // 更新重试次数
    const newConfig: InternalRequestConfig = {
      ...config,
      _retryCount: retryCount
    }

    try {
      // 执行重试请求
      const result = await requestFn(newConfig)
      this.stats.successfulRetries++
      return result
    } catch (retryError) {
      this.stats.failedRetries++
      throw retryError
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalRetries: number
    successfulRetries: number
    failedRetries: number
    successRate: number
  } {
    const successRate =
      this.stats.totalRetries > 0
        ? (this.stats.successfulRetries / this.stats.totalRetries) * 100
        : 0

    return {
      ...this.stats,
      successRate
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalRetries: 0,
      successfulRetries: 0,
      failedRetries: 0
    }
  }
}

// 导出单例
export const retryManager = new RetryManager()
