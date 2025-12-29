/**
 * 请求去重管理器
 * @description 实现请求防抖、节流和去重功能，防止重复请求
 */

import type { InternalRequestConfig, ApiResponse } from '../core/types'
import { generateCacheKey, logger, delay } from '../core/utils'

/**
 * 去重请求项
 */
interface DedupeItem<T = any> {
  /** 请求Promise */
  promise: Promise<T>
  /** 创建时间 */
  createdAt: number
  /** 取消函数 */
  cancel?: () => void
}

/**
 * 防抖请求项
 */
interface DebounceItem {
  /** 定时器ID */
  timer: ReturnType<typeof setTimeout>
  /** 等待中的resolve函数列表 */
  resolvers: Array<(value: any) => void>
  /** 等待中的reject函数列表 */
  rejectors: Array<(reason: any) => void>
  /** 最新的请求配置 */
  latestConfig: InternalRequestConfig
}

/**
 * 节流请求项
 */
interface ThrottleItem {
  /** 上次执行时间 */
  lastExecuteTime: number
  /** 上次响应结果 */
  lastResponse?: any
  /** 等待中的请求 */
  pending?: {
    config: InternalRequestConfig
    resolve: (value: any) => void
    reject: (reason: any) => void
  }
}

/**
 * 请求去重管理器
 */
export class DedupeManager {
  /** 正在进行的请求 */
  private pendingRequests: Map<string, DedupeItem> = new Map()
  /** 防抖请求 */
  private debounceRequests: Map<string, DebounceItem> = new Map()
  /** 节流请求 */
  private throttleRequests: Map<string, ThrottleItem> = new Map()

  /**
   * 生成请求唯一键
   */
  private getRequestKey(config: InternalRequestConfig): string {
    return generateCacheKey(config)
  }

  /**
   * 检查是否有重复请求
   */
  hasPending(config: InternalRequestConfig): boolean {
    const key = this.getRequestKey(config)
    return this.pendingRequests.has(key)
  }

  /**
   * 获取正在进行的请求
   */
  getPending<T>(config: InternalRequestConfig): Promise<T> | undefined {
    const key = this.getRequestKey(config)
    const item = this.pendingRequests.get(key)
    return item?.promise as Promise<T> | undefined
  }

  /**
   * 添加请求到去重列表
   */
  addPending<T>(config: InternalRequestConfig, promise: Promise<T>): void {
    if (config.allowDuplicate) return

    const key = this.getRequestKey(config)
    this.pendingRequests.set(key, {
      promise,
      createdAt: Date.now()
    })

    // 请求完成后自动清理
    promise.finally(() => {
      this.removePending(config)
    })

    logger.debug(`Dedupe: Added pending request ${key}`)
  }

  /**
   * 移除请求
   */
  removePending(config: InternalRequestConfig): void {
    const key = this.getRequestKey(config)
    this.pendingRequests.delete(key)
    logger.debug(`Dedupe: Removed pending request ${key}`)
  }

  /**
   * 处理去重请求
   * 如果有相同请求正在进行，返回该请求的Promise；否则返回undefined
   */
  async handleDedupe<T>(config: InternalRequestConfig): Promise<T | undefined> {
    if (config.allowDuplicate) return undefined

    const existingPromise = this.getPending<T>(config)
    if (existingPromise) {
      logger.info(`Dedupe: Returning existing request for ${config.url}`)
      return existingPromise
    }

    return undefined
  }

  /**
   * 防抖请求
   * @param config 请求配置
   * @param requestFn 实际请求函数
   * @returns Promise
   */
  async debounce<T>(
    config: InternalRequestConfig,
    requestFn: (config: InternalRequestConfig) => Promise<T>
  ): Promise<T> {
    const debounceTime = config.debounceTime
    if (!debounceTime || debounceTime <= 0) {
      return requestFn(config)
    }

    const key = this.getRequestKey(config)

    return new Promise<T>((resolve, reject) => {
      const existing = this.debounceRequests.get(key)

      if (existing) {
        // 清除之前的定时器
        clearTimeout(existing.timer)
        // 更新配置和添加新的resolver
        existing.latestConfig = config
        existing.resolvers.push(resolve)
        existing.rejectors.push(reject)
      } else {
        // 创建新的防抖项
        this.debounceRequests.set(key, {
          timer: setTimeout(() => {}, 0), // 临时定时器
          resolvers: [resolve],
          rejectors: [reject],
          latestConfig: config
        })
      }

      const item = this.debounceRequests.get(key)!

      // 重新设置定时器
      item.timer = setTimeout(async () => {
        const { latestConfig, resolvers, rejectors } = item
        this.debounceRequests.delete(key)

        try {
          logger.debug(`Debounce: Executing debounced request ${key}`)
          const result = await requestFn(latestConfig)
          resolvers.forEach((r) => r(result))
        } catch (error) {
          rejectors.forEach((r) => r(error))
        }
      }, debounceTime)
    })
  }

