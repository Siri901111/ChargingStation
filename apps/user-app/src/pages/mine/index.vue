<template>
  <view class="page">
    <!-- 用户信息头部 -->
    <view class="user-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="user-info" @click="handleUserClick">
        <image
          class="avatar"
          :src="userStore.userInfo?.avatar || '/static/avatar/default.png'"
          mode="aspectFill"
        />
        <view class="user-detail" v-if="userStore.isLoggedIn">
          <text class="nickname">{{ userStore.displayName }}</text>
          <text class="phone">{{ maskPhone(userStore.phone) }}</text>
        </view>
        <view class="user-detail" v-else>
          <text class="nickname">点击登录</text>
          <text class="phone">登录后享受更多服务</text>
        </view>
        <text class="iconfont icon-arrow-right"></text>
      </view>

      <!-- 会员卡信息 -->
      <view class="member-card" v-if="userStore.isLoggedIn && userStore.userInfo?.memberCardNo">
        <view class="card-info">
          <text class="card-type">{{ userStore.userInfo.cardType || '普通会员' }}</text>
          <text class="card-no">{{ userStore.userInfo.memberCardNo }}</text>
        </view>
        <view class="card-balance">
          <text class="balance-label">余额</text>
          <text class="balance-value">¥{{ userStore.balance.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-actions card">
      <view class="action-item" @click="goToPage(PAGE_PATH.WALLET)">
        <view class="action-icon">
          <text class="iconfont icon-wallet"></text>
        </view>
        <text class="action-text">钱包</text>
      </view>
      <view class="action-item" @click="goToPage(PAGE_PATH.ORDER)">
        <view class="action-icon">
          <text class="iconfont icon-order"></text>
        </view>
        <text class="action-text">订单</text>
      </view>
      <view class="action-item" @click="handleFavorites">
        <view class="action-icon">
          <text class="iconfont icon-star"></text>
        </view>
        <text class="action-text">收藏</text>
      </view>
      <view class="action-item" @click="handleCoupon">
        <view class="action-icon">
          <text class="iconfont icon-coupon"></text>
        </view>
        <text class="action-text">优惠券</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list card">
      <view class="menu-item" @click="handleStatistics">
        <text class="iconfont icon-chart menu-icon"></text>
        <text class="menu-text">充电统计</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
      <view class="menu-item" @click="handleInvoice">
        <text class="iconfont icon-invoice menu-icon"></text>
        <text class="menu-text">发票管理</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
      <view class="menu-item" @click="handleVehicle">
        <text class="iconfont icon-car menu-icon"></text>
        <text class="menu-text">我的车辆</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
    </view>

    <view class="menu-list card">
      <view class="menu-item" @click="goToPage('/pages-sub/settings/feedback')">
        <text class="iconfont icon-feedback menu-icon"></text>
        <text class="menu-text">意见反馈</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
      <view class="menu-item" @click="goToPage('/pages-sub/settings/about')">
        <text class="iconfont icon-info menu-icon"></text>
        <text class="menu-text">关于我们</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
      <view class="menu-item" @click="goToPage('/pages-sub/settings/index')">
        <text class="iconfont icon-settings menu-icon"></text>
        <text class="menu-text">设置</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" v-if="userStore.isLoggedIn" @click="handleLogout">
      退出登录
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'
import { PAGE_PATH } from '@/constants'
import { maskPhone } from '@/utils'

// Store
const userStore = useUserStore()

// 状态
const statusBarHeight = ref(0)

// 初始化
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
})

onShow(() => {
  // 刷新用户信息
  if (userStore.isLoggedIn) {
    userStore.fetchUserInfo()
  }
})

// 点击用户信息
function handleUserClick() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: PAGE_PATH.LOGIN })
  } else {
    // 跳转到个人资料页面
    uni.showToast({ title: '功能开发中', icon: 'none' })
  }
}

// 跳转页面
function goToPage(path: string) {
  if (!userStore.checkLoginAndNavigate()) return
  uni.navigateTo({ url: path })
}

// 收藏站点
function handleFavorites() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 优惠券
function handleCoupon() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 充电统计
function handleStatistics() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 发票管理
function handleInvoice() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 我的车辆
function handleVehicle() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
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
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: 50rpx;
}

.user-header {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  padding-bottom: 40rpx;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 30rpx;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    margin-right: 24rpx;
  }

  .user-detail {
    flex: 1;
  }

  .nickname {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #FFFFFF;
    margin-bottom: 8rpx;
  }

  .phone {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
  }

  .iconfont {
    font-size: 32rpx;
    color: rgba(255, 255, 255, 0.6);
  }
}

.member-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 30rpx;
  padding: 24rpx 30rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  backdrop-filter: blur(10px);
}

.card-info {
  .card-type {
    display: block;
    font-size: 28rpx;
    color: #FFFFFF;
    font-weight: bold;
    margin-bottom: 8rpx;
  }

  .card-no {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.card-balance {
  text-align: right;

  .balance-label {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8rpx;
  }

  .balance-value {
    font-size: 40rpx;
    font-weight: bold;
    color: #FFFFFF;
  }
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  margin: -30rpx 24rpx 24rpx;
  padding: 30rpx 0;
  position: relative;
  z-index: 10;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.2));
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;

  .iconfont {
    font-size: 40rpx;
    color: var(--primary-color);
  }
}

.action-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.menu-list {
  margin: 0 24rpx 24rpx;
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }

  .menu-icon {
    font-size: 40rpx;
    color: var(--primary-color);
    margin-right: 20rpx;
  }

  .menu-text {
    flex: 1;
    font-size: 28rpx;
  }

  .icon-arrow-right {
    font-size: 28rpx;
    color: var(--text-placeholder);
  }
}

.logout-btn {
  margin: 40rpx 24rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  border-radius: 44rpx;
  font-size: 30rpx;
  color: var(--danger-color);
}
</style>
