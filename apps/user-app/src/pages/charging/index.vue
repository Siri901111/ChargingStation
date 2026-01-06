<template>
  <view class="page">
    <!-- 顶部状态区域 -->
    <view class="status-area" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="status-header">
        <view class="back-btn" @click="handleBack">
          <text class="iconfont icon-arrow-left"></text>
        </view>
        <text class="title">充电中</text>
        <view class="placeholder"></view>
      </view>

      <!-- 充电动画 -->
      <view class="charging-animation">
        <view class="circle-outer">
          <view class="circle-inner">
            <view class="percent-value">{{ chargingStore.chargingStatus?.percent || 0 }}%</view>
            <view class="percent-label">电池电量</view>
          </view>
        </view>
        <view class="wave wave1"></view>
        <view class="wave wave2"></view>
      </view>

      <!-- 站点信息 -->
      <view class="station-info">
        <text class="station-name">{{ chargingStore.chargingStatus?.stationName }}</text>
        <text class="pile-name">{{ chargingStore.chargingStatus?.pileName }}</text>
      </view>
    </view>

    <!-- 充电数据 -->
    <view class="data-area">
      <view class="data-card">
        <view class="data-grid">
          <view class="data-item">
            <view class="data-value">{{ formatDuration(chargingStore.chargingDuration) }}</view>
            <view class="data-label">充电时长</view>
          </view>
          <view class="data-item">
            <view class="data-value">{{ chargingStore.chargingStatus?.electricity?.toFixed(2) || '0.00' }}</view>
            <view class="data-label">已充电量(kWh)</view>
          </view>
          <view class="data-item">
            <view class="data-value primary">¥{{ chargingStore.chargingAmount.toFixed(2) }}</view>
            <view class="data-label">当前费用</view>
          </view>
        </view>

        <view class="divider"></view>

        <!-- 实时参数 -->
        <view class="realtime-data">
          <view class="realtime-title">实时参数</view>
          <view class="realtime-grid">
            <view class="realtime-item">
              <text class="realtime-label">电压</text>
              <text class="realtime-value">{{ chargingStore.chargingStatus?.voltage?.toFixed(1) || '--' }} V</text>
            </view>
            <view class="realtime-item">
              <text class="realtime-label">电流</text>
              <text class="realtime-value">{{ chargingStore.chargingStatus?.current?.toFixed(1) || '--' }} A</text>
            </view>
            <view class="realtime-item">
              <text class="realtime-label">功率</text>
              <text class="realtime-value">{{ chargingStore.chargingPower.toFixed(1) }} kW</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 提示信息 -->
      <view class="tips-card card">
        <view class="tips-item">
          <text class="iconfont icon-info"></text>
          <text>充电过程中请勿拔出充电枪</text>
        </view>
        <view class="tips-item">
          <text class="iconfont icon-info"></text>
          <text>如遇异常请立即点击停止充电</text>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-action safe-area-bottom">
      <view class="btn btn-danger btn-block" @click="handleStopCharging">
        停止充电
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useChargingStore } from '@/store/modules/charging'
import { PAGE_PATH } from '@/constants'

// Store
const chargingStore = useChargingStore()

// 状态
const statusBarHeight = ref(0)
let durationTimer: ReturnType<typeof setInterval> | null = null

// 初始化
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0

  // 获取充电状态
  chargingStore.fetchChargingStatus()

  // 启动计时器更新时长
  durationTimer = setInterval(() => {
    if (chargingStore.chargingStatus) {
      const start = new Date(chargingStore.chargingStatus.startTime).getTime()
      const now = Date.now()
      const duration = Math.floor((now - start) / 1000)
      if (chargingStore.chargingStatus) {
        chargingStore.chargingStatus.duration = duration
      }
    }
  }, 1000)
})

onUnmounted(() => {
  if (durationTimer) {
    clearInterval(durationTimer)
  }
})

// 格式化时长
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const hStr = String(h).padStart(2, '0')
  const mStr = String(m).padStart(2, '0')
  const sStr = String(s).padStart(2, '0')

  return `${hStr}:${mStr}:${sStr}`
}

// 返回
function handleBack() {
  uni.switchTab({ url: PAGE_PATH.INDEX })
}

// 停止充电
function handleStopCharging() {
  uni.showModal({
    title: '确认停止充电',
    content: '是否确认停止当前充电？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '正在停止...' })
          const result = await chargingStore.stopCharging()
          uni.hideLoading()

          if (result) {
            uni.showModal({
              title: '充电完成',
              content: `本次充电 ${result.electricity.toFixed(2)} kWh\n费用 ¥${result.amount.toFixed(2)}`,
              showCancel: false,
              success: () => {
                // 跳转到订单详情
                uni.redirectTo({
                  url: `${PAGE_PATH.ORDER_DETAIL}?orderNo=${result.orderId}`,
                })
              },
            })
          }
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: '停止失败，请重试',
            icon: 'none',
          })
        }
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.status-area {
  background: linear-gradient(180deg, #4CAF50 0%, #2E7D32 100%);
  padding-bottom: 60rpx;
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;

  .back-btn,
  .placeholder {
    width: 80rpx;
  }

  .back-btn {
    .iconfont {
      font-size: 40rpx;
      color: #FFFFFF;
    }
  }

  .title {
    font-size: 34rpx;
    font-weight: bold;
    color: #FFFFFF;
  }
}

.charging-animation {
  position: relative;
  width: 360rpx;
  height: 360rpx;
  margin: 40rpx auto;
}

.circle-outer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle-inner {
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.percent-value {
  font-size: 72rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.percent-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
}

.wave {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  animation: wave 2s ease-out infinite;
}

.wave2 {
  animation-delay: 1s;
}

@keyframes wave {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.station-info {
  text-align: center;
  color: #FFFFFF;

  .station-name {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }

  .pile-name {
    font-size: 26rpx;
    opacity: 0.8;
  }
}

.data-area {
  margin-top: -30rpx;
  padding: 0 24rpx;
  padding-bottom: 180rpx;
}

.data-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: var(--shadow);
}

.data-grid {
  display: flex;
  justify-content: space-around;
}

.data-item {
  text-align: center;
}

.data-value {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--text-primary);

  &.primary {
    color: var(--primary-color);
  }
}

.data-label {
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-top: 10rpx;
}

.realtime-data {
  padding-top: 24rpx;
}

.realtime-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.realtime-grid {
  display: flex;
  justify-content: space-between;
}

.realtime-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.realtime-label {
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 8rpx;
}

.realtime-value {
  font-size: 28rpx;
  font-weight: 500;
}

.tips-card {
  margin-top: 24rpx;
}

.tips-item {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .iconfont {
    color: var(--warning-color);
    margin-right: 12rpx;
  }
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx;
  background-color: #FFFFFF;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.btn-danger {
  background: linear-gradient(135deg, #F44336, #C62828);
  color: #FFFFFF;
}
</style>
