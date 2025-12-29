/**
 * Token 管理器
 * @description 实现 Token 的存储、刷新和自动续期功能
 *
 * 功能：
 * 1. Token 存储和获取
 * 2. Token 过期检测
 * 3. Token 自动刷新（在即将过期时）
 * 4. 刷新 Token 时的请求队列管理
 * 5. 刷新失败的处理策略
 */

import type { TokenInfo, TokenRefreshConfig, InternalRequestConfig } from '../core/types'
import { DEFAULT_TOKEN_REFRESH_CONFIG, STORAGE_KEYS, AUTH_WHITE_LIST } from '../core/constants'
import { isInWhiteList, logger, safeJSONParse, safeJSONStringify } from '../core/utils'

/**
 * Token 管理器
 */
export class TokenManager {
  /** Token 信息 */
  private tokenInfo: TokenInfo | null = null
  /** 刷新配置 */
  private config: TokenRefreshConfig
  /** 是否正在刷新 Token */
  private isRefreshing = false
  /** 等待刷新完成的请求队列 */
  private refreshQueue: Array<{
    resolve: (token: string) => void
    reject: (error: Error) => void
  }> = []
  /** 刷新 Token 的函数（由外部注入） */
  private refreshFn?: (refreshToken: string) => Promise<TokenInfo>
  /** 登出函数（由外部注入） */
  private logoutFn?: () => void

  constructor(config?: Partial<TokenRefreshConfig>) {
    this.config = { ...DEFAULT_TOKEN_REFRESH_CONFIG, ...config }
    this.loadFromStorage()
  }

  /**
   * 设置 Token 信息
   */
  setToken(tokenInfo: TokenInfo): void {
    this.tokenInfo = tokenInfo
    this.saveToStorage()
    logger.debug('Token: Set new token')
  }

  /**
   * 获取 Token
   */
  getToken(): string | null {
    return this.tokenInfo?.accessToken || null
  }

  /**
   * 获取刷新 Token
   */
  getRefreshToken(): string | null {
    return this.tokenInfo?.refreshToken || null
  }

  /**
   * 获取 Token 信息
   */
  getTokenInfo(): TokenInfo | null {
    return this.tokenInfo
  }

  /**
   * 清除 Token
   */
  clearToken(): void {
    this.tokenInfo = null
    this.clearStorage()
    logger.debug('Token: Cleared')
  }

  /**
   * 检查 Token 是否存在
   */
  hasToken(): boolean {
    return !!this.tokenInfo?.accessToken
  }

  /**
   * 检查 Token 是否过期
   */
  isTokenExpired(): boolean {
    if (!this.tokenInfo?.expiresAt) {
      return false // 没有过期时间，认为不过期
    }
    return Date.now() >= this.tokenInfo.expiresAt
  }

  /**
   * 检查 Token 是否即将过期（需要刷新）
   */
  isTokenExpiringSoon(): boolean {
    if (!this.config.enabled || !this.tokenInfo?.expiresAt) {
      return false
    }
    const timeUntilExpiry = this.tokenInfo.expiresAt - Date.now()
    return timeUntilExpiry > 0 && timeUntilExpiry <= this.config.refreshThreshold
  }

  /**
   * 检查请求是否需要 Token
   */
  needsToken(config: InternalRequestConfig): boolean {
    if (config.skipAuth) return false
    return !isInWhiteList(config.url, AUTH_WHITE_LIST)
  }

  /**
   * 注册刷新 Token 函数
   */
  setRefreshFn(fn: (refreshToken: string) => Promise<TokenInfo>): void {
    this.refreshFn = fn
  }

  /**
   * 注册登出函数
   */
  setLogoutFn(fn: () => void): void {
    this.logoutFn = fn
  }

