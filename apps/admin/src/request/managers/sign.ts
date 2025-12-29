/**
 * 请求签名管理器
 * @description 实现请求签名和安全机制
 *
 * 功能：
 * 1. 请求签名生成
 * 2. 时间戳验证
 * 3. Nonce 防重放
 * 4. 参数排序和规范化
 *
 * 签名算法：
 * 1. 将请求参数按字母顺序排序
 * 2. 拼接成 key1=value1&key2=value2 格式
 * 3. 追加时间戳和 nonce
 * 4. 使用 HMAC-SHA256 计算签名
 */

import type { InternalRequestConfig } from '../core/types'
import { HEADERS, SIGN_EXPIRE_TIME, NONCE_LENGTH } from '../core/constants'
import { generateNonce, sortObject, logger } from '../core/utils'

/**
 * 签名配置
 */
export interface SignConfig {
  /** 是否启用签名 */
  enabled: boolean
  /** 签名密钥 */
  secret: string
  /** 签名算法 */
  algorithm: 'HmacSHA256' | 'HmacSHA512' | 'HmacMD5'
  /** 签名有效期（毫秒） */
  expireTime: number
  /** 是否验证 Nonce */
  validateNonce: boolean
  /** Nonce 缓存时间（毫秒） */
  nonceCacheTime: number
}

/**
 * 默认签名配置
 */
const DEFAULT_SIGN_CONFIG: SignConfig = {
  enabled: false,
  secret: '',
  algorithm: 'HmacSHA256',
  expireTime: SIGN_EXPIRE_TIME,
  validateNonce: true,
  nonceCacheTime: 10 * 60 * 1000 // 10分钟
}

/**
 * 签名管理器
 */
export class SignManager {
  /** 配置 */
  private config: SignConfig
  /** Nonce 缓存（用于防重放） */
  private nonceCache: Map<string, number> = new Map()

  constructor(config?: Partial<SignConfig>) {
    this.config = { ...DEFAULT_SIGN_CONFIG, ...config }
    this.startNonceCleanup()
  }

  /**
   * 检查是否需要签名
   */
  needsSign(config: InternalRequestConfig): boolean {
    if (!this.config.enabled) return false
    return config.sign !== false // 默认需要签名（如果启用了全局签名）
  }

  /**
   * 生成签名
   */
  async generateSignature(config: InternalRequestConfig): Promise<string> {
    const timestamp = Date.now()
    const nonce = generateNonce(NONCE_LENGTH)

    // 构建待签名字符串
    const signString = this.buildSignString(config, timestamp, nonce)

    // 计算签名
    const signature = await this.hmacSign(signString, this.config.secret)

    // 保存签名相关信息到配置
    config._timestamp = timestamp
    config._nonce = nonce
    config._signature = signature

    logger.debug(`Sign: Generated signature for ${config.url}`)

    return signature
  }

  /**
   * 构建待签名字符串
   */
  private buildSignString(
    config: InternalRequestConfig,
    timestamp: number,
    nonce: string
  ): string {
    const parts: string[] = []

    // 添加请求方法
    parts.push(`method=${config.method}`)

    // 添加请求路径
    parts.push(`path=${config.url}`)

    // 添加时间戳
    parts.push(`timestamp=${timestamp}`)

    // 添加 Nonce
    parts.push(`nonce=${nonce}`)

    // 添加排序后的参数
    if (config.params) {
      const sortedParams = sortObject(config.params)
      Object.entries(sortedParams).forEach(([key, value]) => {
        parts.push(`${key}=${this.normalizeValue(value)}`)
      })
    }

    // 添加排序后的请求体（非 FormData）
    if (config.data && !(config.data instanceof FormData)) {
      const sortedData = sortObject(config.data)
      Object.entries(sortedData).forEach(([key, value]) => {
        parts.push(`${key}=${this.normalizeValue(value)}`)
      })
    }

    // 排序并连接
    parts.sort()
    return parts.join('&')
  }

  /**
   * 规范化值
   */
  private normalizeValue(value: any): string {
    if (value === null || value === undefined) {
      return ''
    }
    if (typeof value === 'object') {
      return JSON.stringify(sortObject(value))
    }
    return String(value)
  }

  /**
   * HMAC 签名
   */
  private async hmacSign(message: string, secret: string): Promise<string> {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(message)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: this.getHashAlgorithm() },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)

    // 转换为十六进制字符串
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * 获取哈希算法名称
   */
  private getHashAlgorithm(): string {
    switch (this.config.algorithm) {
      case 'HmacSHA256':
        return 'SHA-256'
      case 'HmacSHA512':
        return 'SHA-512'
      case 'HmacMD5':
        return 'MD5'
      default:
        return 'SHA-256'
    }
  }

  /**
   * 验证签名（用于服务端，这里提供参考实现）
   */
  async verifySignature(
    config: InternalRequestConfig,
    signature: string,
    timestamp: number,
    nonce: string
  ): Promise<{ valid: boolean; reason?: string }> {
    // 验证时间戳
    const now = Date.now()
    if (Math.abs(now - timestamp) > this.config.expireTime) {
      return { valid: false, reason: 'Timestamp expired' }
    }

    // 验证 Nonce（防重放）
    if (this.config.validateNonce) {
      if (this.nonceCache.has(nonce)) {
        return { valid: false, reason: 'Nonce already used' }
      }
      this.nonceCache.set(nonce, now)
    }

    // 验证签名
    const expectedSignature = await this.hmacSign(
      this.buildSignString(config, timestamp, nonce),
      this.config.secret
    )

    if (signature !== expectedSignature) {
      return { valid: false, reason: 'Invalid signature' }
    }

    return { valid: true }
  }

  /**
   * 应用签名到请求配置
   */
  async applyToConfig(config: InternalRequestConfig): Promise<InternalRequestConfig> {
    if (!this.needsSign(config)) {
      return config
    }

    const timestamp = Date.now()
    const nonce = generateNonce(NONCE_LENGTH)
    const signString = this.buildSignString(config, timestamp, nonce)
    const signature = await this.hmacSign(signString, this.config.secret)

    // 添加签名相关请求头
    config.headers = config.headers || {}
    config.headers[HEADERS.TIMESTAMP] = String(timestamp)
    config.headers[HEADERS.NONCE] = nonce
    config.headers[HEADERS.SIGNATURE] = signature

    config._timestamp = timestamp
    config._nonce = nonce
    config._signature = signature

    return config
  }

  /**
   * 启动 Nonce 清理定时器
   */
  private startNonceCleanup(): void {
    setInterval(() => {
      const now = Date.now()
      const expireTime = this.config.nonceCacheTime

      this.nonceCache.forEach((timestamp, nonce) => {
        if (now - timestamp > expireTime) {
          this.nonceCache.delete(nonce)
        }
      })
    }, 60 * 1000) // 每分钟清理一次
  }

  /**
   * 清除 Nonce 缓存
   */
  clearNonceCache(): void {
    this.nonceCache.clear()
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SignConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 设置密钥
   */
  setSecret(secret: string): void {
    this.config.secret = secret
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    enabled: boolean
    algorithm: string
    nonceCacheSize: number
  } {
    return {
      enabled: this.config.enabled,
      algorithm: this.config.algorithm,
      nonceCacheSize: this.nonceCache.size
    }
  }
}

// 导出单例
export const signManager = new SignManager()
