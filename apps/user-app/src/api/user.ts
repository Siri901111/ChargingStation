/**
 * 用户相关 API
 */
import http from '@/utils/http'
import type { UserInfo } from '@/store/modules/user'

interface LoginByPhoneParams {
  phone: string
  code: string
}

interface LoginByWechatParams {
  code: string
}

interface LoginResult {
  token: string
  userInfo: UserInfo
  needBindPhone?: boolean
}

interface SendCodeParams {
  phone: string
  type?: 'login' | 'bindPhone'
}

export const userApi = {
  /**
   * 发送验证码
   */
  sendCode(params: SendCodeParams) {
    return http.post<{ success: boolean }>('/user/sendCode', params)
  },

  /**
   * 手机号登录
   */
  loginByPhone(params: LoginByPhoneParams) {
    return http.post<LoginResult>('/user/loginByPhone', params)
  },

  /**
   * 微信登录
   */
  loginByWechat(params: LoginByWechatParams) {
    return http.post<LoginResult>('/user/loginByWechat', params)
  },

  /**
   * 绑定手机号
   */
  bindPhone(params: { phone: string; code: string }) {
    return http.post<UserInfo>('/user/bindPhone', params)
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return http.get<UserInfo>('/user/info')
  },

  /**
   * 更新用户信息
   */
  updateUserInfo(params: Partial<UserInfo>) {
    return http.put<UserInfo>('/user/info', params)
  },

  /**
   * 获取余额
   */
  getBalance() {
    return http.get<{ balance: number }>('/user/balance')
  },
}
