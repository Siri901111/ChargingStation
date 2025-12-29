/**
 * 幂等性管理器
 * @description 实现请求幂等性控制，防止重复提交
 *
 * 幂等性是指同一个请求执行多次，产生的效果与执行一次相同。
 * 对于非幂等的 HTTP 方法（POST、PATCH），需要通过幂等键来保证请求不会重复执行。
 */

import type { IdempotencyRecord, IdempotencyConfig, InternalRequestConfig } from './types'
import { DEFAULT_IDEMPOTENCY_CONFIG, IDEMPOTENCY_WHITE_LIST, STORAGE_KEYS, HEADERS } from './constants'
import { generateIdempotencyKey, isInWhiteList, safeJSONParse, safeJSONStringify, logger } from './utils'

/**
 * 幂等性管理器
 */
export class IdempotencyManager {
  /** 幂等性记录存储 */
  private records: Map<string, IdempotencyRecord> = new Map()
  /** 配置 */
  private config: IdempotencyConfig
  /** 正在进行中的请求 Promise */
  private pendingRequests: Map<string, Promise<any>> = new Map()

  constructor(config?: Partial<IdempotencyConfig>) {
    this.config = { ...DEFAULT_IDEMPOTENCY_CONFIG, ...config }
    this.loadFromStorage()
    this.startCleanupTimer()
  }

  /**
   * 检查请求是否需要幂等控制
   */
  needsIdempotency(config: InternalRequestConfig): boolean {
    if (!this.config.enabled) return false

    // GET、HEAD、OPTIONS 请求天然幂等，不需要控制
    const idempotentMethods = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']
    if (idempotentMethods.includes(config.method)) return false

    // 检查白名单
    if (isInWhiteList(config.url, IDEMPOTENCY_WHITE_LIST)) return false

    return true
  }

  /**
   * 获取或生成幂等键
   */
  getIdempotencyKey(config: InternalRequestConfig): string {
    // 优先使用配置中的幂等键
    if (config.idempotencyKey) {
      return config.idempotencyKey
    }
    // 自动生成幂等键
    return generateIdempotencyKey()
  }

  /**
   * 检查幂等键是否已存在
   */
  has(key: string): boolean {
    return this.records.has(key)
  }

  /**
   * 获取幂等性记录
   */
  get(key: string): IdempotencyRecord | undefined {
    const record = this.records.get(key)
    if (!record) return undefined

    // 检查是否过期
    if (Date.now() > record.expireAt) {
      this.delete(key)
      return undefined
    }

    return record
  }

  /**
   * 设置幂等性记录（请求开始时）
   */
  setPending(key: string, config: InternalRequestConfig): void {
    const record: IdempotencyRecord = {
      key,
      url: config.url,
      method: config.method,
      createdAt: Date.now(),
      expireAt: Date.now() + this.config.ttl,
      status: 'pending'
    }
    this.records.set(key, record)
    this.saveToStorage()
    logger.debug(`Idempotency: Set pending for key ${key}`)
  }

  /**
   * 更新幂等性记录（请求完成时）
   */
  setCompleted(key: string, response: any): void {
    const record = this.records.get(key)
    if (record) {
      record.status = 'completed'
      record.response = response
      this.records.set(key, record)
      this.saveToStorage()
      logger.debug(`Idempotency: Set completed for key ${key}`)
    }
  }

  /**
   * 更新幂等性记录（请求失败时）
   */
  setFailed(key: string): void {
    const record = this.records.get(key)
    if (record) {
      record.status = 'failed'
      this.records.set(key, record)
      this.saveToStorage()
      logger.debug(`Idempotency: Set failed for key ${key}`)
    }
  }

  /**
   * 删除幂等性记录
   */
  delete(key: string): boolean {
    const result = this.records.delete(key)
    this.saveToStorage()
    return result
  }

  /**
   * 清除所有记录
   */
  clear(): void {
    this.records.clear()
    this.pendingRequests.clear()
    this.saveToStorage()
  }

