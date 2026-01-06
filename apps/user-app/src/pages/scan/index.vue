<template>
  <view class="page">
    <!-- 扫码区域 -->
    <view class="scan-area" v-if="!pileInfo">
      <view class="scan-tip">
        <text class="tip-title">扫描充电桩上的二维码</text>
        <text class="tip-desc">请将二维码放入扫描框内</text>
      </view>

      <!-- H5 使用 camera 组件或手动输入 -->
      <!-- #ifdef H5 -->
      <view class="manual-input">
        <view class="input-wrap">
          <input
            v-model="manualCode"
            placeholder="请输入充电桩编号"
            class="code-input"
          />
        </view>
        <view class="btn btn-primary btn-block mt-30" @click="handleManualInput">
          确认
        </view>
      </view>
      <!-- #endif -->

      <!-- 小程序使用 camera 组件 -->
      <!-- #ifdef MP-WEIXIN -->
      <camera
        class="camera"
        device-position="back"
        flash="auto"
        @scancode="handleScanCode"
      />
      <view class="scan-frame">
        <view class="frame-corner top-left"></view>
        <view class="frame-corner top-right"></view>
        <view class="frame-corner bottom-left"></view>
        <view class="frame-corner bottom-right"></view>
        <view class="scan-line"></view>
      </view>
      <!-- #endif -->
    </view>

    <!-- 充电桩信息 -->
    <view v-else class="pile-info">
      <view class="info-card card">
        <view class="card-header">
          <view class="pile-icon">
            <text class="iconfont icon-charging-pile"></text>
          </view>
          <view class="pile-basic">
            <text class="pile-name">{{ pileInfo.pileName }}</text>
            <text class="pile-station">{{ pileInfo.stationName }}</text>
          </view>
          <view :class="['pile-status', getStatusClass(pileInfo.status)]">
            {{ getStatusText(pileInfo.status) }}
          </view>
        </view>

        <view class="card-body">
          <view class="info-row">
            <text class="info-label">充电类型</text>
            <text class="info-value">{{ pileInfo.type === 'fast' ? '快充' : '慢充' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">额定功率</text>
            <text class="info-value">{{ pileInfo.power }} kW</text>
          </view>
          <view class="info-row">
            <text class="info-label">当前电价</text>
            <text class="info-value price">¥{{ pileInfo.price }}/度</text>
          </view>
        </view>
      </view>

      <!-- 注意事项 -->
      <view class="notice card">
        <view class="notice-title">
          <text class="iconfont icon-info"></text>
          充电须知
        </view>
        <view class="notice-list">
          <view class="notice-item">1. 请确保充电枪已正确连接</view>
          <view class="notice-item">2. 充电过程中请勿拔出充电枪</view>
          <view class="notice-item">3. 如遇异常请立即停止充电</view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-action safe-area-bottom">
        <view class="balance-info">
          <text class="balance-label">账户余额</text>
          <text class="balance-value">¥{{ userStore.balance.toFixed(2) }}</text>
        </view>
        <view
          :class="['btn', 'btn-primary', { 'btn-disabled': !canCharge }]"
          @click="handleStartCharging"
        >
          {{ startBtnText }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'
import { useChargingStore } from '@/store/modules/charging'
import { chargingApi } from '@/api/charging'
import { PILE_STATUS, PILE_STATUS_TEXT, PAGE_PATH } from '@/constants'

// Store
const userStore = useUserStore()
const chargingStore = useChargingStore()

// 状态
const manualCode = ref('')
const pileInfo = ref<{
  pileId: number
  stationId: number
  stationName: string
  pileName: string
  type: string
  power: number
  price: number
  status: number
} | null>(null)
const loading = ref(false)

// 计算属性
const canCharge = computed(() => {
  if (!pileInfo.value) return false
  if (pileInfo.value.status !== PILE_STATUS.FREE) return false
  if (userStore.balance < 10) return false
  return true
})

const startBtnText = computed(() => {
  if (!pileInfo.value) return '扫码充电'
  if (pileInfo.value.status !== PILE_STATUS.FREE) return '充电桩不可用'
  if (userStore.balance < 10) return '余额不足'
  return '开始充电'
})

// 页面加载
onLoad((options) => {
  if (options?.code) {
    handleQRCode(decodeURIComponent(options.code))
  }
})

onMounted(() => {
  // 获取余额
  if (userStore.isLoggedIn) {
    userStore.fetchUserInfo()
  }
})

// 处理扫码结果
async function handleQRCode(code: string) {
  loading.value = true
  try {
    const result = await chargingApi.scanPile(code)
    pileInfo.value = result
  } catch (error) {
    uni.showToast({
      title: '无效的充电桩二维码',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

// 小程序扫码回调
function handleScanCode(e: { detail: { result: string } }) {
  handleQRCode(e.detail.result)
}

// H5 手动输入
function handleManualInput() {
  if (!manualCode.value.trim()) {
    uni.showToast({ title: '请输入充电桩编号', icon: 'none' })
    return
  }
  handleQRCode(manualCode.value.trim())
}

// 获取状态样式
function getStatusClass(status: number): string {
  switch (status) {
    case PILE_STATUS.FREE:
      return 'success'
    case PILE_STATUS.CHARGING:
      return 'warning'
    case PILE_STATUS.FAULT:
    case PILE_STATUS.OFFLINE:
      return 'danger'
    default:
      return ''
  }
}

// 获取状态文字
function getStatusText(status: number): string {
  return PILE_STATUS_TEXT[status] || '未知'
}

// 开始充电
async function handleStartCharging() {
  if (!canCharge.value || !pileInfo.value) return

  uni.showModal({
    title: '确认开始充电',
    content: `即将在 ${pileInfo.value.pileName} 开始充电，当前电价 ¥${pileInfo.value.price}/度`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '正在启动...' })
          await chargingStore.startCharging(pileInfo.value!.pileId)
          uni.hideLoading()

          uni.showToast({
            title: '充电已启动',
            icon: 'success',
          })

          // 跳转到充电页面
          setTimeout(() => {
            uni.redirectTo({ url: PAGE_PATH.CHARGING })
          }, 1500)
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: '启动失败，请重试',
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

.scan-area {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #000000;
}

.scan-tip {
  position: absolute;
  top: 150rpx;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 10;

  .tip-title {
    display: block;
    font-size: 36rpx;
    color: #FFFFFF;
    margin-bottom: 16rpx;
  }

  .tip-desc {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.7);
  }
}

.camera {
  width: 500rpx;
  height: 500rpx;
}

.scan-frame {
  position: absolute;
  width: 500rpx;
  height: 500rpx;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.frame-corner {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-color: var(--primary-color);
  border-style: solid;

  &.top-left {
    top: 0;
    left: 0;
    border-width: 6rpx 0 0 6rpx;
  }

  &.top-right {
    top: 0;
    right: 0;
    border-width: 6rpx 6rpx 0 0;
  }

  &.bottom-left {
    bottom: 0;
    left: 0;
    border-width: 0 0 6rpx 6rpx;
  }

  &.bottom-right {
    bottom: 0;
    right: 0;
    border-width: 0 6rpx 6rpx 0;
  }
}

.scan-line {
  position: absolute;
  top: 0;
  left: 20rpx;
  right: 20rpx;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

.manual-input {
  padding: 40rpx;
  width: 100%;

  .input-wrap {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 16rpx;
    padding: 0 24rpx;
  }

  .code-input {
    height: 96rpx;
    color: #FFFFFF;
    font-size: 28rpx;
  }
}

// 充电桩信息
.pile-info {
  padding: 24rpx;
  padding-bottom: 200rpx;
}

.info-card {
  .card-header {
    display: flex;
    align-items: center;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid var(--border-color);
  }

  .pile-icon {
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;

    .iconfont {
      font-size: 50rpx;
      color: #FFFFFF;
    }
  }

  .pile-basic {
    flex: 1;
  }

  .pile-name {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 8rpx;
  }

  .pile-station {
    font-size: 26rpx;
    color: var(--text-secondary);
  }

  .pile-status {
    padding: 8rpx 20rpx;
    font-size: 24rpx;
    border-radius: 20rpx;

    &.success {
      color: var(--primary-color);
      background-color: rgba(76, 175, 80, 0.1);
    }

    &.warning {
      color: var(--warning-color);
      background-color: rgba(255, 152, 0, 0.1);
    }

    &.danger {
      color: var(--danger-color);
      background-color: rgba(244, 67, 54, 0.1);
    }
  }

  .card-body {
    padding-top: 24rpx;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
  }

  .info-label {
    color: var(--text-secondary);
  }

  .info-value {
    font-weight: 500;

    &.price {
      color: var(--primary-color);
      font-size: 32rpx;
    }
  }
}

.notice {
  .notice-title {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 20rpx;

    .iconfont {
      color: var(--warning-color);
      margin-right: 10rpx;
    }
  }

  .notice-item {
    font-size: 26rpx;
    color: var(--text-secondary);
    line-height: 2;
  }
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #FFFFFF;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);

  .balance-info {
    margin-right: 30rpx;
  }

  .balance-label {
    font-size: 24rpx;
    color: var(--text-secondary);
  }

  .balance-value {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: var(--primary-color);
  }

  .btn {
    flex: 1;
  }
}
</style>
