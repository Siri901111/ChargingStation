<template>
  <view class="page">
    <!-- 自定义导航栏 - 极简风格 -->
    <view class="nav-bar safe-top" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <!-- 定位 -->
        <view class="location touchable" @click="handleLocationClick">
          <view class="icon icon-location icon-sm"></view>
          <text class="location-text">{{ locationStore.locationText }}</text>
          <view class="icon icon-arrow-down icon-xs"></view>
        </view>
        <!-- 搜索 -->
        <view class="search-box touchable" @click="handleSearchClick">
          <view class="icon icon-search icon-sm"></view>
          <text class="search-placeholder">搜索充电站</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view
      class="content"
      scroll-y
      enhanced
      :show-scrollbar="false"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      :style="{ paddingTop: navBarHeight + 'px' }"
    >
      <!-- 正在充电卡片 - 高级渐变 -->
      <view v-if="chargingStore.isCharging" class="charging-card slide-up" @click="goToCharging">
        <view class="charging-indicator">
          <view class="pulse-ring"></view>
          <view class="icon icon-charging-filled icon-lg"></view>
        </view>
        <view class="charging-info">
          <view class="charging-header">
            <text class="charging-status">充电中</text>
            <text class="charging-station">{{ chargingStore.chargingStatus?.stationName }}</text>
          </view>
          <view class="charging-metrics">
            <view class="metric">
              <text class="metric-value font-num">{{ chargingStore.chargingStatus?.electricity?.toFixed(1) || '0.0' }}</text>
              <text class="metric-unit">kWh</text>
            </view>
            <view class="metric-divider"></view>
            <view class="metric">
              <text class="metric-value font-num">¥{{ chargingStore.chargingAmount.toFixed(2) }}</text>
              <text class="metric-unit">费用</text>
            </view>
          </view>
        </view>
        <view class="icon icon-arrow-right icon-sm"></view>
      </view>

      <!-- 快捷入口 - 极简网格 -->
      <view class="quick-section">
        <view class="quick-grid">
          <view class="quick-item touchable" @click="handleScan">
            <view class="quick-icon scan">
              <view class="icon icon-scan icon-xl"></view>
            </view>
            <text class="quick-label">扫码充电</text>
          </view>
          <view class="quick-item touchable" @click="goToMap">
            <view class="quick-icon map">
              <view class="icon icon-map icon-xl"></view>
            </view>
            <text class="quick-label">附近站点</text>
          </view>
          <view class="quick-item touchable" @click="goToOrders">
            <view class="quick-icon order">
              <view class="icon icon-order icon-xl"></view>
            </view>
            <text class="quick-label">充电记录</text>
          </view>
          <view class="quick-item touchable" @click="goToWallet">
            <view class="quick-icon wallet">
              <view class="icon icon-wallet icon-xl"></view>
            </view>
            <text class="quick-label">账户余额</text>
          </view>
        </view>
      </view>

      <!-- 会员卡片 - 简约深色 -->
      <view class="member-card touchable" v-if="userStore.isLoggedIn" @click="goToMine">
        <view class="member-left">
          <view class="member-avatar">
            <image
              :src="userStore.userInfo?.avatar || '/static/avatar/default.png'"
              mode="aspectFill"
            />
          </view>
          <view class="member-info">
            <text class="member-name">{{ userStore.displayName }}</text>
            <view class="member-tag">
              <view class="icon icon-star-filled icon-xs"></view>
              <text>{{ userStore.userInfo?.cardType || '普通会员' }}</text>
            </view>
          </view>
        </view>
        <view class="member-right">
          <text class="balance-label">余额</text>
          <text class="balance-value font-num">¥{{ userStore.balance.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 附近站点 - 精致列表 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">附近站点</text>
          <view class="section-action touchable" @click="goToMap">
            <text>全部</text>
            <view class="icon icon-arrow-right icon-xs"></view>
          </view>
        </view>

        <view v-if="loading" class="loading">
          <text>加载中...</text>
        </view>

        <view v-else-if="nearbyStations.length === 0" class="empty">
          <view class="icon icon-map icon-3xl empty-icon"></view>
          <text class="empty-title">暂无附近站点</text>
          <text class="empty-desc">请检查定位权限或稍后重试</text>
        </view>

        <view v-else class="station-list">
          <view
            v-for="(station, index) in nearbyStations"
            :key="station.id"
            class="station-item slide-up"
            :style="{ animationDelay: `${index * 80}ms` }"
            @click="goToStationDetail(station.id)"
          >
            <view class="station-content">
              <view class="station-header">
                <text class="station-name">{{ station.name }}</text>
                <text class="station-distance font-num" v-if="station.distance">
                  {{ formatDistance(station.distance) }}
                </text>
              </view>
              <text class="station-address truncate">{{ station.address || station.city }}</text>
              <view class="station-footer">
                <view class="station-tags">
                  <view class="tag tag-jade" v-if="station.fastFree > 0">
                    快充 {{ station.fastFree }}
                  </view>
                  <view class="tag tag-grey" v-if="station.slowFree > 0">
                    慢充 {{ station.slowFree }}
                  </view>
                </view>
                <view class="station-price" v-if="station.price">
                  <text class="price-value font-num">¥{{ station.price }}</text>
                  <text class="price-unit">/度</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-space"></view>
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
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navBarHeight.value = statusBarHeight.value + 44
  initData()
})

