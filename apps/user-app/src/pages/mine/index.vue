<template>
  <view class="page safe-area">
    <!-- 顶部状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的</text>
    </view>

    <!-- 用户信息卡片 -->
    <view class="user-section">
      <view class="user-card" @click="handleUserClick">
        <!-- 未登录态 -->
        <view v-if="!userStore.isLoggedIn" class="user-guest">
          <view class="avatar-wrapper">
            <view class="avatar-placeholder">
              <text class="avatar-icon">👤</text>
            </view>
          </view>
          <view class="guest-info">
            <text class="guest-title">点击登录</text>
            <text class="guest-desc">登录后享受更多服务</text>
          </view>
          <view class="arrow-icon">
            <text>›</text>
          </view>
        </view>

        <!-- 已登录态 -->
        <view v-else class="user-logged">
          <view class="avatar-wrapper">
            <image
              class="avatar-img"
              :src="userStore.userInfo?.avatar || defaultAvatar"
              mode="aspectFill"
            />
            <view class="avatar-badge">✓</view>
          </view>
          <view class="user-info">
            <text class="user-name">{{ userStore.displayName }}</text>
            <view class="user-meta">
              <view class="member-tag">
                <text>{{ userStore.userInfo?.cardType || '普通会员' }}</text>
              </view>
              <text class="user-phone">{{ maskPhone(userStore.phone) }}</text>
            </view>
          </view>
          <view class="arrow-icon">
            <text>›</text>
          </view>
        </view>
      </view>

      <!-- 数据统计 - 仅登录后显示 -->
      <view v-if="userStore.isLoggedIn" class="stats-card">
        <view class="stat-item" @click="goToWallet">
          <text class="stat-value">{{ userStore.balance.toFixed(2) }}</text>
          <text class="stat-label">余额(元)</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="goToOrders">
          <text class="stat-value">{{ orderCount }}</text>
          <text class="stat-label">累计充电</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="goToStatistics">
          <text class="stat-value">{{ totalElectricity }}</text>
          <text class="stat-label">总电量(度)</text>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-section">
      <view class="quick-grid">
        <view class="quick-item" @click="goToWallet">
          <view class="quick-icon wallet-icon">
            <text>💰</text>
          </view>
          <text class="quick-label">钱包</text>
        </view>
        <view class="quick-item" @click="goToOrders">
          <view class="quick-icon order-icon">
            <text>📋</text>
          </view>
          <text class="quick-label">订单</text>
        </view>
        <view class="quick-item" @click="handleFavorites">
          <view class="quick-icon favorite-icon">
            <text>⭐</text>
          </view>
          <text class="quick-label">收藏</text>
        </view>
      </view>
    </view>

    <!-- 服务列表 -->
    <view class="list-section">
      <view class="section-header">
        <text class="section-title">服务</text>
      </view>
      <view class="list-card">
        <view class="list-item" @click="goToStatistics">
          <view class="item-left">
            <text class="item-emoji">📊</text>
            <text class="item-text">充电统计</text>
          </view>
          <view class="item-right">
            <text class="item-hint">查看充电数据</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 其他设置 -->
    <view class="list-section">
      <view class="section-header">
        <text class="section-title">其他</text>
      </view>
      <view class="list-card">
        <view class="list-item" @click="goToFeedback">
          <view class="item-left">
            <text class="item-emoji">💬</text>
            <text class="item-text">意见反馈</text>
          </view>
          <view class="item-right">
            <text class="item-arrow">›</text>
          </view>
        </view>
        <view class="list-item" @click="goToAbout">
          <view class="item-left">
            <text class="item-emoji">ℹ️</text>
            <text class="item-text">关于我们</text>
          </view>
          <view class="item-right">
            <text class="item-hint">v1.0.0</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
        <view class="list-item" @click="goToSettings">
          <view class="item-left">
            <text class="item-emoji">⚙️</text>
            <text class="item-text">设置</text>
          </view>
          <view class="item-right">
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view v-if="userStore.isLoggedIn" class="logout-section">
      <view class="logout-btn" @click="handleLogout">
        <text>退出登录</text>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="bottom-safe"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'
import { orderApi } from '@/api/order'
import { PAGE_PATH } from '@/constants'
import { maskPhone } from '@/utils'

const userStore = useUserStore()

