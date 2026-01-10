/**
 * 会员卡 API
 */
import http from '@/utils/http'

export interface TransactionRecord {
  transactionDate: string
  transactionAmount: string
  transactionType: string
  orderNo?: string
}

export interface MemberCardDetail {
  memberCardNumber: string
  cardType: string
  issueDate: string
  holderName: string
  holderPhone: string
  cardBalance: string
  transactionRecords: TransactionRecord[]
  validUntil: string
  idNo?: string
  status: number
}

export const memberCardApi = {
  /**
   * 获取我的会员卡详情
   */
  getMyMemberCard() {
    return http.get<MemberCardDetail>('/member/card')
  },

  /**
   * 购买充值会员（年卡198元）
   */
  purchaseRechargeMember() {
    return http.post<{
      success: boolean
      message: string
      cardType: string
      validUntil: string
      discount: number
    }>('/member/purchase-recharge-member')
  },
}
