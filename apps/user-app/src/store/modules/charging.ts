/**
 * 充电状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chargingApi } from '@/api/charging'
import config from '@/config'

export interface ChargingStatus {
  orderId: string
  pileId: number
  stationId: number
  stationName: string
  pileName: string
  startTime: string
  duration: number       // 充电时长（秒）
  power: number          // 当前功率（kW）
  voltage: number        // 电压（V）
  current: number        // 电流（A）
  electricity: number    // 已充电量（kWh）
  amount: number         // 当前费用（元）
  percent: number        // 电池电量百分比
  status: number         // 0:准备中 1:充电中 2:已完成 3:异常
}

export const useChargingStore = defineStore('charging', () => {
  // State
  const isCharging = ref(false)
  const chargingStatus = ref<ChargingStatus | null>(null)
  const wsConnection = ref<UniApp.SocketTask | null>(null)

  // Getters
  const currentOrderId = computed(() => chargingStatus.value?.orderId)
  const chargingDuration = computed(() => chargingStatus.value?.duration ?? 0)
  const chargingPower = computed(() => chargingStatus.value?.power ?? 0)
  const chargingAmount = computed(() => chargingStatus.value?.amount ?? 0)

  // Actions
  /**
   * 开始充电
   */
  async function startCharging(pileId: number) {
    const result = await chargingApi.startCharging({ pileId })
    isCharging.value = true
    chargingStatus.value = result
    // 建立 WebSocket 连接获取实时状态
    connectWebSocket(result.orderId)
    return result
  }

  /**
   * 停止充电
   */
  async function stopCharging() {
    if (!chargingStatus.value?.orderId) return

    const result = await chargingApi.stopCharging({
      orderId: chargingStatus.value.orderId,
    })

    isCharging.value = false
    disconnectWebSocket()

    return result
  }

  /**
   * 获取充电状态
   */
  async function fetchChargingStatus() {
    const status = await chargingApi.getChargingStatus()
    if (status) {
      isCharging.value = true
      chargingStatus.value = status
      connectWebSocket(status.orderId)
    } else {
      isCharging.value = false
      chargingStatus.value = null
    }
    return status
  }

  /**
   * 建立 WebSocket 连接
   */
  function connectWebSocket(orderId: string) {
    if (wsConnection.value) {
      disconnectWebSocket()
    }

    const token = uni.getStorageSync('user_token')
    wsConnection.value = uni.connectSocket({
      url: `${config.wsUrl}/charging/${orderId}?token=${token}`,
      success: () => {
        console.log('WebSocket 连接成功')
      },
    })

    // 监听消息
    uni.onSocketMessage((res) => {
      try {
        const data = JSON.parse(res.data as string)
        if (data.type === 'charging_status') {
          chargingStatus.value = {
            ...chargingStatus.value,
            ...data.payload,
          } as ChargingStatus
        } else if (data.type === 'charging_complete') {
          isCharging.value = false
          uni.showModal({
            title: '充电完成',
            content: `本次充电 ${data.payload.electricity.toFixed(2)} kWh，费用 ¥${data.payload.amount.toFixed(2)}`,
            showCancel: false,
          })
        }
      } catch (e) {
        console.error('WebSocket 消息解析失败', e)
      }
    })

    // 监听关闭
    uni.onSocketClose(() => {
      console.log('WebSocket 连接关闭')
      wsConnection.value = null
    })

    // 监听错误
    uni.onSocketError(() => {
      console.error('WebSocket 连接错误')
      wsConnection.value = null
    })
  }

  /**
   * 断开 WebSocket 连接
   */
  function disconnectWebSocket() {
    if (wsConnection.value) {
      uni.closeSocket()
      wsConnection.value = null
    }
  }

  /**
   * 重置状态
   */
  function reset() {
    isCharging.value = false
    chargingStatus.value = null
    disconnectWebSocket()
  }

  return {
    // State
    isCharging,
    chargingStatus,
    // Getters
    currentOrderId,
    chargingDuration,
    chargingPower,
    chargingAmount,
    // Actions
    startCharging,
    stopCharging,
    fetchChargingStatus,
    connectWebSocket,
    disconnectWebSocket,
    reset,
  }
})
