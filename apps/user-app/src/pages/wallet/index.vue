<template>
  <view class="page">
    <!-- 余额卡片 -->
    <view class="balance-card">
      <view class="balance-header">
        <text class="balance-label">账户余额（元）</text>
        <text class="balance-tip" @click="goToRecords">明细 ></text>
      </view>
      <view class="balance-value">{{ userStore.balance.toFixed(2) }}</view>
      <view class="balance-actions">
        <view class="btn btn-outline" @click="goToRecharge">充值</view>
      </view>
    </view>

    <!-- 充值优惠 -->
    <view class="section card">
      <view class="section-title">充值优惠</view>
      <view class="package-list">
        <view
          v-for="pkg in packages"
          :key="pkg.id"
          :class="['package-item', { active: selectedPackage === pkg.id }]"
          @click="selectedPackage = pkg.id"
        >
          <view class="package-amount">¥{{ pkg.amount }}</view>
          <view class="package-gift" v-if="pkg.giftAmount > 0">送¥{{ pkg.giftAmount }}</view>
        </view>
      </view>
    </view>

    <!-- 消费记录 -->
    <view class="section card">
      <view class="section-header">
        <text class="section-title">最近消费</text>
        <text class="section-more" @click="goToRecords">查看全部 ></text>
      </view>
      <view v-if="recentRecords.length === 0" class="empty-tip">
        暂无消费记录
      </view>
      <view v-else class="record-list">
        <view v-for="record in recentRecords" :key="record.id" class="record-item">
          <view class="record-info">
            <text class="record-title">{{ record.type }}</text>
            <text class="record-time">{{ formatDate(record.createTime, 'MM-DD HH:mm') }}</text>
          </view>
          <text class="record-amount">-¥{{ record.amount.toFixed(2) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { walletApi, type RechargePackage } from '@/api/wallet'
import { formatDate } from '@/utils'
import { PAGE_PATH } from '@/constants'

// Store
const userStore = useUserStore()

// 状态
const packages = ref<RechargePackage[]>([])
const selectedPackage = ref<number | null>(null)
const recentRecords = ref<{ id: number; orderNo: string; amount: number; type: string; createTime: string }[]>([])

// 初始化
onMounted(() => {
  fetchPackages()
  fetchRecentRecords()
  userStore.fetchUserInfo()
})

// 获取充值套餐
async function fetchPackages() {
  try {
    packages.value = await walletApi.getRechargePackages()
    if (packages.value.length > 0) {
      selectedPackage.value = packages.value[0].id
    }
  } catch (error) {
    // 使用默认套餐
    packages.value = [
      { id: 1, amount: 50, giftAmount: 0 },
      { id: 2, amount: 100, giftAmount: 5 },
      { id: 3, amount: 200, giftAmount: 15 },
      { id: 4, amount: 500, giftAmount: 50 },
    ]
    selectedPackage.value = 1
  }
}

// 获取最近消费记录
async function fetchRecentRecords() {
  try {
    const res = await walletApi.getConsumeRecords({ pageSize: 5 })
    recentRecords.value = res.list
  } catch (error) {
    console.error('获取消费记录失败', error)
  }
}

// 跳转充值
function goToRecharge() {
  uni.navigateTo({ url: PAGE_PATH.RECHARGE })
}

// 跳转记录
function goToRecords() {
  uni.navigateTo({ url: '/pages/wallet/records' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.balance-card {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  padding: 40rpx 30rpx;
  color: #FFFFFF;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.balance-label {
  font-size: 28rpx;
  opacity: 0.9;
}

.balance-tip {
  font-size: 26rpx;
  opacity: 0.8;
}

.balance-value {
  font-size: 72rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.balance-actions {
  .btn {
    width: 200rpx;
    height: 72rpx;
    border-color: #FFFFFF;
    color: #FFFFFF;
  }
}

.section {
  margin: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.section-more {
  font-size: 26rpx;
  color: var(--text-secondary);
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
  background-color: #F5F5F5;
  border-radius: 16rpx;
  border: 4rpx solid transparent;

  &.active {
    background-color: rgba(76, 175, 80, 0.1);
    border-color: var(--primary-color);
  }
}

.package-amount {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.package-gift {
  font-size: 24rpx;
  color: var(--danger-color);
}

.empty-tip {
  text-align: center;
  padding: 40rpx;
  color: var(--text-placeholder);
  font-size: 28rpx;
}

.record-list {
  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }
  }
}

.record-info {
  .record-title {
    display: block;
    font-size: 28rpx;
    margin-bottom: 8rpx;
  }

  .record-time {
    font-size: 24rpx;
    color: var(--text-secondary);
  }
}

.record-amount {
  font-size: 30rpx;
  font-weight: bold;
  color: var(--text-primary);
}
</style>
