/**
 * 请求拦截器集合
 * @description 提供预定义的请求和响应拦截器
 */

import type { AxiosError, AxiosResponse } from 'axios'
import type { RequestInterceptor, ResponseInterceptor, InternalRequestConfig } from '../core/types'
import { HttpErrorCode } from '../core/types'
import { STORAGE_KEYS, HEADERS, AUTH_WHITE_LIST, ERROR_MESSAGES, BUSINESS_CODE } from '../core/constants'
import { createHttpError, isInWhiteList, logger, generateTraceId } from '../core/utils'
import { tokenManager } from '../managers/token'
import { idempotencyManager } from '../managers/idempotency'
import { signManager } from '../managers/sign'
import { ElNotification, ElLoading } from 'element-plus'

// Loading 实例管理
let loadingInstance: any = null
let loadingCount = 0

/**
 * 显示 Loading
 */
function showLoading(text?: string) {
  if (loadingCount === 0) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: text || '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }
  loadingCount++
}

/**
 * 隐藏 Loading
 */
function hideLoading() {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    loadingInstance?.close()
    loadingInstance = null
  }
}

// ==================== 请求拦截器 ====================

/**
 * 时间戳拦截器（记录请求开始时间）
 */
export const timestampInterceptor: RequestInterceptor = {
  name: 'timestamp',
  priority: 1,
  onRequest: (config: InternalRequestConfig) => {
    config._startTime = Date.now()
    return config
  }
}

/**
 * 追踪ID拦截器
 */
export const traceIdInterceptor: RequestInterceptor = {
  name: 'traceId',
  priority: 5,
  onRequest: (config: InternalRequestConfig) => {
    config.headers = config.headers || {}
    config.headers[HEADERS.TRACE_ID] = generateTraceId()
    config.headers[HEADERS.REQUEST_ID] = config.requestId || `req_${Date.now()}`
    config.headers[HEADERS.TIMESTAMP] = String(Date.now())
    return config
  }
}

/**
 * Token 注入拦截器
 */
export const tokenInterceptor: RequestInterceptor = {
  name: 'token',
  priority: 10,
  onRequest: async (config: InternalRequestConfig) => {
    // 跳过不需要 token 的接口
    if (config.skipAuth || isInWhiteList(config.url, AUTH_WHITE_LIST)) {
      return config
    }

    // 使用 TokenManager 处理
    return tokenManager.applyToConfig(config)
  }
}

/**
 * 幂等性拦截器
 */
export const idempotencyInterceptor: RequestInterceptor = {
  name: 'idempotency',
  priority: 15,
  onRequest: (config: InternalRequestConfig) => {
    return idempotencyManager.applyToConfig(config)
  }
}

/**
 * 签名拦截器
 */
export const signInterceptor: RequestInterceptor = {
  name: 'sign',
  priority: 20,
  onRequest: async (config: InternalRequestConfig) => {
    return signManager.applyToConfig(config)
  }
}

/**
 * Loading 拦截器
 */
export const loadingInterceptor: RequestInterceptor = {
  name: 'loading',
  priority: 30,
  onRequest: (config: InternalRequestConfig) => {
    if (config.showLoading && !config.silent) {
      showLoading(config.loadingText)
    }
    return config
  }
}

/**
 * 日志拦截器
 */
export const logInterceptor: RequestInterceptor = {
  name: 'log',
  priority: 100,
  onRequest: (config: InternalRequestConfig) => {
    logger.request(config)
    return config
  }
}

// ==================== 响应拦截器 ====================

/**
 * Loading 关闭拦截器
 */
export const loadingCloseInterceptor: ResponseInterceptor = {
  name: 'loadingClose',
  priority: 1,
  onResponse: (response: AxiosResponse) => {
    const config = response.config as InternalRequestConfig
    if (config.showLoading && !config.silent) {
      hideLoading()
    }
    return response
  },
  onResponseError: (error: AxiosError) => {
    const config = error.config as InternalRequestConfig
    if (config?.showLoading && !config?.silent) {
      hideLoading()
    }
    return Promise.reject(error)
  }
}

/**
 * 幂等性响应拦截器
 */
export const idempotencyResponseInterceptor: ResponseInterceptor = {
  name: 'idempotencyResponse',
  priority: 5,
  onResponse: (response: AxiosResponse) => {
    const config = response.config as InternalRequestConfig
    // 记录成功的幂等请求
    if (config.idempotencyKey) {
      idempotencyManager.setCompleted(config.idempotencyKey, response.data)
      idempotencyManager.removePendingRequest(config.idempotencyKey)
    }
    return response
  },
  onResponseError: (error: AxiosError) => {
    const config = error.config as InternalRequestConfig
    // 记录失败的幂等请求
    if (config?.idempotencyKey) {
      idempotencyManager.setFailed(config.idempotencyKey)
      idempotencyManager.removePendingRequest(config.idempotencyKey)
    }
    return Promise.reject(error)
  }
}

/**
 * 响应数据转换拦截器
 */
