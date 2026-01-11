/**
 * 订单相关 API
 */
import http from '@/utils/http'

export interface Order {
  orderNo: string
  userId: number
  stationId: number
  stationName: string
  pileId: number
  pileName: string
  startTime: string
  endTime?: string
  duration?: number      // 充电时长（秒）
  electricity?: number   // 充电量（kWh）
  electricityFee?: number // 电费
  serviceFee?: number    // 服务费
  parkingFee?: number    // 停车费
  totalAmount: number    // 总费用
  payType?: string       // 支付方式
  payTime?: string       // 支付时间
  status: number         // 0:待支付 2:充电中 3:已完成 4:已取消 5:已退款
  createTime: string
}

interface OrderListParams {
  status?: number
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}

interface PayOrderParams {
  orderNo: string
  payType: 'wechat' | 'alipay' | 'balance'
}

export const orderApi = {
  /**
   * 获取订单列表
   */
  getOrderList(params?: OrderListParams) {
    return http.get<{ list: Order[]; total: number }>('/order/list', params)
  },

  /**
   * 获取订单详情
   */
  getOrderDetail(orderNo: string) {
    return http.get<Order>(`/order/${orderNo}`)
  },

  /**
   * 支付订单
   */
  payOrder(params: PayOrderParams) {
    return http.post<{
      success: boolean
      payInfo?: unknown // 微信/支付宝支付参数
    }>('/order/pay', params)
  },

  /**
   * 取消订单
   */
  cancelOrder(orderNo: string) {
    return http.post<{ success: boolean }>(`/order/${orderNo}/cancel`)
  },

  /**
   * 申请退款
   */
  refundOrder(orderNo: string, reason: string) {
    return http.post<{ success: boolean }>(`/order/${orderNo}/refund`, { reason })
  },

  /**
   * 获取订单统计
   */
  getOrderStatistics() {
    return http.get<{
      totalCount: number
      totalAmount: number
      totalElectricity: number
      thisMonthCount: number
      thisMonthAmount: number
    }>('/order/statistics')
  },

  /**
   * 开具发票
   */
  createInvoice(params: {
    orderNos: string[]
    title: string
    taxNo?: string
    email: string
  }) {
    return http.post<{ invoiceId: string }>('/order/invoice', params)
  },
}
