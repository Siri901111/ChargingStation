/**
 * 充电状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chargingApi } from '@/api/charging'

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
    // 使用轮询方式获取实时状态
    startPolling(result.orderId)
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
    stopPolling()

    return result
  }

  // 轮询定时器
  let pollingTimer: ReturnType<typeof setInterval> | null = null

  /**
   * 获取充电状态（内部方法，不自动启动轮询）
   */
  async function fetchChargingStatusInternal() {
    try {
      const status = await chargingApi.getChargingStatus()
      if (status) {
        // 有进行中的充电订单，更新状态
        isCharging.value = true
        chargingStatus.value = status
        // 后端返回status: 1表示充电中，继续轮询
        // 如果返回null，说明订单已完成（状态不是2），会进入else分支
      } else {
        // 没有进行中的订单（返回null），说明充电已完成或未开始
        if (isCharging.value) {
          // 如果之前正在充电，现在没有状态了，说明充电已完成
          // 需要停止轮询，但无法获取最终数据（因为返回null）
          // 实际场景中，充电完成应该通过stopCharging接口返回完整数据
          isCharging.value = false
          stopPolling()
          chargingStatus.value = null
        } else {
          // 之前就没有在充电，直接清空状态
          chargingStatus.value = null
        }
      }
      return status
    } catch (error) {
      console.warn('获取充电状态失败', error)
      // 获取状态失败时，不立即停止轮询，继续尝试
      // 这样可以处理临时网络问题
      return null
    }
  }

  /**
   * 获取充电状态（公开方法，会自动启动轮询）
   */
  async function fetchChargingStatus() {
    const status = await fetchChargingStatusInternal()
    // 如果获取到状态且正在充电，但还没有启动轮询，则启动轮询
    if (status && isCharging.value && !pollingTimer) {
      startPolling(status.orderId)
    }
    return status
  }

  /**
   * 开始轮询充电状态
   * 每5秒获取一次充电状态，确保状态实时更新
   */
  function startPolling(orderId: string) {
    // 清除之前的定时器（如果存在）
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }

    // 立即获取一次状态（使用内部方法，避免重复启动轮询）
    fetchChargingStatusInternal().catch((error) => {
      console.warn('获取充电状态失败:', error)
    })

    // 每5秒轮询一次充电状态
    pollingTimer = setInterval(() => {
      if (isCharging.value) {
        fetchChargingStatusInternal().catch((error) => {
          console.warn('轮询获取充电状态失败:', error)
        })
      } else {
        // 如果不在充电中，停止轮询
        stopPolling()
      }
    }, 5000)
  }

  /**
   * 停止轮询
   */
  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  /**
   * 重置状态
   */
  function reset() {
    isCharging.value = false
    chargingStatus.value = null
    stopPolling()
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
    startPolling,
    stopPolling,
    reset,
  }
})
