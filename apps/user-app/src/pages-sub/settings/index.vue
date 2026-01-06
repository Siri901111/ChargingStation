<template>
  <view class="page">
    <view class="menu-list card">
      <view class="menu-item">
        <text class="menu-text">消息通知</text>
        <switch :checked="notifications" @change="notifications = !notifications" color="#4CAF50" />
      </view>
      <view class="menu-item">
        <text class="menu-text">声音</text>
        <switch :checked="sound" @change="sound = !sound" color="#4CAF50" />
      </view>
      <view class="menu-item">
        <text class="menu-text">震动</text>
        <switch :checked="vibrate" @change="vibrate = !vibrate" color="#4CAF50" />
      </view>
    </view>

    <view class="menu-list card">
      <view class="menu-item" @click="handleClearCache">
        <text class="menu-text">清除缓存</text>
        <view class="menu-right">
          <text class="menu-value">{{ cacheSize }}</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>
      <view class="menu-item" @click="handleCheckUpdate">
        <text class="menu-text">检查更新</text>
        <view class="menu-right">
          <text class="menu-value">v1.0.0</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>
    </view>

    <view class="menu-list card">
      <view class="menu-item" @click="goToAbout">
        <text class="menu-text">关于我们</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
      <view class="menu-item" @click="goToAgreement">
        <text class="menu-text">用户协议</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
      <view class="menu-item" @click="goToPrivacy">
        <text class="menu-text">隐私政策</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
    </view>

    <view class="logout-btn" v-if="userStore.isLoggedIn" @click="handleLogout">
      退出登录
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'

// Store
const userStore = useUserStore()

// 状态
const notifications = ref(true)
const sound = ref(true)
const vibrate = ref(true)
const cacheSize = ref('0 KB')

// 初始化
onMounted(() => {
  calculateCacheSize()
})

// 计算缓存大小
function calculateCacheSize() {
  try {
    const info = uni.getStorageInfoSync()
    const sizeKB = info.currentSize
    if (sizeKB > 1024) {
      cacheSize.value = `${(sizeKB / 1024).toFixed(1)} MB`
    } else {
      cacheSize.value = `${sizeKB} KB`
    }
  } catch {
    cacheSize.value = '0 KB'
  }
}

// 清除缓存
function handleClearCache() {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        cacheSize.value = '0 KB'
        uni.showToast({ title: '清除成功', icon: 'success' })
      }
    },
  })
}

// 检查更新
function handleCheckUpdate() {
  uni.showToast({ title: '已是最新版本', icon: 'success' })
}

// 跳转页面
function goToAbout() {
  uni.navigateTo({ url: '/pages-sub/settings/about' })
}

function goToAgreement() {
  uni.navigateTo({ url: '/pages-sub/settings/agreement' })
}

function goToPrivacy() {
  uni.navigateTo({ url: '/pages-sub/settings/privacy' })
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
        uni.switchTab({ url: '/pages/index/index' })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 24rpx;
}

.menu-list {
  margin-bottom: 24rpx;
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
}

.menu-text {
  font-size: 28rpx;
}

.menu-right {
  display: flex;
  align-items: center;
}

.menu-value {
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-right: 10rpx;
}

.icon-arrow-right {
  font-size: 28rpx;
  color: var(--text-placeholder);
}

.logout-btn {
  margin-top: 60rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  font-size: 30rpx;
  color: var(--danger-color);
}
</style>