onShow(() => {
  if (userStore.isLoggedIn) {
    chargingStore.fetchChargingStatus()
  }
})

// 初始化数据
async function initData() {
  loading.value = true
  try {
    // 获取位置（失败时会使用默认位置）
    const location = await locationStore.getCurrentLocation()
    console.log('📍 当前位置:', location)

    // 无论定位成功与否都尝试获取站点
    await fetchNearbyStations()
  } catch (error) {
    console.error('初始化数据失败', error)
  } finally {
    loading.value = false
  }
}

// 获取附近站点
async function fetchNearbyStations() {
  // 使用当前位置或默认位置
  const location = locationStore.currentLocation || {
    latitude: 28.1963,
    longitude: 112.9822,
  }

  try {
    console.log('🔍 获取附近站点, 坐标:', location.latitude, location.longitude)
    const res = await stationApi.getNearbyStations({
      latitude: location.latitude,
      longitude: location.longitude,
      radius: 10000, // 扩大搜索范围到10km
      pageSize: 5,
    })
    console.log('📋 获取到站点:', res)
    nearbyStations.value = res.list || []
  } catch (error) {
    console.error('获取附近站点失败', error)
    nearbyStations.value = []
  }
}

// 下拉刷新
async function onRefresh() {
  refreshing.value = true
  try {
    await initData()
  } finally {
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
}

// 点击定位
function handleLocationClick() {
  locationStore.getCurrentLocation()
}

// 点击搜索
function handleSearchClick() {
  // 设置搜索标记，地图页面会自动聚焦搜索框
  locationStore.setPendingSearch('__FOCUS__')
  uni.switchTab({ url: PAGE_PATH.MAP })
}

// 扫码充电
function handleScan() {
  if (!userStore.checkLoginAndNavigate()) return
  // #ifdef MP-WEIXIN
  uni.scanCode({
    onlyFromCamera: true,
    success: (res) => {
      uni.navigateTo({
        url: `/pages/scan/index?code=${encodeURIComponent(res.result)}`,
      })
    },
  })
  // #endif
  // #ifdef H5
  uni.navigateTo({ url: '/pages/scan/index' })
  // #endif
}

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

function goToMine() {
  uni.switchTab({ url: PAGE_PATH.MINE })
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
  background: var(--bg-page);
}

// ==================== 导航栏 ====================
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg-card);
}

.nav-content {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 var(--space-4);
  gap: var(--space-3);
}

.location {
  display: flex;
  align-items: center;
  gap: var(--space-1);

  .icon-location {
    color: var(--jade);
  }

  .location-text {
    max-width: 140rpx;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .icon-arrow-down {
    opacity: 0.5;
  }
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  height: 68rpx;
  padding: 0 var(--space-4);
  background: var(--ink-02);
  border-radius: var(--radius-full);
  gap: var(--space-2);

  .icon-search {
    opacity: 0.4;
  }

  .search-placeholder {
    font-size: var(--text-sm);
    color: var(--text-placeholder);
  }
}

.content {
  height: 100vh;
  box-sizing: border-box;
}

// ==================== 充电中卡片 ====================
.charging-card {
  display: flex;
  align-items: center;
  margin: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: linear-gradient(135deg, var(--ink-90) 0%, var(--ink-80) 100%);
  border-radius: var(--radius-xl);
  gap: var(--space-4);
}

.charging-indicator {
  position: relative;
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(184, 153, 111, 0.15);
    animation: pulse 2s ease-out infinite;
  }

  .icon {
    position: relative;
    z-index: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.charging-info {
  flex: 1;
  min-width: 0;
}

.charging-header {
  margin-bottom: var(--space-2);

  .charging-status {
    display: inline-block;
    padding: var(--space-1) var(--space-2);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--gold);
    background: rgba(184, 153, 111, 0.2);
    border-radius: var(--radius-xs);
    margin-right: var(--space-2);
  }

  .charging-station {
    font-size: var(--text-sm);
    color: rgba(255, 255, 255, 0.7);
  }
}

.charging-metrics {
  display: flex;
  align-items: center;
  gap: var(--space-5);
}

.metric {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);

  .metric-value {
    font-size: var(--text-2xl);
    font-weight: var(--weight-semibold);
    color: var(--paper);
  }

  .metric-unit {
    font-size: var(--text-xs);
    color: rgba(255, 255, 255, 0.5);
  }
}

