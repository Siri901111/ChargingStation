/**
 * HTTP 请求封装
 * 基于 uni.request 封装，支持拦截器、自动 token 注入、统一错误处理
 */
import config from '@/config'
import { STORAGE_KEYS } from '@/constants'
import { useUserStore } from '@/store/modules/user'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
  header?: Record<string, string>
  loading?: boolean
  loadingText?: string
}

interface ResponseData<T = unknown> {
  code: number
  data: T
  message: string
}

class HttpRequest {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * 获取请求头
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * 请求拦截
   */
  private requestInterceptor(options: RequestOptions): RequestOptions {
    // 可以在这里添加请求日志、参数处理等
    if (config.debug) {
      console.log(`[Request] ${options.method} ${options.url}`, options.data)
    }
    return options
  }

  /**
   * 响应拦截
   */
  private responseInterceptor<T>(response: UniApp.RequestSuccessCallbackResult): ResponseData<T> {
    const data = response.data as ResponseData<T>

    if (config.debug) {
      console.log('[Response]', data)
    }

    // 处理业务错误
    if (data.code !== 200 && data.code !== 0) {
      // Token 过期
      if (data.code === 401) {
        this.handleUnauthorized()
      }
      throw new Error(data.message || '请求失败')
    }

    return data
  }

  /**
   * 处理未授权
   */
  private handleUnauthorized(): void {
    const userStore = useUserStore()
    userStore.logout()

    uni.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none',
    })

    setTimeout(() => {
      uni.navigateTo({
        url: '/pages-sub/auth/login',
      })
    }, 1500)
  }

  /**
   * 发送请求
   */
  async request<T = unknown>(options: RequestOptions): Promise<T> {
    const { url, method = 'GET', data, header = {}, loading = true, loadingText = '加载中...' } = this.requestInterceptor(options)

    // 显示 loading
    if (loading) {
      uni.showLoading({ title: loadingText, mask: true })
    }

    try {
      const response = await new Promise<UniApp.RequestSuccessCallbackResult>((resolve, reject) => {
        uni.request({
          url: `${this.baseUrl}${url}`,
          method,
          data,
          header: {
            ...this.getHeaders(),
            ...header,
          },
          success: resolve,
          fail: reject,
        })
      })

      const result = this.responseInterceptor<T>(response)
      return result.data
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '网络请求失败'
      uni.showToast({
        title: message,
        icon: 'none',
      })
      throw error
    } finally {
      if (loading) {
        uni.hideLoading()
      }
    }
  }

  /**
   * GET 请求
   */
  get<T = unknown>(url: string, data?: Record<string, unknown>, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>({ url, method: 'GET', data, ...options })
  }

  /**
   * POST 请求
   */
  post<T = unknown>(url: string, data?: Record<string, unknown>, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>({ url, method: 'POST', data, ...options })
  }

  /**
   * PUT 请求
   */
  put<T = unknown>(url: string, data?: Record<string, unknown>, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>({ url, method: 'PUT', data, ...options })
  }

  /**
   * DELETE 请求
   */
  delete<T = unknown>(url: string, data?: Record<string, unknown>, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>({ url, method: 'DELETE', data, ...options })
  }
}

export const http = new HttpRequest(config.baseUrl)

export default http