export const transformInterceptor: ResponseInterceptor = {
  name: 'transform',
  priority: 10,
  onResponse: (response: AxiosResponse) => {
    const config = response.config as InternalRequestConfig
    const data = response.data

    // 自定义转换
    if (config.transformResponse && typeof config.transformResponse === 'function') {
      response.data = config.transformResponse(data)
    }

    return response
  }
}

/**
 * 业务状态码处理拦截器
 */
export const businessCodeInterceptor: ResponseInterceptor = {
  name: 'businessCode',
  priority: 20,
  onResponse: (response: AxiosResponse) => {
    const config = response.config as InternalRequestConfig
    const data = response.data

    // 检查业务状态码
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code !== BUSINESS_CODE.SUCCESS) {
        // Token 过期或无效
        if (
          data.code === BUSINESS_CODE.UNAUTHORIZED ||
          data.code === BUSINESS_CODE.TOKEN_EXPIRED ||
          data.code === BUSINESS_CODE.TOKEN_INVALID
        ) {
          tokenManager.clearToken()
          window.location.href = '/login'
          return Promise.reject(
            createHttpError(HttpErrorCode.TOKEN_EXPIRED, data.message || '登录已过期')
          )
        }

        // 权限不足
        if (data.code === BUSINESS_CODE.PERMISSION_DENIED) {
          return Promise.reject(
            createHttpError(HttpErrorCode.FORBIDDEN, data.message || '权限不足')
          )
        }

        // 幂等性冲突
        if (data.code === BUSINESS_CODE.IDEMPOTENCY_CONFLICT) {
          return Promise.reject(
            createHttpError(HttpErrorCode.IDEMPOTENCY_CONFLICT, data.message || '请求重复')
          )
        }

        // 请求限流
        if (data.code === BUSINESS_CODE.RATE_LIMITED) {
          return Promise.reject(
            createHttpError(HttpErrorCode.RATE_LIMITED, data.message || '请求过于频繁')
          )
        }

        // 签名错误
        if (data.code === BUSINESS_CODE.SIGNATURE_INVALID) {
          return Promise.reject(
            createHttpError(HttpErrorCode.SIGNATURE_ERROR, data.message || '签名验证失败')
          )
        }

        // 其他业务错误
        if (!config.silent && config.showError !== false) {
          ElNotification({
            title: '请求失败',
            message: data.message || '操作失败',
            type: 'error',
            duration: 3000
          })
        }

        return Promise.reject(
          createHttpError(HttpErrorCode.BUSINESS_ERROR, data.message, {
            details: data
          })
        )
      }

      // 成功提示
      if (!config.silent && config.showSuccess) {
        ElNotification({
          title: '成功',
          message: config.successMessage || data.message || '操作成功',
          type: 'success',
          duration: 2000
        })
      }
    }

    return response
  }
}

/**
 * HTTP 错误处理拦截器
 */
export const errorHandlerInterceptor: ResponseInterceptor = {
  name: 'errorHandler',
  priority: 30,
  onResponseError: (error: AxiosError) => {
    const config = error.config as InternalRequestConfig
    const status = error.response?.status

    // 获取错误消息
    let message = ERROR_MESSAGES[status as number] || '请求失败'
    const responseData = error.response?.data as any
    if (responseData?.message) {
      message = responseData.message
    }

    // 特殊状态码处理
    if (status === 401) {
      tokenManager.clearToken()
      window.location.href = '/login'
      return Promise.reject(
        createHttpError(HttpErrorCode.UNAUTHORIZED, message, {
          status,
          response: error.response,
          config
        })
      )
    }

    // 显示错误提示
    if (!config?.silent && config?.showError !== false) {
      ElNotification({
        title: '请求错误',
        message: config?.errorMessage || message,
        type: 'error',
        duration: 3000
      })
    }

    return Promise.reject(
      createHttpError(
        status && status >= 500 ? HttpErrorCode.SERVER_ERROR : HttpErrorCode.BUSINESS_ERROR,
        message,
        { status, response: error.response, config }
      )
    )
  }
}

/**
 * 日志响应拦截器
 */
export const logResponseInterceptor: ResponseInterceptor = {
  name: 'logResponse',
  priority: 100,
  onResponse: (response: AxiosResponse) => {
    const config = response.config as InternalRequestConfig
    const duration = Date.now() - (config._startTime || Date.now())
    logger.response(config, response.data, duration)
    return response
  },
  onResponseError: (error: AxiosError) => {
    const config = error.config as InternalRequestConfig
    const duration = Date.now() - (config?._startTime || Date.now())
    if (config) {
      logger.responseError(config, error, duration)
    }
    return Promise.reject(error)
  }
}

// ==================== 默认拦截器配置 ====================

export const defaultRequestInterceptors: RequestInterceptor[] = [
  timestampInterceptor,
  traceIdInterceptor,
  tokenInterceptor,
  idempotencyInterceptor,
  signInterceptor,
  loadingInterceptor,
  logInterceptor
]

export const defaultResponseInterceptors: ResponseInterceptor[] = [
  loadingCloseInterceptor,
  idempotencyResponseInterceptor,
  transformInterceptor,
  businessCodeInterceptor,
  errorHandlerInterceptor,
  logResponseInterceptor
]
