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
        <!-- 测试充值 - 开发环境显示 -->
        <view
          v-if="isDev"
          :class="['pay-item', { active: payType === 'test' }]"
          @click="payType = 'test'"
        >
          <text class="pay-icon test">🧪</text>
          <view class="pay-info">
            <text class="pay-name">测试充值</text>
            <text class="pay-desc">开发环境直接到账</text>
          </view>
          <view :class="['pay-check', { active: payType === 'test' }]">
            <text v-if="payType === 'test'">✓</text>
          </view>
        </view>

        <view
          :class="['pay-item', { active: payType === 'wechat' }]"
          @click="payType = 'wechat'"
        >
          <text class="pay-icon wechat">💚</text>
          <view class="pay-info">
            <text class="pay-name">微信支付</text>
            <text class="pay-desc">推荐使用</text>
          </view>
          <view :class="['pay-check', { active: payType === 'wechat' }]">
            <text v-if="payType === 'wechat'">✓</text>
          </view>
        </view>

        <view
          :class="['pay-item', { active: payType === 'alipay' }]"
          @click="payType = 'alipay'"
        >
          <text class="pay-icon alipay">💙</text>
          <view class="pay-info">
            <text class="pay-name">支付宝</text>
            <text class="pay-desc">快捷支付</text>
          </view>
          <view :class="['pay-check', { active: payType === 'alipay' }]">
            <text v-if="payType === 'alipay'">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 开发环境提示 -->
    <view v-if="isDev" class="dev-notice">
      <text class="dev-icon">🔧</text>
      <text class="dev-text">当前为开发环境，可使用测试充值直接增加余额</text>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-action">
      <view class="amount-info">
        <text class="amount-label">支付金额</text>
        <text class="amount-value">¥{{ totalAmount }}</text>
        <text class="gift-info" v-if="selectedPackage?.giftAmount">
          +赠送¥{{ selectedPackage.giftAmount }}
        </text>
      </view>
      <view class="btn-primary" @click="handleRecharge">
        {{ payType === 'test' ? '立即测试充值' : '立即充值' }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { walletApi, type RechargePackage } from '@/api/wallet'

// 检查是否为开发环境
const isDev = ref(true) // 小程序端默认开启测试模式

// 状态
const packages = ref<RechargePackage[]>([])
const selectedPackage = ref<RechargePackage | null>(null)
const customAmount = ref('')
const payType = ref<'wechat' | 'alipay' | 'test'>('test') // 默认选择测试充值

// 计算总金额
const totalAmount = computed(() => {
  if (selectedPackage.value) {
    return selectedPackage.value.amount
  }
  return customAmount.value ? parseFloat(customAmount.value) : 0
})

// 计算赠送金额
const giftAmount = computed(() => {
  if (selectedPackage.value) {
    return selectedPackage.value.giftAmount || 0
  }
  return 0
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
    // 使用默认套餐
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

  // 测试充值
  if (payType.value === 'test') {
    await handleTestRecharge()
    return
  }

  // 正式充值
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

// 测试充值
async function handleTestRecharge() {
  try {
    uni.showLoading({ title: '测试充值中...' })

    const res = await walletApi.testRecharge({
      amount: totalAmount.value,
      giftAmount: giftAmount.value,
    })

    uni.hideLoading()

    if (res.success) {
      uni.showModal({
        title: '充值成功',
        content: `充值${res.amount}元，赠送${res.giftAmount}元\n当前余额：${res.newBalance}元`,
        showCancel: false,
        success: () => {
          uni.navigateBack()
        },
      })
    } else {
      uni.showToast({ title: res.message || '充值失败', icon: 'none' })
    }
  } catch (error: any) {
    uni.hideLoading()
    uni.showToast({ title: error?.message || '充值失败，请重试', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #FAF9F7;
  padding-bottom: 200rpx;
}

.section {
  margin: 24rpx;
}

.card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 24rpx;
}

.package-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.package-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 160rpx;
  background-color: #F8F8F8;
  border-radius: 20rpx;
  border: 3rpx solid transparent;
  transition: all 0.2s ease;

  &.active {
    background-color: #F0F9F0;
    border-color: #4CAF50;
  }
}

.package-amount {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 8rpx;
}

.package-gift {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 500;
}

.custom-amount {
  margin-top: 32rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #F0F0F0;
}

.custom-label {
  display: block;
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.custom-input-wrap {
  display: flex;
  align-items: center;
  height: 96rpx;
  background-color: #F8F8F8;
  border-radius: 16rpx;
  padding: 0 28rpx;
}

.custom-prefix {
  font-size: 40rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-right: 16rpx;
}

.custom-input {
  flex: 1;
  height: 100%;
  font-size: 34rpx;
  color: #1A1A1A;
}

.pay-list {
  .pay-item {
    display: flex;
    align-items: center;
    padding: 28rpx 0;
    border-bottom: 1rpx solid #F5F5F5;

    &:last-child {
      border-bottom: none;
    }

    &.active {
      .pay-name {
        color: #4CAF50;
      }
    }
  }
}

.pay-icon {
  font-size: 44rpx;
  margin-right: 20rpx;

  &.test {
    font-size: 40rpx;
  }
}

.pay-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pay-name {
  font-size: 30rpx;
  color: #1A1A1A;
  font-weight: 500;
}

.pay-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 4rpx;
}

.pay-check {
  width: 44rpx;
  height: 44rpx;
  border: 2rpx solid #E0E0E0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #FFFFFF;
  transition: all 0.2s ease;

  &.active {
    background-color: #4CAF50;
    border-color: #4CAF50;
  }
}

.dev-notice {
  margin: 24rpx;
  padding: 24rpx;
  background-color: #FFF8E1;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
}

.dev-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.dev-text {
  font-size: 26rpx;
  color: #F57C00;
  flex: 1;
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #FFFFFF;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.amount-info {
  margin-right: 32rpx;
}

.amount-label {
  font-size: 24rpx;
  color: #999999;
  display: block;
}

.amount-value {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #FF6B35;
  line-height: 1.2;
}

.gift-info {
  font-size: 22rpx;
  color: #4CAF50;
}

.btn-primary {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);
}
</style>
