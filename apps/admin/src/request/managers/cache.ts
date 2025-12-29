/**
 * 增强版缓存管理器
 * @description 支持多种缓存策略和持久化存储
 */

import type { CacheEntry, CacheConfig, CacheStrategy, InternalRequestConfig } from '../core/types'
import { DEFAULT_CACHE_CONFIG, STORAGE_KEYS } from '../core/constants'
import { generateCacheKey, logger, safeJSONParse, safeJSONStringify } from '../core/utils'

/**
 * 缓存管理器
 */
export class CacheManager {
  /** 内存缓存 */
  private memoryCache: Map<string, CacheEntry> = new Map()
  /** 配置 */
  private config: CacheConfig

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }
    this.loadFromStorage()
    this.startCleanupTimer()
  }

  /**
   * 获取缓存
   */
  get<T = any>(config: InternalRequestConfig): T | null {
    if (!config.cache) return null

    const key = this.getKey(config)
    const entry = this.memoryCache.get(key)

    if (!entry) return null

    // 检查是否过期
    if (Date.now() > entry.expireAt) {
      this.delete(key)
      return null
    }

    logger.debug(`Cache: Hit for ${key}`)
    return entry.data as T
  }

  /**
   * 设置缓存
   */
  set<T = any>(config: InternalRequestConfig, data: T, options?: { tags?: string[]; etag?: string }): void {
    if (!config.cache) return

    const key = this.getKey(config)
    const ttl = config.cacheTime || this.config.defaultTTL

    // 检查缓存数量限制
    if (this.memoryCache.size >= this.config.maxEntries) {
      this.evict()
    }

    const entry: CacheEntry<T> = {
      data,
      expireAt: Date.now() + ttl,
      createdAt: Date.now(),
      tags: options?.tags,
      etag: options?.etag
    }

    this.memoryCache.set(key, entry)
    this.saveToStorage()
    logger.debug(`Cache: Set for ${key}`)
  }

  /**
   * 根据缓存策略获取数据
   */
  async getWithStrategy<T>(
    config: InternalRequestConfig,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const strategy = config.cacheStrategy || 'network-first'
    const cached = this.get<T>(config)

    switch (strategy) {
      case 'cache-first':
        if (cached !== null) return cached
        const freshData = await fetchFn()
        this.set(config, freshData)
        return freshData

      case 'network-first':
        try {
          const networkData = await fetchFn()
          this.set(config, networkData)
          return networkData
        } catch (error) {
          if (cached !== null) {
            logger.info('Cache: Returning cached data due to network error')
            return cached
          }
          throw error
        }

      case 'cache-only':
        if (cached !== null) return cached
        throw new Error('No cached data available')

      case 'network-only':
        return fetchFn()

      case 'stale-while-revalidate':
        if (cached !== null) {
          // 返回缓存，同时后台更新
          fetchFn().then((data) => {
            this.set(config, data)
          }).catch(() => {
            // 静默处理更新错误
          })
          return cached
        }
        const data = await fetchFn()
        this.set(config, data)
        return data

      default:
        return fetchFn()
    }
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    const result = this.memoryCache.delete(key)
    this.saveToStorage()
    return result
  }

  /**
   * 按标签删除缓存
   */
  deleteByTag(tag: string): number {
    let count = 0
    this.memoryCache.forEach((entry, key) => {
      if (entry.tags?.includes(tag)) {
        this.memoryCache.delete(key)
        count++
      }
    })
    if (count > 0) {
      this.saveToStorage()
    }
    return count
  }

  /**
   * 按URL模式删除缓存
   */
  deleteByPattern(pattern: string | RegExp): number {
    let count = 0
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern

    this.memoryCache.forEach((_, key) => {
      if (regex.test(key)) {
        this.memoryCache.delete(key)
        count++
      }
    })

    if (count > 0) {
      this.saveToStorage()
    }
    return count
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.memoryCache.clear()
    this.saveToStorage()
    logger.info('Cache: Cleared all')
  }

  /**
   * 清除过期缓存
   */
  clearExpired(): number {
    const now = Date.now()
    let count = 0

    this.memoryCache.forEach((entry, key) => {
      if (now > entry.expireAt) {
        this.memoryCache.delete(key)
        count++
      }
    })

    if (count > 0) {
      this.saveToStorage()
      logger.debug(`Cache: Cleared ${count} expired entries`)
    }

    return count
  }

  /**
   * 获取缓存数量
   */
  get size(): number {
    return this.memoryCache.size
  }

  /**
   * 获取缓存键
   */
  private getKey(config: InternalRequestConfig): string {
    return this.config.keyPrefix + generateCacheKey(config)
  }

  /**
   * 淘汰缓存（LRU）
   */
  private evict(): void {
    // 先清除过期缓存
    this.clearExpired()

    // 如果仍然超过限制，删除最早创建的缓存
    if (this.memoryCache.size >= this.config.maxEntries) {
      let oldestKey: string | null = null
      let oldestTime = Infinity

      this.memoryCache.forEach((entry, key) => {
        if (entry.createdAt < oldestTime) {
          oldestTime = entry.createdAt
          oldestKey = key
        }
      })

      if (oldestKey) {
        this.memoryCache.delete(oldestKey)
      }
    }
  }

  /**
   * 从存储加载缓存
   */
  private loadFromStorage(): void {
    if (!this.config.persistent) return

    try {
      const storage = this.getStorage()
      const data = storage?.getItem(STORAGE_KEYS.HTTP_CACHE)
      if (data) {
        const entries = safeJSONParse<[string, CacheEntry][]>(data, [])
        this.memoryCache = new Map(entries)
        this.clearExpired()
      }
    } catch (e) {
      logger.warn('Cache: Failed to load from storage', e)
    }
  }

  /**
   * 保存缓存到存储
   */
  private saveToStorage(): void {
    if (!this.config.persistent) return

    try {
      const storage = this.getStorage()
      const data = safeJSONStringify(Array.from(this.memoryCache.entries()))
      storage?.setItem(STORAGE_KEYS.HTTP_CACHE, data)
    } catch (e) {
      logger.warn('Cache: Failed to save to storage', e)
    }
  }

  /**
   * 获取存储对象
   */
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null

    switch (this.config.storage) {
      case 'localStorage':
        return localStorage
      case 'sessionStorage':
        return sessionStorage
      default:
        return null
    }
  }

  /**
   * 启动定期清理定时器
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.clearExpired()
    }, 60 * 1000) // 每分钟清理一次
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    size: number
    maxEntries: number
    enabled: boolean
    persistent: boolean
  } {
    return {
      size: this.memoryCache.size,
      maxEntries: this.config.maxEntries,
      enabled: this.config.enabled,
      persistent: this.config.persistent || false
    }
  }
}

// 导出单例
export const cacheManager = new CacheManager()
