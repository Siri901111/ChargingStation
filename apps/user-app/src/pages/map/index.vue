<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="search-wrap">
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input
            v-model="keyword"
            class="search-input"
            placeholder="搜索充电站名称"
            confirm-type="search"
            @confirm="handleSearch"
          />
          <text v-if="keyword" class="clear-icon" @click="clearSearch">✕</text>
        </view>
      </view>
      <!-- 筛选标签 -->
      <view class="filter-tabs">
        <view
          v-for="item in filterOptions"
          :key="item.value"
          :class="['filter-tab', { active: currentFilter === item.value }]"
          @click="handleFilterChange(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <!-- 地图 -->
    <map
      id="map"
      class="map"
      :latitude="mapCenter.latitude"
      :longitude="mapCenter.longitude"
      :scale="mapScale"
      :markers="markers"
      :show-location="true"
      @markertap="handleMarkerTap"
      @regionchange="handleRegionChange"
    />

    <!-- 重新定位按钮 -->
    <view class="location-btn" @click="relocate">
      <text class="btn-icon">📍</text>
    </view>

    <!-- 站点列表弹窗 -->
    <view :class="['station-popup', { show: showStationList }]">
      <view class="popup-header" @click="toggleStationList">
        <view class="popup-handle"></view>
        <text class="popup-title">附近{{ stationList.length }}个充电站</text>
      </view>
      <scroll-view class="popup-content" scroll-y>
        <view
          v-for="station in stationList"
          :key="station.id"
          class="station-item"
          @click="goToStationDetail(station)"
        >
          <view class="station-info">
            <view class="station-name">{{ station.name }}</view>
            <view class="station-address">{{ station.address || station.city }}</view>
            <view class="station-meta">
              <text class="meta-item">
                <text class="meta-icon fast"></text>
                快充 {{ station.fastFree }}/{{ station.fast }}
              </text>
              <text class="meta-item">
                <text class="meta-icon slow"></text>
                慢充 {{ station.slowFree }}/{{ station.slow }}
              </text>
            </view>
          </view>
          <view class="station-action">
            <view class="station-distance" v-if="station.distance">
              {{ formatDistance(station.distance) }}
            </view>
            <view class="nav-btn" @click.stop="handleNavigation(station)">
              🧭 导航
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 站点详情卡片 -->
    <view v-if="selectedStation" class="station-card" @click="goToStationDetail(selectedStation)">
      <view class="card-header">
        <view class="station-name">{{ selectedStation.name }}</view>
        <text class="close-icon" @click.stop="closeStationCard">✕</text>
      </view>
      <view class="card-body">
        <view class="station-address">{{ selectedStation.address || selectedStation.city }}</view>
        <view class="station-status">
          <view class="status-item">
            <text class="status-label">快充</text>
            <text class="status-value success">{{ selectedStation.fastFree }}</text>
            <text class="status-divider">/</text>
            <text class="status-total">{{ selectedStation.fast }}</text>
          </view>
          <view class="status-item">
            <text class="status-label">慢充</text>
            <text class="status-value success">{{ selectedStation.slowFree }}</text>
            <text class="status-divider">/</text>
            <text class="status-total">{{ selectedStation.slow }}</text>
          </view>
        </view>
      </view>
      <view class="card-footer">
        <view class="price-info" v-if="selectedStation.price">
          <text class="price-value">¥{{ selectedStation.price.toFixed(2) }}</text>
          <text class="price-unit">/度起</text>
        </view>
        <view class="action-btns">
          <view class="action-btn outline" @click.stop="handleNavigation(selectedStation)">
            🧭 导航
          </view>
          <view class="action-btn primary" @click.stop="goToStationDetail(selectedStation)">
            去充电
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useLocationStore } from '@/store/modules/location'
import { stationApi, type Station } from '@/api/station'
import { formatDistance, openNavigation } from '@/utils'
import { PAGE_PATH } from '@/constants'

// Store
const locationStore = useLocationStore()

// 状态
const statusBarHeight = ref(0)
const keyword = ref('')
const currentFilter = ref('all')
const mapScale = ref(14)
const showStationList = ref(false)
const stationList = ref<Station[]>([])
const selectedStation = ref<Station | null>(null)

// 地图中心点（默认长沙）
const mapCenter = ref({
  latitude: 28.1963,
  longitude: 112.9822,
})

// 筛选选项
const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '快充', value: 'fast' },
  { label: '慢充', value: 'slow' },
  { label: '空闲', value: 'free' },
]

