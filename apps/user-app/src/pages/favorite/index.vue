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
        <view class="icon icon-star icon-3xl empty-icon"></view>
        <text class="empty-title">暂无收藏站点</text>
        <text class="empty-desc">去站点列表收藏喜欢的充电站吧</text>
        <view class="empty-action touchable" @click="goToMap">
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
              <view class="station-main">
                <text class="station-name">{{ station.name }}</text>
                <text class="station-address truncate">{{ station.address || station.city }}</text>
              </view>
              <view class="station-actions">
                <view class="favorite-btn active touchable" @click.stop="handleUnfavorite(station.id)">
                  <view class="icon icon-star-filled icon-sm"></view>
                </view>
              </view>
            </view>
            <view class="station-footer">
              <view class="station-tags">
                <view class="tag tag-jade" v-if="station.fastFree > 0">
                  <text>快充 {{ station.fastFree }}</text>
                </view>
                <view class="tag tag-grey" v-if="station.slowFree > 0">
                  <text>慢充 {{ station.slowFree }}</text>
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
  if (loading.value) return
  loading.value = true
  try {
    const list = await stationApi.getFavoriteStations()
    stations.value = list || []
  } catch (error: any) {
    console.error('获取收藏列表失败', error)
    uni.showToast({ title: error.message || '获取收藏列表失败', icon: 'none' })
    stations.value = []
  } finally {
    loading.value = false
    refreshing.value = false
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
    content: '确定要取消收藏该站点吗？',
    confirmColor: '#C4554A',
    success: async (res) => {
      if (res.confirm) {
        try {
          await stationApi.unfavoriteStation(stationId)
          uni.showToast({ title: '已取消收藏', icon: 'success' })
          // 从列表中移除
          stations.value = stations.value.filter(s => s.id !== stationId)
        } catch (error: any) {
          console.error('取消收藏失败:', error)
          uni.showToast({ title: error.message || '操作失败', icon: 'none' })
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
  padding: var(--space-16) var(--space-5);
}

.empty-icon {
  margin-bottom: var(--space-4);
  color: var(--ink-15);
  opacity: 0.4;
}

.empty-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  text-align: center;
}

.empty-action {
  padding: var(--space-3) var(--space-6);
  background: var(--ink-90);
  color: var(--paper);
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  transition: all var(--duration-fast) var(--ease-out);
  
  &:active {
    transform: scale(0.95);
    background: var(--ink-100);
  }
}

.station-list {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.station-item {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) var(--ease-out);
  border: 1rpx solid var(--border-light);

  &:active {
    transform: scale(0.98);
    background: var(--ink-02);
    box-shadow: var(--shadow-xs);
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
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  gap: var(--space-3);
}

.station-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.station-name {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.station-address {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.station-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.favorite-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: rgba(184, 153, 111, 0.1);
  transition: all var(--duration-fast) var(--ease-out);

  &.active {
    background: rgba(184, 153, 111, 0.2);
  }

  &:active {
    transform: scale(0.9);
    background: rgba(184, 153, 111, 0.3);
  }
  
  .icon {
    color: var(--gold);
  }
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
  padding-top: var(--space-3);
  border-top: 1rpx solid var(--border-light);
}

.station-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.tag {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);

  &.tag-jade {
    color: var(--jade);
    background: rgba(90, 143, 123, 0.1);
  }

  &.tag-grey {
    color: var(--text-secondary);
    background: var(--ink-05);
  }
}

.station-price {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
  flex-shrink: 0;
}

.price-value {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--jade);
  font-variant-numeric: tabular-nums;
}

.price-unit {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.font-num {
  font-variant-numeric: tabular-nums;
}

.bottom-space {
  height: 120rpx;
}
</style>
