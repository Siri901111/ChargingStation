/**
 * 请求取消管理器
 * @description 管理请求的取消功能，支持取消单个或全部请求
 */

import axios, { CancelTokenSource } from 'axios'
import type { InternalRequestConfig } from '../core/types'
import { generateCacheKey, logger } from '../core/utils'

/**
 * 请求取消管理器
 */
export class CancelManager {
  /** 待处理请求 Map */
  private pendingRequests: Map<string, CancelTokenSource> = new Map()
  /** 取消原因记录 */
  private cancelReasons: Map<string, string> = new Map()

  /**
   * 生成请求唯一标识
   */
  private getRequestKey(config: InternalRequestConfig): string {
    return config.requestId || generateCacheKey(config)
  }

  /**
   * 添加请求到待处理列表
   */
  add(config: InternalRequestConfig): InternalRequestConfig {
    const key = this.getRequestKey(config)

    // 如果不允许重复请求，先取消之前的请求
    if (!config.allowDuplicate) {
      this.remove(config)
    }

    // 创建取消令牌
    const source = axios.CancelToken.source()
    config.cancelToken = source.token
    this.pendingRequests.set(key, source)

    logger.debug(`Cancel: Added request ${key}`)
    return config
  }

  /**
   * 移除请求（取消请求）
   */
  remove(config: InternalRequestConfig): void {
    const key = this.getRequestKey(config)
    if (this.pendingRequests.has(key)) {
      const source = this.pendingRequests.get(key)!
      source.cancel(`Request cancelled: ${key}`)
      this.pendingRequests.delete(key)
      logger.debug(`Cancel: Removed request ${key}`)
    }
  }

  /**
   * 请求完成后清理
   */
  clear(config: InternalRequestConfig): void {
    const key = this.getRequestKey(config)
    this.pendingRequests.delete(key)
    this.cancelReasons.delete(key)
  }

  /**
   * 取消指定请求
   */
  cancel(requestId: string, reason?: string): boolean {
    if (this.pendingRequests.has(requestId)) {
      const source = this.pendingRequests.get(requestId)!
      const cancelReason = reason || `Request cancelled: ${requestId}`
      source.cancel(cancelReason)
      this.pendingRequests.delete(requestId)
      this.cancelReasons.set(requestId, cancelReason)
      logger.info(`Cancel: Cancelled request ${requestId}`)
      return true
    }
    return false
  }

  /**
   * 批量取消请求
   */
  cancelBatch(requestIds: string[], reason?: string): number {
    let count = 0
    requestIds.forEach((id) => {
      if (this.cancel(id, reason)) {
        count++
      }
    })
    return count
  }

  /**
   * 按URL模式取消请求
   */
  cancelByPattern(pattern: string | RegExp, reason?: string): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    let count = 0

    this.pendingRequests.forEach((source, key) => {
      if (regex.test(key)) {
        const cancelReason = reason || `Request cancelled by pattern: ${pattern}`
        source.cancel(cancelReason)
        this.pendingRequests.delete(key)
        this.cancelReasons.set(key, cancelReason)
        count++
      }
    })

    if (count > 0) {
      logger.info(`Cancel: Cancelled ${count} requests by pattern`)
    }

    return count
  }

  /**
   * 取消所有请求
   */
  cancelAll(reason?: string): void {
    const cancelReason = reason || 'All requests cancelled'
    this.pendingRequests.forEach((source, key) => {
      source.cancel(cancelReason)
      this.cancelReasons.set(key, cancelReason)
    })
    this.pendingRequests.clear()
    logger.info('Cancel: Cancelled all requests')
  }

  /**
   * 获取取消原因
   */
  getCancelReason(requestId: string): string | undefined {
    return this.cancelReasons.get(requestId)
  }

  /**
   * 获取待处理请求数量
   */
  get pendingCount(): number {
    return this.pendingRequests.size
  }

  /**
   * 检查请求是否在待处理中
   */
  isPending(requestId: string): boolean {
    return this.pendingRequests.has(requestId)
  }

  /**
   * 获取所有待处理请求的 ID
   */
  getPendingRequestIds(): string[] {
    return Array.from(this.pendingRequests.keys())
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    pendingCount: number
    cancelledCount: number
  } {
    return {
      pendingCount: this.pendingRequests.size,
      cancelledCount: this.cancelReasons.size
    }
  }
}

// 导出单例
export const cancelManager = new CancelManager()