// 地图标记点
const markers = computed(() => {
  return stationList.value.map((station, index) => ({
    id: station.id,
    latitude: station.latitude,
    longitude: station.longitude,
    width: 40,
    height: 50,
    iconPath: getMarkerIcon(station),
    callout: {
      content: station.name,
      color: '#333333',
      fontSize: 12,
      borderRadius: 4,
      padding: 6,
      display: 'BYCLICK',
      bgColor: '#FFFFFF',
    },
  }))
})

// 获取标记图标
function getMarkerIcon(station: Station): string {
  const hasFree = station.fastFree > 0 || station.slowFree > 0
  return hasFree
    ? '/static/marker/marker-green.png'
    : '/static/marker/marker-gray.png'
}

// 初始化
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0

  initLocation()
})

onShow(() => {
  // 检查是否有从首页传来的搜索请求
  const pendingSearch = locationStore.consumePendingSearch()
  if (pendingSearch === '__FOCUS__') {
    // 聚焦搜索框
    showStationList.value = false
    selectedStation.value = null
  }

  // 刷新站点列表
  if (locationStore.currentLocation) {
    fetchNearbyStations()
  }
})

// 初始化定位
async function initLocation() {
  const location = await locationStore.getCurrentLocation()
  if (location) {
    mapCenter.value = {
      latitude: location.latitude,
      longitude: location.longitude,
    }
    fetchNearbyStations()
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
      radius: 10000,
      type: currentFilter.value === 'all' ? undefined : currentFilter.value as 'fast' | 'slow',
      pageSize: 50,
    })
    stationList.value = res.list
  } catch (error) {
    console.error('获取站点失败', error)
  }
}

// 搜索
async function handleSearch() {
  if (!keyword.value.trim()) {
    // 清空搜索时重新获取附近站点
    fetchNearbyStations()
    return
  }

  try {
    const { latitude, longitude } = locationStore.currentLocation || {}
    const res = await stationApi.searchStations({
      keyword: keyword.value.trim(),
      latitude,
      longitude,
      pageSize: 50,
    })
    stationList.value = res.list

    // 如果有搜索结果，地图移动到第一个结果
    if (res.list.length > 0) {
      mapCenter.value = {
        latitude: res.list[0].latitude,
        longitude: res.list[0].longitude,
      }
      uni.showToast({ title: `找到${res.list.length}个站点`, icon: 'none' })
    } else {
      uni.showToast({ title: '未找到相关站点', icon: 'none' })
    }
  } catch (error) {
    console.error('搜索站点失败', error)
    uni.showToast({ title: '搜索失败', icon: 'none' })
  }
}

// 清除搜索
function clearSearch() {
  keyword.value = ''
  fetchNearbyStations()
}

// 切换筛选
function handleFilterChange(value: string) {
  currentFilter.value = value
  fetchNearbyStations()
}

// 重新定位
async function relocate() {
  const location = await locationStore.getCurrentLocation()
  if (location) {
    mapCenter.value = {
      latitude: location.latitude,
      longitude: location.longitude,
    }
    mapScale.value = 14
  }
}

// 点击标记点
function handleMarkerTap(e: { markerId: number }) {
  const station = stationList.value.find((s) => s.id === e.markerId)
  if (station) {
    selectedStation.value = station
    mapCenter.value = {
      latitude: station.latitude,
      longitude: station.longitude,
    }
  }
}

// 地图区域变化
function handleRegionChange(e: { type: string }) {
  if (e.type === 'end') {
    // 可以在这里根据新的中心点重新加载站点
  }
}

// 切换站点列表显示
function toggleStationList() {
  showStationList.value = !showStationList.value
  if (showStationList.value) {
    selectedStation.value = null
  }
}

// 关闭站点卡片
function closeStationCard() {
  selectedStation.value = null
}

// 导航
function handleNavigation(station: Station) {
  openNavigation(station.latitude, station.longitude, station.name, station.address)
}

// 跳转站点详情
function goToStationDetail(station: Station) {
  uni.navigateTo({ url: `${PAGE_PATH.STATION_DETAIL}?id=${station.id}` })
}
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #FFFFFF;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
}

.search-wrap {
  padding: 16rpx 24rpx;
}