  /**
   * 清除过期记录
   */
  clearExpired(): number {
    const now = Date.now()
    let count = 0

    this.records.forEach((record, key) => {
      if (now > record.expireAt) {
        this.records.delete(key)
        count++
      }
    })

    if (count > 0) {
      this.saveToStorage()
      logger.debug(`Idempotency: Cleared ${count} expired records`)
    }

    return count
  }

  /**
   * 添加正在进行中的请求
   */
  addPendingRequest(key: string, promise: Promise<any>): void {
    this.pendingRequests.set(key, promise)
  }

  /**
   * 获取正在进行中的请求
   */
  getPendingRequest(key: string): Promise<any> | undefined {
    return this.pendingRequests.get(key)
  }

  /**
   * 移除正在进行中的请求
   */
  removePendingRequest(key: string): void {
    this.pendingRequests.delete(key)
  }

  /**
   * 处理幂等请求
   * @returns 如果返回响应数据，说明请求已处理过；返回 undefined 说明需要发送新请求
   */
  async handleIdempotentRequest(
    key: string,
    config: InternalRequestConfig
  ): Promise<{ cached: boolean; data?: any }> {
    // 检查是否有已完成的记录
    const record = this.get(key)
    if (record) {
      if (record.status === 'completed' && record.response) {
        logger.info(`Idempotency: Returning cached response for key ${key}`)
        return { cached: true, data: record.response }
      }

      // 如果有正在进行中的请求，等待其完成
      if (record.status === 'pending') {
        const pendingPromise = this.getPendingRequest(key)
        if (pendingPromise) {
          logger.info(`Idempotency: Waiting for pending request with key ${key}`)
          const data = await pendingPromise
          return { cached: true, data }
        }
      }
    }

    return { cached: false }
  }

  /**
   * 应用幂等键到请求配置
   */
  applyToConfig(config: InternalRequestConfig): InternalRequestConfig {
    if (!this.needsIdempotency(config)) {
      return config
    }

    const key = this.getIdempotencyKey(config)
    config.idempotencyKey = key
    config.headers = config.headers || {}
    config.headers[this.config.headerName] = key

    return config
  }

  /**
   * 从存储加载记录
   */
  private loadFromStorage(): void {
    if (this.config.storage === 'memory') return

    try {
      const storage = this.config.storage === 'localStorage' ? localStorage : sessionStorage
      const data = storage.getItem(STORAGE_KEYS.IDEMPOTENCY_CACHE)
      if (data) {
        const records = safeJSONParse<[string, IdempotencyRecord][]>(data, [])
        this.records = new Map(records)
        // 清除过期记录
        this.clearExpired()
      }
    } catch (e) {
      logger.warn('Failed to load idempotency records from storage', e)
    }
  }

  /**
   * 保存记录到存储
   */
  private saveToStorage(): void {
    if (this.config.storage === 'memory') return

    try {
      const storage = this.config.storage === 'localStorage' ? localStorage : sessionStorage
      const data = safeJSONStringify(Array.from(this.records.entries()))
      storage.setItem(STORAGE_KEYS.IDEMPOTENCY_CACHE, data)
    } catch (e) {
      logger.warn('Failed to save idempotency records to storage', e)
    }
  }

  /**
   * 启动定期清理定时器
   */
  private startCleanupTimer(): void {
    // 每分钟清理一次过期记录
    setInterval(() => {
      this.clearExpired()
    }, 60 * 1000)
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number
    pending: number
    completed: number
    failed: number
  } {
    let pending = 0
    let completed = 0
    let failed = 0

    this.records.forEach((record) => {
      switch (record.status) {
        case 'pending':
          pending++
          break
        case 'completed':
          completed++
          break
        case 'failed':
          failed++
          break
      }
    })

    return {
      total: this.records.size,
      pending,
      completed,
      failed
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<IdempotencyConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// 导出单例
export const idempotencyManager = new IdempotencyManager()