  /**
   * 刷新 Token
   */
  async refreshToken(): Promise<string> {
    // 如果正在刷新，将请求加入队列
    if (this.isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject })
      })
    }

    // 检查是否有刷新 Token
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      this.handleRefreshFailed(new Error('No refresh token available'))
      throw new Error('No refresh token available')
    }

    // 检查是否有刷新函数
    if (!this.refreshFn) {
      this.handleRefreshFailed(new Error('Refresh function not set'))
      throw new Error('Refresh function not set')
    }

    this.isRefreshing = true
    logger.info('Token: Starting refresh')

    try {
      const newTokenInfo = await this.refreshFn(refreshToken)
      this.setToken(newTokenInfo)

      // 处理等待队列中的请求
      const accessToken = newTokenInfo.accessToken
      this.refreshQueue.forEach(({ resolve }) => resolve(accessToken))
      this.refreshQueue = []

      logger.info('Token: Refresh successful')
      return accessToken
    } catch (error) {
      // 处理等待队列中的请求
      this.refreshQueue.forEach(({ reject }) => reject(error as Error))
      this.refreshQueue = []

      this.handleRefreshFailed(error as Error)
      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * 处理刷新失败
   */
  private handleRefreshFailed(error: Error): void {
    logger.error('Token: Refresh failed', error)

    switch (this.config.onRefreshFailed) {
      case 'logout':
        this.clearToken()
        this.logoutFn?.()
        break
      case 'retry':
        // 重试逻辑可以在外部实现
        break
      case 'ignore':
        // 忽略错误
        break
    }
  }

  /**
   * 确保 Token 有效
   * 如果 Token 即将过期，自动刷新
   */
  async ensureValidToken(): Promise<string | null> {
    // 没有 Token
    if (!this.hasToken()) {
      return null
    }

    // Token 已过期
    if (this.isTokenExpired()) {
      if (this.getRefreshToken()) {
        try {
          return await this.refreshToken()
        } catch {
          return null
        }
      }
      return null
    }

    // Token 即将过期，后台刷新
    if (this.isTokenExpiringSoon()) {
      // 不等待刷新完成，直接返回当前 Token
      this.refreshToken().catch(() => {
        // 静默处理刷新错误
      })
    }

    return this.getToken()
  }

  /**
   * 应用 Token 到请求配置
   */
  async applyToConfig(config: InternalRequestConfig): Promise<InternalRequestConfig> {
    if (!this.needsToken(config)) {
      return config
    }

    const token = await this.ensureValidToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
      config.headers['token'] = token // 兼容旧接口
    }

    return config
  }

  /**
   * 从存储加载 Token
   */
  private loadFromStorage(): void {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN)
      const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      const expiresAtStr = sessionStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)

      if (token) {
        this.tokenInfo = {
          accessToken: token,
          refreshToken: refreshToken || undefined,
          expiresAt: expiresAtStr ? parseInt(expiresAtStr, 10) : undefined
        }
      }
    } catch (e) {
      logger.warn('Token: Failed to load from storage', e)
    }
  }

  /**
   * 保存 Token 到存储
   */
  private saveToStorage(): void {
    try {
      if (this.tokenInfo) {
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, this.tokenInfo.accessToken)
        if (this.tokenInfo.refreshToken) {
          sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, this.tokenInfo.refreshToken)
        }
        if (this.tokenInfo.expiresAt) {
          sessionStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, String(this.tokenInfo.expiresAt))
        }
      }
    } catch (e) {
      logger.warn('Token: Failed to save to storage', e)
    }
  }

  /**
   * 清除存储中的 Token
   */
  private clearStorage(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
    } catch (e) {
      logger.warn('Token: Failed to clear storage', e)
    }
  }

  /**
   * 获取 Token 状态
   */
  getStatus(): {
    hasToken: boolean
    isExpired: boolean
    isExpiringSoon: boolean
    expiresIn: number | null
  } {
    const hasToken = this.hasToken()
    const isExpired = this.isTokenExpired()
    const isExpiringSoon = this.isTokenExpiringSoon()
    const expiresIn = this.tokenInfo?.expiresAt ? this.tokenInfo.expiresAt - Date.now() : null

    return {
      hasToken,
      isExpired,
      isExpiringSoon,
      expiresIn
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<TokenRefreshConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// 导出单例
export const tokenManager = new TokenManager()
