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
      <!-- 返回按钮 -->
      <view class="back-btn" @click="handleBack">
        <text class="iconfont icon-arrow-left"></text>
        <text>重新扫码</text>
      </view>

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
            <view class="info-value-right">
              <text :class="['type-tag', pileInfo.type === 'fast' ? 'type-fast' : 'type-slow']">
                {{ pileInfo.type === 'fast' ? '⚡ 快充' : '🔋 慢充' }}
              </text>
            </view>
          </view>
          <view class="info-row">
            <text class="info-label">额定功率</text>
            <text class="info-value">{{ pileInfo.power }} kW</text>
          </view>
          <view class="info-row">
            <text class="info-label">当前电价</text>
            <text class="info-value price">¥{{ pileInfo.price.toFixed(2) }}/度</text>
          </view>
        </view>
      </view>

      <!-- 状态提示 -->
      <view v-if="!canCharge" class="warning-card card">
        <view class="warning-title">
          <text class="iconfont icon-warning"></text>
          <text>无法充电</text>
        </view>
        <view class="warning-content">
          <text v-if="pileInfo.status !== PILE_STATUS.FREE">
            {{ getStatusText(pileInfo.status) }}，请选择其他充电桩
          </text>
          <text v-else-if="userStore.balance < 10">
            账户余额不足（当前余额：¥{{ userStore.balance.toFixed(2) }}），请先充值
          </text>
        </view>
        <view v-if="userStore.balance < 10" class="warning-action">
          <view class="btn btn-outline" @click="goToRecharge">去充值</view>
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
          <view class="notice-item">4. 充电完成后请及时拔出充电枪</view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-action safe-area-bottom">
        <view class="balance-info">
          <text class="balance-label">账户余额</text>
          <text class="balance-value">¥{{ userStore.balance.toFixed(2) }}</text>
          <text v-if="userStore.balance < 10" class="balance-warning">余额不足</text>
        </view>
        <view
          :class="['btn', 'btn-primary', { 'btn-disabled': !canCharge }]"
          @click="handleStartCharging"
        >
          {{ startBtnText }}
        </view>
      </view>
    </view>

    <!-- 加载遮罩 -->
    <view v-if="loading" class="loading-mask">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在识别二维码...</text>
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
  if (!code || !code.trim()) {
    uni.showToast({
      title: '二维码内容为空',
      icon: 'none',
    })
    return
  }

  loading.value = true
  try {
    const result = await chargingApi.scanPile(code.trim())
    pileInfo.value = result
    
    // 扫码成功提示
    uni.showToast({
      title: '扫码成功',
      icon: 'success',
      duration: 1500,
    })
    
    // 小程序扫码成功后震动反馈
    // #ifdef MP-WEIXIN
    uni.vibrateShort()
    // #endif
  } catch (error: any) {
    console.error('扫码失败:', error)
    
    // 根据不同错误显示不同提示
    let errorMsg = '无效的充电桩二维码'
    if (error?.message) {
      if (error.message.includes('不存在')) {
        errorMsg = '充电桩不存在'
      } else if (error.message.includes('格式')) {
        errorMsg = '二维码格式错误，请重试'
      } else if (error.message.includes('网络')) {
        errorMsg = '网络错误，请检查网络连接'
      } else {
        errorMsg = error.message
      }
    }
    
    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 2000,
    })
    
    // 清空输入框（H5）
    // #ifdef H5
    manualCode.value = ''
    // #endif
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

// 返回重新扫码
function handleBack() {
  uni.showModal({
    title: '提示',
    content: '确定要返回重新扫码吗？',
    success: (res) => {
      if (res.confirm) {
        pileInfo.value = null
        manualCode.value = ''
      }
    },
  })
}

// 跳转到充值页面
function goToRecharge() {
  uni.navigateTo({ url: PAGE_PATH.RECHARGE })
}

