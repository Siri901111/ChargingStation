/**
 * 用户相关 API
 * @description 使用新 SDK 定义的用户模块 API
 */

import {
  createPostApi,
  createGetApi,
  createPaginatedApi,
  defineApi,
  apiConfig
} from '../sdk'
import type { ApiResponse, PaginatedResponse } from '../core/types'
import { http } from '../sdk'

// ==================== 类型定义 ====================

/** 登录参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 登录返回数据 */
export interface LoginResult {
  token: string
  refreshToken?: string
  expiresIn?: number
  userInfo: UserInfo
}

/** 用户信息 */
export interface UserInfo {
  id: string
  account: string
  name: string
  phone?: string
  avatar?: string
  department?: string
  position?: string
  permissions?: string[]
}

/** 注册参数 */
export interface RegisterParams {
  account: string
  password: string
  name: string
  phone: string
  idNo?: string
  position?: string
  department?: string
}

/** 忘记密码参数 */
export interface ForgotPasswordParams {
  account: string
  phone: string
  newPassword: string
}

/** 用户列表查询参数 */
export interface UserListParams {
  name?: string
  department?: string
}

/** 用户列表项 */
export interface UserListItem {
  id: string
  account: string
  name: string
  phone: string
  department?: string
  position?: string
  status: number
  createdAt: string
}

/** 用户权限查询参数 */
export interface GetUserAuthParams {
  pageAuthority: string
}

/** 用户权限返回数据 */
export interface UserAuthResult {
  btnList: string[]
  pageList: string[]
}

/** 设置用户权限参数 */
export interface SetUserAuthParams {
  account: string
  btnList: string[]
  pageList: string[]
}

// ==================== API 定义 ====================

/**
 * 用户登录
 * @example
 * const result = await userApi.login({ username: 'admin', password: '123456' })
 */
export const loginApi = createPostApi<LoginParams, LoginResult>('/api/login')

/**
 * 用户注册
 */
export const registerApi = createPostApi<RegisterParams, void>('/api/register')

/**
 * 忘记密码
 */
export const forgotPasswordApi = createPostApi<ForgotPasswordParams, void>('/api/forgot-password')

/**
 * 获取用户列表（分页）
 */
export const getUserListApi = createPaginatedApi<UserListParams, UserListItem>(
  '/api/permissionList',
  'POST'
)

/**
 * 获取用户权限
 */
export const getUserAuthApi = createPostApi<GetUserAuthParams, UserAuthResult>('/api/userAuth')

/**
 * 设置用户权限
 */
export const setUserAuthApi = createPostApi<SetUserAuthParams, void>('/api/setAuth')

/**
 * 删除用户
 */
export const deleteUserApi = createPostApi<{ account: string }, void>('/api/deleteUser')

/**
 * 切换用户状态
 */
export const toggleUserStatusApi = createPostApi<{ account: string }, void>('/api/toggleUserStatus')

// ==================== 模块化导出 ====================

/**
 * 用户 API 模块
 * @description 提供所有用户相关的 API 方法
 *
 * @example
 * ```typescript
 * import { userApi } from '@/request/api/user'
 *
 * // 登录
 * const loginResult = await userApi.login({
 *   username: 'admin',
 *   password: '123456'
 * })
 *
 * // 获取用户列表
 * const listResult = await userApi.getList({
 *   page: 1,
 *   pageSize: 10,
 *   name: '张'
 * })
 *
 * // 带配置的请求
 * const result = await userApi.login(
 *   { username: 'admin', password: '123456' },
 *   apiConfig.withLoading('登录中...')
 * )
 * ```
 */
export const userApi = defineApi({
  /** 用户登录 */
  login: loginApi,

  /** 用户注册 */
  register: registerApi,

  /** 忘记密码 */
  forgotPassword: forgotPasswordApi,

  /** 获取用户列表 */
  getList: getUserListApi,

  /** 获取用户权限 */
  getAuth: getUserAuthApi,

  /** 设置用户权限 */
  setAuth: setUserAuthApi,

  /** 删除用户 */
  delete: deleteUserApi,

  /** 切换用户状态 */
  toggleStatus: toggleUserStatusApi,

  /**
   * 刷新 Token
   * @description 使用 refreshToken 获取新的 accessToken
   */
  refreshToken: async (refreshToken: string) => {
    const result = await http.post<{ token: string; expiresIn: number }>(
      '/api/refresh-token',
      { refreshToken },
      { skipAuth: true }
    )
    return result.data
  },

  /**
   * 登出
   */
  logout: async () => {
    await http.post('/api/logout', null, apiConfig.silent())
  }
})

// ==================== 高级用法示例 ====================

/**
 * 登录并设置 Token
 * @description 封装登录逻辑，自动设置 Token
 */
export async function loginWithToken(params: LoginParams): Promise<LoginResult> {
  const response = await userApi.login(params, apiConfig.withLoading('登录中...'))

  // 设置 Token
  http.setToken({
    accessToken: response.data.token,
    refreshToken: response.data.refreshToken,
    expiresAt: response.data.expiresIn
      ? Date.now() + response.data.expiresIn * 1000
      : undefined
  })

  return response.data
}

/**
 * 带防抖的搜索用户
 * @description 使用防抖避免频繁请求
 */
export const searchUsers = async (keyword: string, page = 1, pageSize = 10) => {
  return getUserListApi(
    { name: keyword, page, pageSize },
    apiConfig.debounced(300)
  )
}
