<template>
  <view class="page">
    <!-- 顶部余额卡片 -->
    <view class="balance-section">
      <view class="balance-card">
        <view class="balance-header">
          <text class="balance-label">账户余额(元)</text>
          <view class="balance-badge" v-if="userStore.userInfo?.cardType">
            <text>{{ userStore.userInfo.cardType }}</text>
          </view>
        </view>
        <view class="balance-amount">
          <text class="amount-integer">{{ balanceInteger }}</text>
          <text class="amount-decimal">.{{ balanceDecimal }}</text>
        </view>
        <view class="balance-footer" v-if="userStore.userInfo?.memberCardNo">
          <text class="card-no">卡号 {{ userStore.userInfo.memberCardNo }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-grid">
        <view class="action-item" @click="goToRecharge">
          <view class="action-icon recharge-icon">
            <text>💳</text>
          </view>
          <view class="action-content">
            <text class="action-title">充值</text>
            <text class="action-desc">余额充值</text>
          </view>
        </view>
        <view class="action-item" @click="goToRecords">
          <view class="action-icon records-icon">
            <text>📝</text>
          </view>
          <view class="action-content">
            <text class="action-title">明细</text>
            <text class="action-desc">收支记录</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 充值套餐 -->
    <view class="package-section">
      <view class="section-header">
        <text class="section-title">充值优惠</text>
        <view class="section-badge">
          <text>充值即送</text>
        </view>
      </view>
      <view class="package-grid">
        <view
          v-for="pkg in packages"
          :key="pkg.id"
          class="package-card"
          :class="{ 'has-gift': pkg.giftAmount > 0 }"
          @click="handlePackageClick(pkg)"
        >
          <view class="package-amount">
            <text class="amount-symbol">¥</text>
            <text class="amount-value">{{ pkg.amount }}</text>
          </view>
          <view v-if="pkg.giftAmount > 0" class="package-gift">
            <text class="gift-tag">送</text>
            <text class="gift-amount">¥{{ pkg.giftAmount }}</text>
          </view>
          <text v-if="pkg.giftAmount > 0" class="package-total">到账 ¥{{ pkg.amount + pkg.giftAmount }}</text>
          <text v-else class="package-total">原价充值</text>
        </view>
      </view>
    </view>

    <!-- 最近消费 -->
    <view class="record-section">
      <view class="section-header">
        <text class="section-title">最近消费</text>
        <view class="section-more" @click="goToRecords">
          <text>全部</text>
          <text class="more-arrow">›</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="recentRecords.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无消费记录</text>
      </view>

      <!-- 记录列表 -->
      <view v-else class="record-list">
        <view v-for="record in recentRecords" :key="record.id" class="record-item">
          <view class="record-left">
            <view class="record-icon">
              <text>⚡</text>
            </view>
            <view class="record-info">
              <text class="record-title">{{ record.type }}</text>
              <text class="record-time">{{ formatDate(record.createTime, 'MM-DD HH:mm') }}</text>
            </view>
          </view>
          <text class="record-amount">-¥{{ record.amount.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="bottom-safe"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'
import { walletApi, type RechargePackage } from '@/api/wallet'
import { formatDate } from '@/utils'
import { PAGE_PATH } from '@/constants'

const userStore = useUserStore()

const packages = ref<RechargePackage[]>([])
const recentRecords = ref<{ id: number; orderNo: string; amount: number; type: string; createTime: string }[]>([])

// 计算属性：分离余额的整数和小数部分
const balanceInteger = computed(() => Math.floor(userStore.balance).toString())
const balanceDecimal = computed(() => {
  const decimal = (userStore.balance % 1).toFixed(2).slice(2)
  return decimal
})

onMounted(() => {
  fetchPackages()
  fetchRecentRecords()
})

onShow(() => {
  userStore.fetchUserInfo()
})

async function fetchPackages() {
  try {
    packages.value = await walletApi.getRechargePackages()
  } catch {
    packages.value = [
      { id: 1, amount: 50, giftAmount: 0 },
      { id: 2, amount: 100, giftAmount: 5 },
      { id: 3, amount: 200, giftAmount: 15 },
      { id: 4, amount: 500, giftAmount: 50 },
    ]
  }
}

async function fetchRecentRecords() {
  try {
    const res = await walletApi.getConsumeRecords({ pageSize: 5 })
    recentRecords.value = res.list
  } catch {
    recentRecords.value = []
  }
}

function handlePackageClick(pkg: RechargePackage) {
  uni.navigateTo({ url: `${PAGE_PATH.RECHARGE}?packageId=${pkg.id}` })
}

function goToRecharge() {
  uni.navigateTo({ url: PAGE_PATH.RECHARGE })
}

function goToRecords() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #FAF9F7;
}

/* 余额卡片区域 */
.balance-section {
  padding: 32rpx;
  padding-top: 16rpx;
}

.balance-card {
  background: linear-gradient(145deg, #1A1A1A 0%, #2D2D2D 100%);
  border-radius: 28rpx;
  padding: 48rpx 40rpx;
  color: #FFFFFF;
  position: relative;
  overflow: hidden;
}

.balance-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300rpx;
  height: 300rpx;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
}

.balance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.balance-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
}

.balance-badge {
  padding: 6rpx 16rpx;
  background: rgba(184, 153, 111, 0.3);
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #D4C4A8;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  margin-bottom: 32rpx;
}

.amount-integer {
  font-size: 80rpx;
  font-weight: 700;
  letter-spacing: -2rpx;
  font-variant-numeric: tabular-nums;
}

.amount-decimal {
  font-size: 36rpx;
  font-weight: 500;
  opacity: 0.8;
}

.balance-footer {
  padding-top: 24rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.card-no {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 2rpx;
}

/* 操作按钮区域 */
.action-section {
  padding: 0 32rpx;
  margin-bottom: 32rpx;
}

.action-grid {
  display: flex;
  gap: 24rpx;
}

.action-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
}

.action-item:active {
  transform: scale(0.98);
  background: #FAFAFA;
}

.action-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.recharge-icon {
  background: linear-gradient(135deg, #6BA58E 0%, #5A8F7B 100%);
}

.records-icon {
  background: linear-gradient(135deg, #C9B08B 0%, #B8996F 100%);
}

.action-content {
  flex: 1;
}

.action-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 6rpx;
}

.action-desc {
  font-size: 24rpx;
  color: #999999;
}

/* 充值套餐区域 */
.package-section {
  padding: 0 32rpx;
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.section-badge {
  padding: 6rpx 16rpx;
  background: rgba(196, 85, 74, 0.1);
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #C4554A;
}

.section-more {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 26rpx;
  color: #999999;
}

.more-arrow {
  font-size: 28rpx;
  color: #CCCCCC;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.package-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  text-align: center;
  border: 2rpx solid #F0F0F0;
  transition: all 0.2s;
}

.package-card:active {
  border-color: #5A8F7B;
  background: rgba(90, 143, 123, 0.03);
}

.package-card.has-gift {
  position: relative;
}

.package-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 12rpx;
}

.amount-symbol {
  font-size: 28rpx;
  font-weight: 500;
  color: #1A1A1A;
  margin-right: 4rpx;
}

.amount-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #1A1A1A;
  font-variant-numeric: tabular-nums;
}

.package-gift {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.gift-tag {
  padding: 2rpx 10rpx;
  background: #C4554A;
  border-radius: 6rpx;
  font-size: 20rpx;
  color: #FFFFFF;
}

.gift-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: #C4554A;
}

.package-total {
  font-size: 22rpx;
  color: #999999;
}

/* 消费记录区域 */
.record-section {
  padding: 0 32rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  background: #FFFFFF;
  border-radius: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #CCCCCC;
}

.record-list {
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #F5F5F5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.record-icon {
  width: 64rpx;
  height: 64rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.record-title {
  font-size: 28rpx;
  color: #1A1A1A;
}

.record-time {
  font-size: 24rpx;
  color: #999999;
}

.record-amount {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  font-variant-numeric: tabular-nums;
}

/* 底部安全区域 */
.bottom-safe {
  height: 100rpx;
}
</style>
