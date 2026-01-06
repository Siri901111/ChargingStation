<template>
  <view class="page">
    <!-- 充值金额 -->
    <view class="section card">
      <view class="section-title">选择充值金额</view>
      <view class="package-list">
        <view
          v-for="pkg in packages"
          :key="pkg.id"
          :class="['package-item', { active: selectedPackage?.id === pkg.id }]"
          @click="handleSelectPackage(pkg)"
        >
          <view class="package-amount">¥{{ pkg.amount }}</view>
          <view class="package-gift" v-if="pkg.giftAmount > 0">送¥{{ pkg.giftAmount }}</view>
        </view>
      </view>

      <!-- 自定义金额 -->
      <view class="custom-amount">
        <text class="custom-label">自定义金额</text>
        <view class="custom-input-wrap">
          <text class="custom-prefix">¥</text>
          <input
            v-model="customAmount"
            type="digit"
            placeholder="请输入金额"
            class="custom-input"
            @focus="selectedPackage = null"
          />
        </view>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="section card">
      <view class="section-title">支付方式</view>
      <view class="pay-list">
        <view
          :class="['pay-item', { active: payType === 'wechat' }]"
          @click="payType = 'wechat'"
        >
          <text class="iconfont icon-wechat pay-icon wechat"></text>
          <text class="pay-name">微信支付</text>
          <view class="pay-check">
            <text class="iconfont icon-check" v-if="payType === 'wechat'"></text>
          </view>
        </view>
        <view
          :class="['pay-item', { active: payType === 'alipay' }]"
          @click="payType = 'alipay'"
        >
          <text class="iconfont icon-alipay pay-icon alipay"></text>
          <text class="pay-name">支付宝</text>
          <view class="pay-check">
            <text class="iconfont icon-check" v-if="payType === 'alipay'"></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-action safe-area-bottom">
      <view class="amount-info">
        <text class="amount-label">支付金额</text>
        <text class="amount-value">¥{{ totalAmount }}</text>
      </view>
      <view class="btn btn-primary" @click="handleRecharge">
        立即充值
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { walletApi, type RechargePackage } from '@/api/wallet'

// 状态
const packages = ref<RechargePackage[]>([])
const selectedPackage = ref<RechargePackage | null>(null)
const customAmount = ref('')
const payType = ref<'wechat' | 'alipay'>('wechat')

// 计算总金额
const totalAmount = computed(() => {
  if (selectedPackage.value) {
    return selectedPackage.value.amount
  }
  return customAmount.value ? parseFloat(customAmount.value) : 0
})

// 初始化
onMounted(() => {
  fetchPackages()
})

// 获取充值套餐
async function fetchPackages() {
  try {
    packages.value = await walletApi.getRechargePackages()
    if (packages.value.length > 0) {
      selectedPackage.value = packages.value[0]
    }
  } catch (error) {
    packages.value = [
      { id: 1, amount: 50, giftAmount: 0 },
      { id: 2, amount: 100, giftAmount: 5 },
      { id: 3, amount: 200, giftAmount: 15 },
      { id: 4, amount: 500, giftAmount: 50 },
    ]
    selectedPackage.value = packages.value[0]
  }
}

// 选择套餐
function handleSelectPackage(pkg: RechargePackage) {
  selectedPackage.value = pkg
  customAmount.value = ''
}

// 充值
async function handleRecharge() {
  if (totalAmount.value <= 0) {
    uni.showToast({ title: '请选择或输入充值金额', icon: 'none' })
    return
  }

  if (totalAmount.value < 10) {
    uni.showToast({ title: '最低充值10元', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '正在发起支付...' })

    const res = await walletApi.recharge({
      amount: totalAmount.value,
      packageId: selectedPackage.value?.id,
      payType: payType.value,
    })

    uni.hideLoading()

    // 调用支付
    // #ifdef MP-WEIXIN
    if (payType.value === 'wechat' && res.payInfo) {
      uni.requestPayment({
        ...(res.payInfo as UniApp.RequestPaymentOptions),
        success: () => {
          uni.showToast({ title: '充值成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        },
        fail: () => {
          uni.showToast({ title: '支付取消', icon: 'none' })
        },
      })
    }
    // #endif

    // #ifdef H5
    uni.showToast({ title: '充值成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    // #endif
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '充值失败，请重试', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: 180rpx;
}

.section {
  margin: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
}

.package-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.package-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 140rpx;
  background-color: #F5F5F5;
  border-radius: 16rpx;
  border: 4rpx solid transparent;

  &.active {
    background-color: rgba(76, 175, 80, 0.1);
    border-color: var(--primary-color);
  }
}

.package-amount {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.package-gift {
  font-size: 22rpx;
  color: var(--danger-color);
}

.custom-amount {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid var(--border-color);
}

.custom-label {
  display: block;
  font-size: 28rpx;
  color: var(--text-secondary);
  margin-bottom: 16rpx;
}

.custom-input-wrap {
  display: flex;
  align-items: center;
  height: 88rpx;
  background-color: #F5F5F5;
  border-radius: 16rpx;
  padding: 0 24rpx;
}

.custom-prefix {
  font-size: 36rpx;
  font-weight: bold;
  margin-right: 16rpx;
}

.custom-input {
  flex: 1;
  height: 100%;
  font-size: 32rpx;
}

.pay-list {
  .pay-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }
  }
}

.pay-icon {
  font-size: 48rpx;
  margin-right: 20rpx;

  &.wechat {
    color: #07C160;
  }

  &.alipay {
    color: #1677FF;
  }
}

.pay-name {
  flex: 1;
  font-size: 28rpx;
}

.pay-check {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  .iconfont {
    font-size: 24rpx;
    color: var(--primary-color);
  }
}

.pay-item.active .pay-check {
  background-color: var(--primary-color);
  border-color: var(--primary-color);

  .iconfont {
    color: #FFFFFF;
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
}

.amount-info {
  margin-right: 30rpx;
}

.amount-label {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.amount-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: var(--danger-color);
}

.btn {
  flex: 1;
}
</style>
