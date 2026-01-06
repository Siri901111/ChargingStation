<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="location" @click="handleLocationClick">
          <text class="iconfont icon-location"></text>
          <text class="location-text">{{ locationStore.locationText }}</text>
          <text class="iconfont icon-arrow-down"></text>
        </view>
        <view class="search-box" @click="handleSearchClick">
          <text class="iconfont icon-search"></text>
          <text class="search-placeholder">搜索充电站</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view
      class="content"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      :style="{ paddingTop: navBarHeight + 'px' }"
    >
      <!-- 正在充电提示 -->
      <view v-if="chargingStore.isCharging" class="charging-tip card" @click="goToCharging">
        <view class="charging-info">
          <view class="charging-icon">
            <text class="iconfont icon-charging"></text>
          </view>
          <view class="charging-detail">
            <text class="charging-title">正在充电中</text>
            <text class="charging-station">{{ chargingStore.chargingStatus?.stationName }}</text>
          </view>
        </view>
        <view class="charging-action">
          <text class="charging-amount">¥{{ chargingStore.chargingAmount.toFixed(2) }}</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>

      <!-- 快捷入口 -->
      <view class="quick-entry card">
        <view class="entry-item" @click="handleScan">
          <view class="entry-icon scan">
            <text class="iconfont icon-scan"></text>
          </view>
          <text class="entry-text">扫码充电</text>
        </view>
        <view class="entry-item" @click="goToMap">
          <view class="entry-icon map">
            <text class="iconfont icon-map"></text>
          </view>
          <text class="entry-text">附近站点</text>
        </view>
        <view class="entry-item" @click="goToOrders">
          <view class="entry-icon order">
            <text class="iconfont icon-order"></text>
          </view>
          <text class="entry-text">充电记录</text>
        </view>
        <view class="entry-item" @click="goToWallet">
          <view class="entry-icon wallet">
            <text class="iconfont icon-wallet"></text>
          </view>
          <text class="entry-text">我的钱包</text>
        </view>
      </view>

      <!-- 附近站点 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">附近站点</text>
          <view class="section-more" @click="goToMap">
            <text>查看更多</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view v-if="loading" class="loading-wrap">
          <text>加载中...</text>
        </view>

        <view v-else-if="nearbyStations.length === 0" class="empty">
          <text class="empty-text">暂无附近站点</text>
        </view>

        <view v-else class="station-list">
          <view
            v-for="station in nearbyStations"
            :key="station.id"
            class="station-card card"
            @click="goToStationDetail(station.id)"
          >
            <view class="station-info">
              <view class="station-name">{{ station.name }}</view>
              <view class="station-address line-clamp-1">{{ station.address || station.city }}</view>
              <view class="station-tags">
                <text class="tag tag-primary" v-if="station.fastFree > 0">快充空闲{{ station.fastFree }}</text>
                <text class="tag tag-warning" v-if="station.slowFree > 0">慢充空闲{{ station.slowFree }}</text>
              </view>
            </view>
            <view class="station-right">
              <view class="station-distance" v-if="station.distance">
                {{ formatDistance(station.distance) }}
              </view>
              <view class="station-price" v-if="station.price">
                <text class="price-value">¥{{ station.price }}</text>
                <text class="price-unit">/度</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useLocationStore } from '@/store/modules/location'
import { useChargingStore } from '@/store/modules/charging'
import { useUserStore } from '@/store/modules/user'
import { stationApi, type Station } from '@/api/station'
import { formatDistance } from '@/utils'
import { PAGE_PATH } from '@/constants'

// Store
const locationStore = useLocationStore()
const chargingStore = useChargingStore()
const userStore = useUserStore()

// 状态
const statusBarHeight = ref(0)
const navBarHeight = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const nearbyStations = ref<Station[]>([])

// 初始化
onMounted(() => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navBarHeight.value = statusBarHeight.value + 44

  // 获取位置和站点
  initData()
})

onShow(() => {
  // 检查充电状态
  if (userStore.isLoggedIn) {
    chargingStore.fetchChargingStatus()
  }
})

// 初始化数据
async function initData() {
  loading.value = true
  try {
    await locationStore.getCurrentLocation()
    await fetchNearbyStations()
  } finally {
    loading.value = false
  }
}