// 开始充电
async function handleStartCharging() {
  if (!canCharge.value || !pileInfo.value) {
    // 如果余额不足，引导充值
    if (userStore.balance < 10) {
      uni.showModal({
        title: '余额不足',
        content: `当前余额 ¥${userStore.balance.toFixed(2)}，需要至少 ¥10 才能开始充电，是否前往充值？`,
        confirmText: '去充值',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            goToRecharge()
          }
        },
      })
    } else if (pileInfo.value.status !== PILE_STATUS.FREE) {
      uni.showToast({
        title: getStatusText(pileInfo.value.status) + '，无法充电',
        icon: 'none',
        duration: 2000,
      })
    }
    return
  }

  // 确认开始充电
  uni.showModal({
    title: '确认开始充电',
    content: `充电桩：${pileInfo.value.pileName}\n所属站点：${pileInfo.value.stationName}\n充电类型：${pileInfo.value.type === 'fast' ? '快充' : '慢充'}\n当前电价：¥${pileInfo.value.price.toFixed(2)}/度\n\n确认开始充电吗？`,
    confirmText: '确认开始',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '正在启动充电...' })
          await chargingStore.startCharging(pileInfo.value!.pileId)
          uni.hideLoading()

          uni.showToast({
            title: '充电已启动',
            icon: 'success',
            duration: 2000,
          })

          // 跳转到充电页面
          setTimeout(() => {
            uni.redirectTo({ url: PAGE_PATH.CHARGING })
          }, 2000)
        } catch (error: any) {
          uni.hideLoading()
          
          let errorMsg = '启动失败，请重试'
          if (error?.message) {
            if (error.message.includes('余额')) {
              errorMsg = '余额不足，请先充值'
            } else if (error.message.includes('订单')) {
              errorMsg = '您已有进行中的充电订单'
            } else if (error.message.includes('不可用')) {
              errorMsg = '充电桩当前不可用，请选择其他充电桩'
            } else {
              errorMsg = error.message
            }
          }
          
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000,
          })
          
          // 如果余额不足，引导充值
          if (errorMsg.includes('余额')) {
            setTimeout(() => {
              goToRecharge()
            }, 2000)
          }
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
  min-height: 100vh;
  background-color: var(--bg-color);
}

.info-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  margin-left: 0;
  margin-right: 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

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
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 24rpx;
  margin-left: 0;
  margin-right: 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .notice-title {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 20rpx;

    .iconfont {
      color: var(--warning-color);
      margin-right: 10rpx;
      font-size: 32rpx;
    }
  }

  .notice-item {
    font-size: 26rpx;
    color: var(--text-secondary);
    line-height: 2;
    padding: 8rpx 0;
  }
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 52px;
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

  .balance-warning {
    display: block;
    font-size: 22rpx;
    color: var(--danger-color);
    margin-top: 4rpx;
  }
}

// 返回按钮
.back-btn {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
  color: var(--text-primary);
  font-size: 28rpx;
  background-color: #FFFFFF;
  border-radius: 12rpx;
  margin-left: 24rpx;
  margin-right: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .iconfont {
    margin-right: 8rpx;
    font-size: 32rpx;
    color: var(--text-primary);
  }
}

// 类型标签
.type-tag {
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;

  &.type-fast {
    color: #FF6B35;
    background-color: rgba(255, 107, 53, 0.1);
  }

  &.type-slow {
    color: #4ECDC4;
    background-color: rgba(78, 205, 196, 0.1);
  }
}

.info-value-right {
  display: flex;
  align-items: center;
}

// 警告卡片
.warning-card {
  margin-top: 24rpx;
  margin-left: 0;
  margin-right: 0;
  background-color: #FFF7E6;
  border: 1rpx solid #FFE58F;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .warning-title {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    font-weight: bold;
    color: #FA8C16;
    margin-bottom: 12rpx;

    .iconfont {
      margin-right: 8rpx;
      font-size: 32rpx;
    }
  }

  .warning-content {
    font-size: 26rpx;
    color: #AD6800;
    line-height: 1.8;
    margin-bottom: 16rpx;
  }

  .warning-action {
    padding-top: 16rpx;
    border-top: 1rpx solid #FFE58F;

    .btn-outline {
      border: 1rpx solid var(--primary-color);
      color: var(--primary-color);
      background-color: transparent;
      width: 100%;
      padding: 20rpx;
      text-align: center;
      border-radius: 12rpx;
    }
  }
}

// 加载遮罩
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx;
    background-color: #FFFFFF;
    border-radius: 16rpx;

    .loading-spinner {
      width: 60rpx;
      height: 60rpx;
      border: 4rpx solid #F3F3F3;
      border-top: 4rpx solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20rpx;
    }

    .loading-text {
      font-size: 26rpx;
      color: var(--text-secondary);
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
