<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @click="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">我的收藏</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <scroll-view
      class="content"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      :style="{ paddingTop: navBarHeight + 'px' }"
    >
      <view v-if="loading && stations.length === 0" class="loading-wrap">
        <text>加载中...</text>
      </view>

      <view v-else-if="stations.length === 0" class="empty">
        <view class="empty-icon">⭐</view>
        <text class="empty-title">暂无收藏站点</text>
        <text class="empty-desc">去站点列表收藏喜欢的充电站吧</text>
        <view class="empty-action" @click="goToMap">
          <text>去收藏</text>
        </view>
      </view>

      <view v-else class="station-list">
        <view
          v-for="(station, index) in stations"
          :key="station.id"
          class="station-item slide-up"
          :style="{ animationDelay: `${index * 50}ms` }"
          @click="goToStationDetail(station.id)"
        >
          <view class="station-content">
            <view class="station-header">
              <text class="station-name">{{ station.name }}</text>
              <view class="station-actions">
                <view class="favorite-btn active" @click.stop="handleUnfavorite(station.id)">
                  <text>⭐</text>
                </view>
              </view>
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

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { stationApi, type Station } from '@/api/station'
import { PAGE_PATH } from '@/constants'

// 状态
const statusBarHeight = ref(0)
const navBarHeight = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const stations = ref<Station[]>([])

// 初始化
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navBarHeight.value = statusBarHeight.value + 44
  fetchFavorites()
})

onShow(() => {
  fetchFavorites()
})

// 获取收藏列表
async function fetchFavorites() {
  loading.value = true
  try {
    stations.value = await stationApi.getFavoriteStations()
  } catch (error) {
    console.error('获取收藏列表失败', error)
    uni.showToast({ title: '获取收藏列表失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 下拉刷新
async function onRefresh() {
  refreshing.value = true
  await fetchFavorites()
  refreshing.value = false
}

// 取消收藏
async function handleUnfavorite(stationId: number) {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消收藏吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await stationApi.unfavoriteStation(stationId)
          uni.showToast({ title: '已取消收藏', icon: 'success' })
          // 从列表中移除
          stations.value = stations.value.filter(s => s.id !== stationId)
        } catch (error) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    },
  })
}

// 返回
function handleBack() {
  uni.navigateBack({ delta: 1 })
}

// 跳转站点详情
function goToStationDetail(id: number) {
  uni.navigateTo({ url: `${PAGE_PATH.STATION_DETAIL}?id=${id}` })
}

// 跳转地图
function goToMap() {
  uni.switchTab({ url: PAGE_PATH.MAP })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--bg-page, #FAF9F7);
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

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  color: #999999;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.3;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #666666;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 48rpx;
}

.empty-action {
  padding: 20rpx 48rpx;
  background: #1A1A1A;
  color: #FFFFFF;
  border-radius: 48rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.station-list {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.station-item {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
    background: #FAFAFA;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slide-up 0.3s ease-out forwards;
  opacity: 0;
}

.station-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.station-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.station-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  flex: 1;
}

.station-actions {
  display: flex;
  gap: 16rpx;
}

.favorite-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #F5F5F5;
  transition: all 0.2s;

  &.active {
    background: rgba(255, 215, 0, 0.1);

    text {
      font-size: 32rpx;
    }
  }

  &:active {
    transform: scale(0.9);
  }
}

.station-address {
  font-size: 26rpx;
  color: #999999;
  line-height: 1.5;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.station-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}

.station-tags {
  display: flex;
  gap: 12rpx;
}

.tag {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;

  &.tag-jade {
    color: #5A8F7B;
    background: rgba(90, 143, 123, 0.1);
  }

  &.tag-grey {
    color: #666666;
    background: #F5F5F5;
  }
}

.station-price {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.price-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #5A8F7B;
}

.price-unit {
  font-size: 24rpx;
  color: #999999;
}

.font-num {
  font-variant-numeric: tabular-nums;
}

.bottom-space {
  height: 120rpx;
}
</style>
