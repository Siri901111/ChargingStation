/**
 * 充电相关 API
 */
import http from '@/utils/http'
import type { ChargingStatus } from '@/store/modules/charging'

interface StartChargingParams {
  pileId: number
  payType?: 'wechat' | 'alipay' | 'balance'
}

interface StopChargingParams {
  orderId: string
}

interface ChargingResult {
  orderId: string
  pileId: number
  stationId: number
  stationName: string
  pileName: string
  startTime: string
  status: number
}

interface ChargingCompleteResult {
  orderId: string
  startTime: string
  endTime: string
  duration: number       // 充电时长（秒）
  electricity: number    // 充电量（kWh）
  amount: number         // 费用（元）
  payStatus: number      // 支付状态
}

export const chargingApi = {
  /**
   * 扫码获取充电桩信息
   */
  scanPile(qrCode: string) {
    return http.post<{
      pileId: number
      stationId: number
      stationName: string
      pileName: string
      type: string
      power: number
      price: number
      status: number
    }>('/charging/scan', { qrCode })
  },

  /**
   * 开始充电
   */
  startCharging(params: StartChargingParams) {
    return http.post<ChargingResult>('/charging/start', params)
  },

  /**
   * 停止充电
   */
  stopCharging(params: StopChargingParams) {
    return http.post<ChargingCompleteResult>('/charging/stop', params)
  },

  /**
   * 获取当前充电状态
   */
  getChargingStatus() {
    return http.get<ChargingStatus | null>('/charging/status')
  },

  /**
   * 获取充电记录
   */
  getChargingHistory(params?: { page?: number; pageSize?: number }) {
    return http.get<{
      list: ChargingCompleteResult[]
      total: number
    }>('/charging/history', params)
  },

  /**
   * 预约充电
   */
  reserveCharging(params: {
    pileId: number
    reserveTime: string
    duration: number
  }) {
    return http.post<{
      reserveId: string
      expireTime: string
    }>('/charging/reserve', params)
  },

  /**
   * 取消预约
   */
  cancelReserve(reserveId: string) {
    return http.post<{ success: boolean }>('/charging/reserve/cancel', { reserveId })
  },
}
