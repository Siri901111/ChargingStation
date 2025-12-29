/**
 * 请求队列管理器
 * @description 实现请求队列和并发控制功能
 *
 * 功能：
 * 1. 请求队列管理
 * 2. 并发数控制
 * 3. 优先级调度
 * 4. 队列暂停/恢复
 */

import type { QueueItem, InternalRequestConfig, RequestPriority } from '../core/types'
import { PRIORITY_WEIGHT, DEFAULT_MAX_CONCURRENT, MAX_QUEUE_SIZE } from '../core/constants'
import { generateRequestId, logger } from '../core/utils'

/**
 * 队列配置
 */
export interface QueueConfig {
  /** 最大并发数 */
  maxConcurrent: number
  /** 最大队列长度 */
  maxQueueSize: number
  /** 队列满时的策略 */
  overflowStrategy: 'reject' | 'drop-oldest' | 'drop-lowest-priority'
}

/**
 * 默认队列配置
 */
const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  maxConcurrent: DEFAULT_MAX_CONCURRENT,
  maxQueueSize: MAX_QUEUE_SIZE,
  overflowStrategy: 'reject'
}

/**
 * 请求队列管理器
 */
export class QueueManager {
  /** 等待队列 */
  private queue: QueueItem[] = []
  /** 正在执行的请求数 */
  private runningCount = 0
  /** 配置 */
  private config: QueueConfig
  /** 是否暂停 */
  private paused = false

  constructor(config?: Partial<QueueConfig>) {
    this.config = { ...DEFAULT_QUEUE_CONFIG, ...config }
  }

  /**
   * 添加请求到队列
   */
  enqueue<T>(
    config: InternalRequestConfig,
    executor: () => Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = config.requestId || generateRequestId()
      const priority = config.priority || 'normal'

      const item: QueueItem = {
        id,
        config,
        priority,
        createdAt: Date.now(),
        retryCount: 0,
        resolve,
        reject
      }

      // 检查队列是否已满
      if (this.queue.length >= this.config.maxQueueSize) {
        this.handleQueueOverflow(item)
      } else {
        this.addToQueue(item)
      }

      // 尝试执行队列
      this.processQueue(executor as () => Promise<any>)
    })
  }

  /**
   * 添加到队列（按优先级排序）
   */
  private addToQueue(item: QueueItem): void {
    const weight = PRIORITY_WEIGHT[item.priority]

    // 找到插入位置
    let insertIndex = this.queue.length
    for (let i = 0; i < this.queue.length; i++) {
      const existingWeight = PRIORITY_WEIGHT[this.queue[i].priority]
      if (weight > existingWeight) {
        insertIndex = i
        break
      }
    }

    this.queue.splice(insertIndex, 0, item)
    logger.debug(`Queue: Added request ${item.id} with priority ${item.priority}`)
  }

  /**
   * 处理队列溢出
   */
  private handleQueueOverflow(item: QueueItem): void {
    switch (this.config.overflowStrategy) {
      case 'reject':
        item.reject(new Error('Queue is full'))
        break

      case 'drop-oldest':
        const oldest = this.queue.shift()
        if (oldest) {
          oldest.reject(new Error('Dropped due to queue overflow'))
        }
        this.addToQueue(item)
        break

      case 'drop-lowest-priority':
        // 找到最低优先级的请求
        let lowestIndex = -1
        let lowestWeight = Infinity

        for (let i = this.queue.length - 1; i >= 0; i--) {
          const weight = PRIORITY_WEIGHT[this.queue[i].priority]
          if (weight < lowestWeight) {
            lowestWeight = weight
            lowestIndex = i
          }
        }

        const itemWeight = PRIORITY_WEIGHT[item.priority]
        if (lowestIndex >= 0 && itemWeight > lowestWeight) {
          const dropped = this.queue.splice(lowestIndex, 1)[0]
          dropped.reject(new Error('Dropped due to lower priority'))
          this.addToQueue(item)
        } else {
          item.reject(new Error('Queue is full and priority too low'))
        }
        break
    }
  }

  /**
   * 处理队列
   */
  private async processQueue(executor: () => Promise<any>): Promise<void> {
    if (this.paused) return

    while (
      this.runningCount < this.config.maxConcurrent &&
      this.queue.length > 0
    ) {
      const item = this.queue.shift()
      if (!item) break

      this.runningCount++
      logger.debug(`Queue: Executing request ${item.id}, running: ${this.runningCount}`)

      try {
        const result = await executor()
        item.resolve(result)
      } catch (error) {
        item.reject(error)
      } finally {
        this.runningCount--
        logger.debug(`Queue: Completed request ${item.id}, running: ${this.runningCount}`)

        // 继续处理队列
        if (!this.paused && this.queue.length > 0) {
          this.processQueue(executor)
        }
      }
    }
  }

  /**
   * 暂停队列
   */
  pause(): void {
    this.paused = true
    logger.info('Queue: Paused')
  }

  /**
   * 恢复队列
   */
  resume(executor: () => Promise<any>): void {
    this.paused = false
    logger.info('Queue: Resumed')
    this.processQueue(executor)
  }

  /**
   * 取消指定请求
   */
  cancel(requestId: string, reason?: string): boolean {
    const index = this.queue.findIndex((item) => item.id === requestId)
    if (index >= 0) {
      const item = this.queue.splice(index, 1)[0]
      item.reject(new Error(reason || 'Request cancelled'))
      logger.debug(`Queue: Cancelled request ${requestId}`)
      return true
    }
    return false
  }

  /**
   * 取消所有请求
   */
  cancelAll(reason?: string): void {
    while (this.queue.length > 0) {
      const item = this.queue.shift()!
      item.reject(new Error(reason || 'All requests cancelled'))
    }
    logger.info('Queue: Cancelled all requests')
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.cancelAll('Queue cleared')
  }

  /**
   * 获取队列长度
   */
  get length(): number {
    return this.queue.length
  }

  /**
   * 获取正在执行的请求数
   */
  get running(): number {
    return this.runningCount
  }

  /**
   * 是否暂停中
   */
  get isPaused(): boolean {
    return this.paused
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    queueLength: number
    running: number
    maxConcurrent: number
    paused: boolean
    priorityBreakdown: Record<RequestPriority, number>
  } {
    const priorityBreakdown: Record<RequestPriority, number> = {
      critical: 0,
      high: 0,
      normal: 0,
      low: 0
    }

    this.queue.forEach((item) => {
      priorityBreakdown[item.priority]++
    })

    return {
      queueLength: this.queue.length,
      running: this.runningCount,
      maxConcurrent: this.config.maxConcurrent,
      paused: this.paused,
      priorityBreakdown
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<QueueConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// 导出单例
export const queueManager = new QueueManager()