// 获取附近站点
async function fetchNearbyStations() {
  if (!locationStore.currentLocation) return

  try {
    const { latitude, longitude } = locationStore.currentLocation
    const res = await stationApi.getNearbyStations({
      latitude,
      longitude,
      radius: 5000,
      pageSize: 5,
    })
    nearbyStations.value = res.list
  } catch (error) {
    console.error('获取附近站点失败', error)
  }
}

// 下拉刷新
async function onRefresh() {
  refreshing.value = true
  await initData()
  refreshing.value = false
}

// 点击定位
function handleLocationClick() {
  locationStore.getCurrentLocation()
}

// 点击搜索
function handleSearchClick() {
  uni.navigateTo({ url: '/pages/map/index?search=1' })
}

// 扫码充电
function handleScan() {
  if (!userStore.checkLoginAndNavigate()) return

  // #ifdef MP-WEIXIN
  uni.scanCode({
    onlyFromCamera: true,
    success: (res) => {
      // 解析二维码，跳转充电页面
      uni.navigateTo({
        url: `/pages/scan/index?code=${encodeURIComponent(res.result)}`,
      })
    },
    fail: () => {
      uni.showToast({ title: '扫码失败', icon: 'none' })
    },
  })
  // #endif

  // #ifdef H5
  uni.navigateTo({ url: '/pages/scan/index' })
  // #endif
}

// 跳转页面
function goToMap() {
  uni.switchTab({ url: PAGE_PATH.MAP })
}

function goToOrders() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.switchTab({ url: PAGE_PATH.ORDER })
}

function goToWallet() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.navigateTo({ url: PAGE_PATH.WALLET })
}

function goToCharging() {
  uni.navigateTo({ url: PAGE_PATH.CHARGING })
}

function goToStationDetail(id: number) {
  uni.navigateTo({ url: `${PAGE_PATH.STATION_DETAIL}?id=${id}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
}

.nav-content {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 24rpx;
}

.location {
  display: flex;
  align-items: center;
  color: #FFFFFF;
  font-size: 26rpx;
  margin-right: 20rpx;

  .location-text {
    max-width: 120rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0 8rpx;
  }
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  height: 64rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 32rpx;
  padding: 0 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;

  .iconfont {
    margin-right: 12rpx;
  }
}

.content {
  height: 100vh;
}

// 充电提示
.charging-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: #FFFFFF;
  margin: 20rpx;

  .charging-info {
    display: flex;
    align-items: center;
  }

  .charging-icon {
    width: 80rpx;
    height: 80rpx;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;

    .iconfont {
      font-size: 40rpx;
    }
  }

  .charging-title {
    font-size: 30rpx;
    font-weight: bold;
  }

  .charging-station {
    font-size: 24rpx;
    opacity: 0.8;
    margin-top: 8rpx;
  }

  .charging-action {
    display: flex;
    align-items: center;
  }

  .charging-amount {
    font-size: 36rpx;
    font-weight: bold;
    margin-right: 10rpx;
  }
}

// 快捷入口
.quick-entry {
  display: flex;
  justify-content: space-around;
  padding: 30rpx 0;
  margin: 20rpx;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.entry-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;

  .iconfont {
    font-size: 48rpx;
    color: #FFFFFF;
  }

  &.scan {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
  }

  &.map {
    background: linear-gradient(135deg, #2196F3, #1565C0);
  }

  &.order {
    background: linear-gradient(135deg, #FF9800, #E65100);
  }

  &.wallet {
    background: linear-gradient(135deg, #9C27B0, #6A1B9A);
  }
}

.entry-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}

// 区块
.section {
  padding: 0 20rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
}

.section-more {
  display: flex;
  align-items: center;
  color: var(--text-placeholder);
  font-size: 24rpx;

  .iconfont {
    margin-left: 8rpx;
  }
}

// 站点卡片
.station-card {
  display: flex;
  justify-content: space-between;
  padding: 24rpx;
}

.station-info {
  flex: 1;
}

.station-name {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.station-address {
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 16rpx;
}

.station-tags {
  display: flex;
  gap: 16rpx;
}

.station-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}

.station-distance {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.station-price {
  .price-value {
    font-size: 32rpx;
    font-weight: bold;
    color: var(--primary-color);
  }

  .price-unit {
    font-size: 22rpx;
    color: var(--text-secondary);
  }
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 40rpx;
  color: var(--text-placeholder);
}
</style>
