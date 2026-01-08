/**
 * 钱包相关 API
 */
import http from '@/utils/http'

export interface RechargeRecord {
  id: number
  amount: number
  giftAmount?: number
  payType: string
  status: number
  createTime: string
}

export interface RechargePackage {
  id: number
  amount: number
  giftAmount: number
  description?: string
}

export const walletApi = {
  /**
   * 获取余额
   */
  getBalance() {
    return http.get<{ balance: number }>('/wallet/balance')
  },

  /**
   * 获取充值套餐
   */
  getRechargePackages() {
    return http.get<RechargePackage[]>('/wallet/packages')
  },

  /**
   * 充值
   */
  recharge(params: {
    amount: number
    packageId?: number
    payType: 'wechat' | 'alipay'
  }) {
    return http.post<{
      orderId: string
      payInfo: unknown
    }>('/wallet/recharge', params)
  },

  /**
   * 测试充值（仅开发环境）
   * 直接增加余额，无需支付
   */
  testRecharge(params: { amount: number; giftAmount?: number }) {
    return http.post<{
      success: boolean
      message: string
      amount: number
      giftAmount: number
      totalAdd: number
      newBalance: number
    }>('/test/recharge', params)
  },

  /**
   * 获取充值记录
   */
  getRechargeRecords(params?: { page?: number; pageSize?: number }) {
    return http.get<{ list: RechargeRecord[]; total: number }>('/wallet/records', params)
  },

  /**
   * 获取消费记录
   */
  getConsumeRecords(params?: { page?: number; pageSize?: number }) {
    return http.get<{
      list: {
        id: number
        orderNo: string
        amount: number
        type: string
        createTime: string
      }[]
      total: number
    }>('/wallet/consume', params)
  },
}
