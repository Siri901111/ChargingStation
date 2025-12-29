/**
 * 离线队列管理器
 * @description 实现离线请求缓存和自动重发功能
 *
 * 功能：
 * 1. 离线时缓存请求
 * 2. 网络恢复时自动重发
 * 3. 请求持久化存储
 * 4. 过期请求清理
 */

import type { OfflineQueueItem, InternalRequestConfig } from '../core/types'
import { STORAGE_KEYS } from '../core/constants'
import { generateRequestId, isOffline, logger, safeJSONParse, safeJSONStringify } from '../core/utils'

/**
 * 离线队列配置
 */
export interface OfflineQueueConfig {
  /** 是否启用 */
  enabled: boolean
  /** 最大队列长度 */
  maxSize: number
  /** 请求最大重试次数 */
  maxRetries: number
  /** 请求过期时间（毫秒） */
  expireTime: number
  /** 重发延迟（毫秒） */
  retryDelay: number
  /** 存储类型 */
  storage: 'localStorage' | 'indexedDB'
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: OfflineQueueConfig = {
  enabled: true,
  maxSize: 50,
  maxRetries: 3,
  expireTime: 24 * 60 * 60 * 1000, // 24小时
  retryDelay: 2000,
  storage: 'localStorage'
}

/**
 * 离线队列管理器
 */
export class OfflineQueueManager {
  /** 队列 */
  private queue: OfflineQueueItem[] = []
  /** 配置 */
  private config: OfflineQueueConfig
  /** 请求执行函数 */
  private executor?: (config: InternalRequestConfig) => Promise<any>
  /** 是否正在处理队列 */
  private processing = false
  /** 网络状态监听器是否已添加 */
  private listenerAdded = false

  constructor(config?: Partial<OfflineQueueConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.loadFromStorage()
    this.setupNetworkListener()
  }

  /**
   * 设置请求执行函数
   */
  setExecutor(executor: (config: InternalRequestConfig) => Promise<any>): void {
    this.executor = executor
  }

  /**
   * 添加请求到离线队列
   */
  add(config: InternalRequestConfig): boolean {
    if (!this.config.enabled) return false
    if (!config.offlineQueue) return false

    // 检查队列是否已满
    if (this.queue.length >= this.config.maxSize) {
      // 移除最早的请求
      this.queue.shift()
      logger.warn('Offline queue: Dropped oldest request due to queue full')
    }

    const item: OfflineQueueItem = {
      id: config.requestId || generateRequestId(),
      config: this.serializeConfig(config),
      createdAt: Date.now(),
      maxRetries: this.config.maxRetries,
      retryCount: 0
    }

    this.queue.push(item)
    this.saveToStorage()
    logger.info(`Offline queue: Added request ${item.id}`)

    return true
  }

  /**
   * 序列化配置（移除不能序列化的属性）
   */
  private serializeConfig(config: InternalRequestConfig): InternalRequestConfig {
    const serializable = { ...config }
    // 移除函数和不可序列化的属性
    delete serializable.onUploadProgress
    delete serializable.onDownloadProgress
    delete serializable.cancelToken
    delete serializable.signal
    delete serializable.transformRequest
    delete serializable.transformResponse
    delete serializable.onProgress
    return serializable
  }

  /**
   * 移除请求
   */
  remove(id: string): boolean {
    const index = this.queue.findIndex((item) => item.id === id)
    if (index >= 0) {
      this.queue.splice(index, 1)
      this.saveToStorage()
      return true
    }
    return false
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = []
    this.saveToStorage()
    logger.info('Offline queue: Cleared')
  }

  /**
   * 处理离线队列
   */
  async processQueue(): Promise<void> {
    if (!this.config.enabled) return
    if (this.processing) return
    if (isOffline()) return
    if (this.queue.length === 0) return
    if (!this.executor) {
      logger.warn('Offline queue: No executor set')
      return
    }

    this.processing = true
    logger.info(`Offline queue: Processing ${this.queue.length} requests`)

    // 清理过期请求
    this.clearExpired()

    const itemsToProcess = [...this.queue]

    for (const item of itemsToProcess) {
      if (isOffline()) {
        logger.info('Offline queue: Network went offline, stopping processing')
        break
      }

      try {
        // 标记为来自离线队列
        item.config._fromOfflineQueue = true

        await this.executor(item.config)
        this.remove(item.id)
        logger.info(`Offline queue: Successfully processed ${item.id}`)
      } catch (error) {
        item.retryCount++
        logger.warn(`Offline queue: Failed to process ${item.id}, retry ${item.retryCount}/${item.maxRetries}`)

        if (item.retryCount >= item.maxRetries) {
          this.remove(item.id)
          logger.error(`Offline queue: Removed ${item.id} after max retries`)
        } else {
          // 等待一段时间后继续
          await this.delay(this.config.retryDelay * item.retryCount)
        }
      }
    }

    this.saveToStorage()
    this.processing = false
  }

  /**
   * 清理过期请求
   */
  private clearExpired(): number {
    const now = Date.now()
    const expireTime = this.config.expireTime
    let count = 0

    this.queue = this.queue.filter((item) => {
      const isExpired = now - item.createdAt > expireTime
      if (isExpired) {
        count++
        logger.debug(`Offline queue: Expired request ${item.id}`)
      }
      return !isExpired
    })

    if (count > 0) {
      this.saveToStorage()
      logger.info(`Offline queue: Cleared ${count} expired requests`)
    }

    return count
  }

  /**
   * 设置网络状态监听
   */
  private setupNetworkListener(): void {
    if (this.listenerAdded) return
    if (typeof window === 'undefined') return

    window.addEventListener('online', () => {
      logger.info('Offline queue: Network online, processing queue')
      // 延迟一点处理，确保网络稳定
      setTimeout(() => {
        this.processQueue()
      }, 1000)
    })

    window.addEventListener('offline', () => {
      logger.info('Offline queue: Network offline')
    })

    this.listenerAdded = true
  }

  /**
   * 从存储加载
   */
  private loadFromStorage(): void {
    if (this.config.storage !== 'localStorage') return

    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)
      if (data) {
        this.queue = safeJSONParse<OfflineQueueItem[]>(data, [])
        logger.debug(`Offline queue: Loaded ${this.queue.length} requests from storage`)
      }
    } catch (e) {
      logger.warn('Offline queue: Failed to load from storage', e)
    }
  }

  /**
   * 保存到存储
   */
  private saveToStorage(): void {
    if (this.config.storage !== 'localStorage') return

    try {
      const data = safeJSONStringify(this.queue)
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, data)
    } catch (e) {
      logger.warn('Offline queue: Failed to save to storage', e)
    }
  }

  /**
   * 延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 获取队列长度
   */
  get length(): number {
    return this.queue.length
  }

  /**
   * 是否正在处理
   */
  get isProcessing(): boolean {
    return this.processing
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    length: number
    processing: boolean
    enabled: boolean
    oldestRequest: number | null
  } {
    return {
      length: this.queue.length,
      processing: this.processing,
      enabled: this.config.enabled,
      oldestRequest: this.queue.length > 0 ? this.queue[0].createdAt : null
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<OfflineQueueConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// 导出单例
export const offlineQueueManager = new OfflineQueueManager()
