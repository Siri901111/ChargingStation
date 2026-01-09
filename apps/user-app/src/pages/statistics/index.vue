<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @click="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">充电统计</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <scroll-view
      class="content"
      scroll-y
      :style="{ paddingTop: navBarHeight + 'px' }"
    >
      <!-- 统计卡片 -->
      <view class="stats-section">
        <!-- 总计卡片 -->
        <view class="stat-card total-card">
          <view class="card-header">
            <text class="card-title">累计统计</text>
          </view>
          <view class="stat-grid">
            <view class="stat-item">
              <text class="stat-label">累计充电</text>
              <text class="stat-value font-num">{{ statistics.totalCount }}</text>
              <text class="stat-unit">次</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">总电量</text>
              <text class="stat-value font-num">{{ statistics.totalElectricity.toFixed(1) }}</text>
              <text class="stat-unit">kWh</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">总费用</text>
              <text class="stat-value font-num">¥{{ statistics.totalAmount.toFixed(2) }}</text>
            </view>
          </view>
        </view>

        <!-- 本月统计卡片 -->
        <view class="stat-card month-card">
          <view class="card-header">
            <text class="card-title">本月统计</text>
            <text class="card-subtitle">{{ currentMonth }}</text>
          </view>
          <view class="stat-grid">
            <view class="stat-item">
              <text class="stat-label">充电次数</text>
              <text class="stat-value font-num">{{ statistics.thisMonthCount }}</text>
              <text class="stat-unit">次</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">充电费用</text>
              <text class="stat-value font-num">¥{{ statistics.thisMonthAmount.toFixed(2) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 数据明细 -->
      <view class="detail-section">
        <view class="section-header">
          <text class="section-title">数据明细</text>
        </view>
        <view class="detail-list">
          <view class="detail-item">
            <view class="detail-left">
              <text class="detail-icon">⚡</text>
              <text class="detail-text">累计充电次数</text>
            </view>
            <text class="detail-value font-num">{{ statistics.totalCount }}次</text>
          </view>
          <view class="detail-item">
            <view class="detail-left">
              <text class="detail-icon">🔋</text>
              <text class="detail-text">累计充电量</text>
            </view>
            <text class="detail-value font-num">{{ statistics.totalElectricity.toFixed(1) }}kWh</text>
          </view>
          <view class="detail-item">
            <view class="detail-left">
              <text class="detail-icon">💰</text>
              <text class="detail-text">累计消费金额</text>
            </view>
            <text class="detail-value font-num">¥{{ statistics.totalAmount.toFixed(2) }}</text>
          </view>
          <view class="detail-item">
            <view class="detail-left">
              <text class="detail-icon">📅</text>
              <text class="detail-text">本月充电次数</text>
            </view>
            <text class="detail-value font-num">{{ statistics.thisMonthCount }}次</text>
          </view>
          <view class="detail-item">
            <view class="detail-left">
              <text class="detail-icon">💵</text>
              <text class="detail-text">本月消费金额</text>
            </view>
            <text class="detail-value font-num">¥{{ statistics.thisMonthAmount.toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { orderApi } from '@/api/order'

// 状态
const statusBarHeight = ref(0)
const navBarHeight = ref(0)
const loading = ref(false)
const statistics = ref({
  totalCount: 0,
  totalAmount: 0,
  totalElectricity: 0,
  thisMonthCount: 0,
  thisMonthAmount: 0,
})

// 当前月份
const currentMonth = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  return `${year}年${month}月`
})

// 初始化
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navBarHeight.value = statusBarHeight.value + 44
  fetchStatistics()
})

// 获取统计数据
async function fetchStatistics() {
  loading.value = true
  try {
    const stats = await orderApi.getOrderStatistics()
    statistics.value = stats
  } catch (error) {
    console.error('获取统计数据失败', error)
    uni.showToast({ title: '获取统计数据失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 返回
function handleBack() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #FAF9F7;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #FFFFFF;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
}

.nav-back {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
  border-radius: 50%;
}

.back-icon {
  font-size: 48rpx;
  color: #333333;
  font-weight: 300;
  margin-top: -4rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.nav-placeholder {
  width: 72rpx;
}

.content {
  height: 100vh;
}

.stats-section {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.total-card {
  background: linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%);
  color: #FFFFFF;
}

.month-card {
  background: linear-gradient(135deg, #6BA58E 0%, #5A8F7B 100%);
  color: #FFFFFF;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.card-title {
  font-size: 28rpx;
  font-weight: 500;
  opacity: 0.9;
}

.card-subtitle {
  font-size: 24rpx;
  opacity: 0.7;
}

.stat-grid {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.stat-label {
  font-size: 26rpx;
  opacity: 0.8;
  margin-right: auto;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 600;
}

.stat-unit {
  font-size: 24rpx;
  opacity: 0.7;
}

.font-num {
  font-variant-numeric: tabular-nums;
}

.detail-section {
  padding: 0 24rpx;
}

.section-header {
  padding: 16rpx 8rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #999999;
  letter-spacing: 2rpx;
}

.detail-list {
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #F5F5F5;

  &:last-child {
    border-bottom: none;
  }
}

.detail-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.detail-icon {
  font-size: 32rpx;
}

.detail-text {
  font-size: 28rpx;
  color: #1A1A1A;
}

.detail-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #5A8F7B;
}

.bottom-space {
  height: 120rpx;
}
</style>