const statusBarHeight = ref(0)
const orderCount = ref(0)
const totalElectricity = ref('0.0')
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
})

onShow(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchUserInfo()
    fetchStatistics()
  }
})

async function fetchStatistics() {
  try {
    const stats = await orderApi.getOrderStatistics()
    orderCount.value = stats.totalCount
    totalElectricity.value = stats.totalElectricity.toFixed(1)
  } catch (error) {
    console.error('获取统计失败', error)
  }
}

function handleUserClick() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: PAGE_PATH.LOGIN })
  } else {
    uni.navigateTo({ url: PAGE_PATH.PROFILE })
  }
}

function goToWallet() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.navigateTo({ url: PAGE_PATH.WALLET })
}

function goToOrders() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.switchTab({ url: PAGE_PATH.ORDER })
}

function goToStatistics() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.navigateTo({ url: '/pages/statistics/index' })
}

function handleFavorites() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.navigateTo({ url: PAGE_PATH.FAVORITE })
}


function goToFeedback() {
  uni.navigateTo({ url: '/pages-sub/settings/feedback' })
}

function goToAbout() {
  uni.navigateTo({ url: '/pages-sub/settings/about' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages-sub/settings/index' })
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    confirmColor: '#1A1A1A',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
/* 页面容器 */
.page {
  min-height: 100vh;
  background: #FAF9F7;
}

.status-bar {
  background: transparent;
}

/* 页面标题 */
.page-header {
  padding: 24rpx 40rpx 32rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #1A1A1A;
  letter-spacing: 2rpx;
}

/* 用户区域 */
.user-section {
  padding: 0 32rpx;
  margin-bottom: 32rpx;
}

.user-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

/* 未登录态 */
.user-guest {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  margin-right: 28rpx;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #F5F5F5 0%, #E8E8E8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 48rpx;
}

.guest-info {
  flex: 1;
}

.guest-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8rpx;
}

.guest-desc {
  font-size: 26rpx;
  color: #999999;
}

.arrow-icon {
  font-size: 40rpx;
  color: #CCCCCC;
  font-weight: 300;
}

/* 已登录态 */
.user-logged {
  display: flex;
  align-items: center;
}

.avatar-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #F5F5F5;
}

.avatar-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32rpx;
  height: 32rpx;
  background: #5A8F7B;
  border-radius: 50%;
  border: 4rpx solid #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18rpx;
  color: #FFFFFF;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12rpx;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.member-tag {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 16rpx;
  background: rgba(184, 153, 111, 0.1);
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #B8996F;
  font-weight: 500;
}

.user-phone {
  font-size: 26rpx;
  color: #999999;
}

/* 数据统计卡片 */
.stats-card {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx 20rpx;
  margin-top: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 44rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8rpx;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #F0F0F0;
}

/* 快捷入口 */
.quick-section {
  padding: 0 32rpx;
  margin-bottom: 32rpx;
}

.quick-grid {
  display: flex;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.quick-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.wallet-icon {
  background: linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%);
}

.order-icon {
  background: linear-gradient(135deg, #6BA58E 0%, #5A8F7B 100%);
}

.favorite-icon {
  background: linear-gradient(135deg, #C9B08B 0%, #B8996F 100%);
}

.coupon-icon {
  background: linear-gradient(135deg, #D6736A 0%, #C4554A 100%);
}

.quick-label {
  font-size: 24rpx;
  color: #666666;
}

/* 列表区域 */
.list-section {
  padding: 0 32rpx;
  margin-bottom: 24rpx;
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

.list-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 40rpx;
  border-bottom: 1rpx solid #F5F5F5;
  transition: background 0.2s;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:active {
  background: #FAFAFA;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.item-emoji {
  font-size: 36rpx;
}

.item-text {
  font-size: 30rpx;
  color: #1A1A1A;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.item-hint {
  font-size: 26rpx;
  color: #CCCCCC;
}

.item-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
  font-weight: 300;
}

/* 退出登录 */
.logout-section {
  padding: 40rpx 32rpx;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  font-size: 30rpx;
  color: #C4554A;
  font-weight: 500;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
}

.logout-btn:active {
  background: #FFF5F4;
  transform: scale(0.98);
}

/* 底部安全区域 */
.bottom-safe {
  height: 120rpx;
}
</style>