.search-box {
  display: flex;
  align-items: center;
  height: 76rpx;
  background: #F5F5F5;
  border-radius: 38rpx;
  padding: 0 28rpx;

  .search-input {
    flex: 1;
    height: 100%;
    margin: 0 16rpx;
    font-size: 28rpx;
    color: #1A1A1A;
  }

  .search-icon {
    font-size: 32rpx;
  }

  .clear-icon {
    font-size: 28rpx;
    color: #999999;
    padding: 8rpx;
  }
}

.filter-tabs {
  display: flex;
  padding: 0 24rpx 16rpx;
  gap: 16rpx;
}

.filter-tab {
  padding: 12rpx 28rpx;
  font-size: 26rpx;
  color: #666666;
  background: #F5F5F5;
  border-radius: 28rpx;
  transition: all 0.2s;

  &.active {
    color: #FFFFFF;
    background: #1A1A1A;
  }
}

.map {
  width: 100%;
  height: 100%;
}

.location-btn {
  position: fixed;
  right: 24rpx;
  bottom: 320rpx;
  width: 96rpx;
  height: 96rpx;
  background: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.12);
  z-index: 50;

  .btn-icon {
    font-size: 40rpx;
  }
}

/* 站点列表弹窗 */
.station-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60vh;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  transform: translateY(calc(100% - 140rpx));
  transition: transform 0.3s ease;
  z-index: 200;
  box-shadow: 0 -8rpx 30rpx rgba(0, 0, 0, 0.1);

  &.show {
    transform: translateY(0);
  }
}

.popup-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 24rpx 16rpx;
}

.popup-handle {
  width: 80rpx;
  height: 8rpx;
  background: #E0E0E0;
  border-radius: 4rpx;
  margin-bottom: 16rpx;
}

.popup-title {
  font-size: 30rpx;
  color: #666666;
  font-weight: 500;
}

.popup-content {
  height: calc(60vh - 120rpx);
  padding: 0 24rpx;
  padding-bottom: env(safe-area-inset-bottom);
}

.station-item {
  display: flex;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.station-info {
  flex: 1;
  min-width: 0;
}

.station-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.station-address {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.station-meta {
  display: flex;
  gap: 24rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666666;
}

.meta-icon {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 8rpx;

  &.fast {
    background: #5A8F7B;
  }

  &.slow {
    background: #B8996F;
  }
}

.station-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  margin-left: 16rpx;
}

.station-distance {
  font-size: 26rpx;
  color: #5A8F7B;
  font-weight: 500;
}

.nav-btn {
  display: flex;
  align-items: center;
  padding: 14rpx 24rpx;
  font-size: 24rpx;
  color: #1A1A1A;
  background: #F5F5F5;
  border-radius: 28rpx;
  gap: 6rpx;
  font-weight: 500;
}

/* 站点详情卡片 */
.station-card {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 180rpx;
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
  z-index: 150;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;

  .station-name {
    font-size: 36rpx;
    font-weight: 600;
    color: #1A1A1A;
    flex: 1;
    margin-bottom: 0;
  }

  .close-icon {
    font-size: 36rpx;
    color: #CCCCCC;
    padding: 8rpx;
    margin: -8rpx;
  }
}

.card-body {
  .station-address {
    font-size: 26rpx;
    color: #999999;
    margin-bottom: 24rpx;
  }
}

.station-status {
  display: flex;
  gap: 48rpx;
}

.status-item {
  display: flex;
  align-items: baseline;
}

.status-label {
  font-size: 26rpx;
  color: #999999;
  margin-right: 12rpx;
}

.status-value {
  font-size: 40rpx;
  font-weight: 600;

  &.success {
    color: #5A8F7B;
  }
}

.status-divider {
  color: #CCCCCC;
  margin: 0 4rpx;
  font-size: 28rpx;
}

.status-total {
  font-size: 28rpx;
  color: #999999;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28rpx;
  padding-top: 28rpx;
  border-top: 1rpx solid #F0F0F0;
}

.price-info {
  .price-value {
    font-size: 40rpx;
    font-weight: 600;
    color: #1A1A1A;
  }

  .price-unit {
    font-size: 24rpx;
    color: #999999;
  }
}

.action-btns {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  padding: 0 36rpx;
  font-size: 28rpx;
  border-radius: 40rpx;
  gap: 8rpx;
  font-weight: 500;

  &.outline {
    color: #1A1A1A;
    border: 2rpx solid #E0E0E0;
    background: #FFFFFF;
  }

  &.primary {
    color: #FFFFFF;
    background: #1A1A1A;
  }
}
</style>