.metric-divider {
  width: 1rpx;
  height: 48rpx;
  background: rgba(255, 255, 255, 0.15);
}

.charging-card > .icon-arrow-right {
  color: rgba(255, 255, 255, 0.4);
}

// ==================== 快捷入口 ====================
.quick-section {
  padding: 0 var(--space-4);
  margin-bottom: var(--space-5);
}

.quick-grid {
  display: flex;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-5) var(--space-4);
  box-shadow: var(--shadow-lg);
  gap: var(--space-3);
  // 添加微妙的边框，增加层次
  border: 1rpx solid var(--ink-05);
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-out);
  
  // 点击效果优化
  &:active {
    transform: scale(0.96);
    background: var(--ink-02);
    
    .quick-icon {
      transform: scale(0.95);
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
      
      &::before {
        opacity: 0.25;
      }
    }
    
    .quick-label {
      color: var(--text-primary);
      font-weight: var(--weight-semibold);
    }
  }
}

.quick-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-out);
  // 添加微妙的内阴影，增加层次感
  box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  // 渐变背景，更高级
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.15;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), transparent);
    transition: opacity var(--duration-normal);
    pointer-events: none;
  }

  .icon {
    position: relative;
    z-index: 1;
    // 优化图标清晰度
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    // 轻微阴影，增加层次
    filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.15));
  }

  // 扫码充电 - 深墨色渐变（高级黑）- 协调配色
  &.scan {
    background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
    box-shadow: 0 8rpx 24rpx rgba(26, 26, 26, 0.25), inset 0 1rpx 0 rgba(255, 255, 255, 0.12);
    
    .icon {
      filter: brightness(0) invert(1) drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.25));
    }
  }

  // 附近站点 - 翡翠绿渐变（主题色）- 协调配色
  &.map {
    background: linear-gradient(135deg, #5A8F7B 0%, #4A7F6B 100%);
    box-shadow: 0 8rpx 24rpx rgba(90, 143, 123, 0.35), inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
    
    .icon {
      filter: brightness(0) invert(1) drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
    }
  }

  // 充电记录 - 暖金色渐变（琥珀金）- 协调配色
  &.order {
    background: linear-gradient(135deg, #D4A84B 0%, #C89A3A 100%);
    box-shadow: 0 8rpx 24rpx rgba(212, 168, 75, 0.35), inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
    
    .icon {
      filter: brightness(0) invert(1) drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
    }
  }

  // 账户余额 - 青瓷蓝渐变（优雅蓝）- 协调配色
  &.wallet {
    background: linear-gradient(135deg, #5B8C94 0%, #4A7A81 100%);
    box-shadow: 0 8rpx 24rpx rgba(91, 140, 148, 0.35), inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
    
    .icon {
      filter: brightness(0) invert(1) drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
    }
  }

}


.quick-label {
  font-size: var(--text-xs);
  color: var(--text-primary);
  letter-spacing: var(--tracking-wide);
  font-weight: var(--weight-medium);
  margin-top: 4rpx;
}

// ==================== 会员卡片 ====================
.member-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 var(--space-4) var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: linear-gradient(135deg, var(--ink-100) 0%, var(--ink-80) 100%);
  border-radius: var(--radius-xl);
}

.member-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.member-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.15);

  image {
    width: 100%;
    height: 100%;
  }
}

.member-info {
  .member-name {
    display: block;
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    color: var(--paper);
    margin-bottom: var(--space-1);
  }

  .member-tag {
    display: inline-flex;
    align-items: center;
    gap: 4rpx;
    font-size: var(--text-xs);
    color: var(--gold-light);
  }
}

.member-right {
  text-align: right;

  .balance-label {
    display: block;
    font-size: var(--text-xs);
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: var(--space-1);
  }

  .balance-value {
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
    color: var(--paper);
  }
}

// ==================== 区块 ====================
.section {
  padding: 0 var(--space-4);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  letter-spacing: var(--tracking-wide);
}

.section-action {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

// ==================== 站点列表 ====================
.station-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.station-item {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-5);
  transition: all var(--duration-fast) var(--ease-out);

  &:active {
    transform: scale(0.98);
    background: var(--ink-02);
  }
}

.station-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.station-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.station-name {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.station-distance {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.station-address {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-snug);
}

.station-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-1);
}

.station-tags {
  display: flex;
  gap: var(--space-2);
}

.station-price {
  display: flex;
  align-items: baseline;
  gap: 2rpx;

  .price-value {
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--jade);
  }

  .price-unit {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
}

// ==================== 空状态 ====================
.empty {
  padding: var(--space-16) var(--space-5);
}

.empty-icon {
  color: var(--ink-15);
  margin-bottom: var(--space-5);
}

.empty-title {
  font-size: var(--text-lg);
  color: var(--text-regular);
  margin-bottom: var(--space-2);
}

.empty-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

// ==================== 底部留白 ====================
.bottom-space {
  height: 160rpx;
}
</style>