  /**
   * 节流请求
   * @param config 请求配置
   * @param requestFn 实际请求函数
   * @returns Promise
   */
  async throttle<T>(
    config: InternalRequestConfig,
    requestFn: (config: InternalRequestConfig) => Promise<T>
  ): Promise<T> {
    const throttleTime = config.throttleTime
    if (!throttleTime || throttleTime <= 0) {
      return requestFn(config)
    }

    const key = this.getRequestKey(config)
    const now = Date.now()
    const existing = this.throttleRequests.get(key)

    if (existing) {
      const timeSinceLastExecute = now - existing.lastExecuteTime

      if (timeSinceLastExecute < throttleTime) {
        // 在节流时间内，返回上次结果或等待
        if (existing.lastResponse !== undefined) {
          logger.debug(`Throttle: Returning cached response for ${key}`)
          return existing.lastResponse
        }

        // 如果没有上次结果，等待节流时间结束后执行
        return new Promise<T>((resolve, reject) => {
          const waitTime = throttleTime - timeSinceLastExecute

          if (existing.pending) {
            // 已有等待中的请求，使用最新配置
            existing.pending.config = config
            // 原来的请求会被忽略，使用新的resolve/reject
            existing.pending.resolve = resolve
            existing.pending.reject = reject
          } else {
            existing.pending = { config, resolve, reject }

            setTimeout(async () => {
              const pendingItem = this.throttleRequests.get(key)
              if (pendingItem?.pending) {
                const { config: pendingConfig, resolve: pendingResolve, reject: pendingReject } =
                  pendingItem.pending
                pendingItem.pending = undefined
                pendingItem.lastExecuteTime = Date.now()

                try {
                  const result = await requestFn(pendingConfig)
                  pendingItem.lastResponse = result
                  pendingResolve(result)
                } catch (error) {
                  pendingReject(error)
                }
              }
            }, waitTime)
          }
        })
      }
    }

    // 执行请求
    logger.debug(`Throttle: Executing request ${key}`)
    const result = await requestFn(config)

    // 更新节流记录
    this.throttleRequests.set(key, {
      lastExecuteTime: Date.now(),
      lastResponse: result
    })

    return result
  }

  /**
   * 取消防抖请求
   */
  cancelDebounce(config: InternalRequestConfig): boolean {
    const key = this.getRequestKey(config)
    const item = this.debounceRequests.get(key)

    if (item) {
      clearTimeout(item.timer)
      item.rejectors.forEach((r) => r(new Error('Debounce cancelled')))
      this.debounceRequests.delete(key)
      logger.debug(`Debounce: Cancelled ${key}`)
      return true
    }

    return false
  }

  /**
   * 清除所有防抖请求
   */
  clearDebounce(): void {
    this.debounceRequests.forEach((item) => {
      clearTimeout(item.timer)
      item.rejectors.forEach((r) => r(new Error('Debounce cleared')))
    })
    this.debounceRequests.clear()
  }

  /**
   * 清除节流缓存
   */
  clearThrottle(): void {
    this.throttleRequests.clear()
  }

  /**
   * 清除所有
   */
  clear(): void {
    this.pendingRequests.clear()
    this.clearDebounce()
    this.clearThrottle()
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    pendingCount: number
    debounceCount: number
    throttleCount: number
  } {
    return {
      pendingCount: this.pendingRequests.size,
      debounceCount: this.debounceRequests.size,
      throttleCount: this.throttleRequests.size
    }
  }
}

// 导出单例
export const dedupeManager = new DedupeManager()
