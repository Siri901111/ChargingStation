<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @click="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">站点详情</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <view v-if="loading" class="loading-wrap">
      <text>加载中...</text>
    </view>

    <scroll-view
      v-else-if="station"
      class="station-detail"
      scroll-y
      :style="{ paddingTop: navBarHeight + 'px' }"
    >
      <!-- 站点头部 -->
      <view class="station-header">
        <swiper class="station-swiper" indicator-dots autoplay circular v-if="station.images?.length">
          <swiper-item v-for="(img, index) in station.images" :key="index">
            <image class="station-image" :src="img" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <view class="station-image-placeholder" v-else>
          <text class="placeholder-icon">⚡</text>
          <text class="placeholder-text">{{ station.name }}</text>
        </view>

        <view class="station-info">
          <view class="info-main">
            <text class="station-name">{{ station.name }}</text>
            <view class="station-tags">
              <text class="tag tag-success" v-if="station.fastFree > 0">快充空闲</text>
              <text class="tag tag-warning" v-if="station.slowFree > 0">慢充空闲</text>
            </view>
          </view>
          <view class="info-address" @click="handleNavigation">
            <text class="info-icon">📍</text>
            <text class="address-text">{{ station.address || station.city }}</text>
            <text class="distance" v-if="station.distance">{{ formatDistance(station.distance) }}</text>
          </view>
          <view class="info-contact" v-if="station.tel">
            <text class="info-icon">📞</text>
            <text class="contact-text" @click="handleCall">{{ station.tel }}</text>
          </view>
        </view>
      </view>

      <!-- 充电桩列表 -->
      <view class="pile-section">
        <view class="section-header">
          <text class="section-title">充电桩</text>
          <view class="pile-summary">
            <text class="summary-item">快充 {{ station.fastFree }}/{{ station.fast }}</text>
            <text class="summary-item">慢充 {{ station.slowFree }}/{{ station.slow }}</text>
          </view>
        </view>

        <view class="pile-filter">
          <view
            :class="['filter-item', { active: pileFilter === 'all' }]"
            @click="pileFilter = 'all'"
          >
            全部
          </view>
          <view
            :class="['filter-item', { active: pileFilter === 'fast' }]"
            @click="pileFilter = 'fast'"
          >
            快充
          </view>
          <view
            :class="['filter-item', { active: pileFilter === 'slow' }]"
            @click="pileFilter = 'slow'"
          >
            慢充
          </view>
        </view>

        <view class="pile-list">
          <view
            v-for="pile in filteredPiles"
            :key="pile.id"
            :class="['pile-card', { disabled: pile.status !== PILE_STATUS.FREE }]"
            @click="handleSelectPile(pile)"
          >
            <view class="pile-icon">
              <text class="pile-emoji">🔌</text>
            </view>
            <view class="pile-info">
              <view class="pile-name">{{ pile.name }}</view>
              <view class="pile-meta">
                <text class="meta-type">{{ pile.type === 'fast' ? '快充' : '慢充' }}</text>
                <text class="meta-power">{{ pile.power }}kW</text>
              </view>
            </view>
            <view class="pile-right">
              <view :class="['pile-status', getStatusClass(pile.status)]">
                {{ getStatusText(pile.status) }}
              </view>
              <view class="pile-price">¥{{ pile.price }}/度</view>
            </view>
          </view>
        </view>

        <view v-if="filteredPiles.length === 0" class="empty-piles">
          <text>暂无充电桩</text>
        </view>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部操作 -->
    <view v-if="station" class="bottom-action">
      <view class="action-left">
        <view class="action-item" @click="handleFavorite">
          <text class="action-emoji">{{ isFavorite ? '⭐' : '☆' }}</text>
          <text>收藏</text>
        </view>
        <view class="action-item" @click="handleNavigation">
          <text class="action-emoji">🧭</text>
          <text>导航</text>
        </view>
      </view>
      <view class="btn-primary" @click="handleScan">
        扫码充电
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { stationApi, type Station, type Pile } from '@/api/station'
import { useUserStore } from '@/store/modules/user'
import { PILE_STATUS, PILE_STATUS_TEXT, PAGE_PATH } from '@/constants'
import { formatDistance, openNavigation, makePhoneCall } from '@/utils'

// Store
const userStore = useUserStore()

// 状态
const statusBarHeight = ref(0)
const navBarHeight = ref(0)
const stationId = ref(0)
const station = ref<Station | null>(null)
const piles = ref<Pile[]>([])
const loading = ref(false)
const pileFilter = ref('all')
const isFavorite = ref(false)

// 筛选后的充电桩
const filteredPiles = computed(() => {
  if (pileFilter.value === 'all') {
    return piles.value
  }
  return piles.value.filter((pile) => pile.type === pileFilter.value)
})

// 页面加载
onLoad((options) => {
  if (options?.id) {
    stationId.value = Number(options.id)
  }
})

onMounted(() => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navBarHeight.value = statusBarHeight.value + 44

  if (stationId.value) {
    fetchStationDetail()
    fetchStationPiles()
  }
})

// 返回上一页
function handleBack() {
  uni.navigateBack({ delta: 1 })
}

// 获取站点详情
async function fetchStationDetail() {
  loading.value = true
  try {
    station.value = await stationApi.getStationDetail(stationId.value)
  } catch (error) {
    uni.showToast({ title: '获取站点失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 获取充电桩列表
async function fetchStationPiles() {
  try {
    piles.value = await stationApi.getStationPiles(stationId.value)
  } catch (error) {
    console.error('获取充电桩失败', error)
  }
}

// 获取状态样式
function getStatusClass(status: number): string {
  switch (status) {
    case PILE_STATUS.FREE:
      return 'success'
    case PILE_STATUS.CHARGING:
      return 'warning'
    case PILE_STATUS.FAULT:
    case PILE_STATUS.OFFLINE:
      return 'danger'
    default:
      return ''
  }
}

// 获取状态文字
function getStatusText(status: number): string {
  return PILE_STATUS_TEXT[status] || '未知'
}

// 导航
function handleNavigation() {
  if (station.value) {
    openNavigation(
      station.value.latitude,
      station.value.longitude,
      station.value.name,
      station.value.address
    )
  }
}

// 拨打电话
function handleCall() {
  if (station.value?.tel) {
    makePhoneCall(station.value.tel)
  }
}

// 收藏
async function handleFavorite() {
  if (!userStore.checkLoginAndNavigate()) return

  try {
    if (isFavorite.value) {
      await stationApi.unfavoriteStation(stationId.value)
      isFavorite.value = false
      uni.showToast({ title: '已取消收藏', icon: 'success' })
    } else {
      await stationApi.favoriteStation(stationId.value)
      isFavorite.value = true
      uni.showToast({ title: '收藏成功', icon: 'success' })
    }
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// 选择充电桩
function handleSelectPile(pile: Pile) {
  if (pile.status !== PILE_STATUS.FREE) {
    uni.showToast({ title: '该充电桩不可用', icon: 'none' })
    return
  }

  if (!userStore.checkLoginAndNavigate()) return

  // 跳转到扫码页面，传递充电桩信息
  uni.navigateTo({
    url: `${PAGE_PATH.SCAN}?pileId=${pile.id}`,
  })
}

// 扫码充电
function handleScan() {
  if (!userStore.checkLoginAndNavigate()) return

  // #ifdef MP-WEIXIN
  uni.scanCode({
    onlyFromCamera: true,
    success: (res) => {
      uni.navigateTo({
        url: `${PAGE_PATH.SCAN}?code=${encodeURIComponent(res.result)}`,
      })
    },
    fail: () => {
      uni.showToast({ title: '扫码失败', icon: 'none' })
    },
  })
  // #endif

  // #ifdef H5
  uni.navigateTo({ url: PAGE_PATH.SCAN })
  // #endif
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #FAF9F7;
}

/* 导航栏 */
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

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  color: #999999;
}

.station-detail {
  height: 100vh;
  padding-bottom: 180rpx;
}

.station-header {
  background: #FFFFFF;
  margin-bottom: 24rpx;
}

.station-swiper {
  width: 100%;
  height: 400rpx;
}

.station-image {
  width: 100%;
  height: 100%;
}

.station-image-placeholder {
  width: 100%;
  height: 320rpx;
  background: linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.placeholder-icon {
  font-size: 80rpx;
}

.placeholder-text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.station-info {
  padding: 32rpx;
}

.info-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.station-name {
  font-size: 40rpx;
  font-weight: 600;
  color: #1A1A1A;
  flex: 1;
  line-height: 1.3;
}

.station-tags {
  display: flex;
  gap: 12rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.tag {
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  border-radius: 8rpx;
  font-weight: 500;
}

.tag-success {
  color: #5A8F7B;
  background: rgba(90, 143, 123, 0.1);
}

.tag-warning {
  color: #B8996F;
  background: rgba(184, 153, 111, 0.1);
}

.info-address,
.info-contact {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.info-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.address-text,
.contact-text {
  flex: 1;
  font-size: 28rpx;
  color: #666666;
}

.distance {
  font-size: 26rpx;
  color: #5A8F7B;
  font-weight: 500;
}

/* 充电桩区域 */
.pile-section {
  background: #FFFFFF;
  padding: 32rpx;
  border-radius: 24rpx 24rpx 0 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.pile-summary {
  display: flex;
  gap: 24rpx;
}

.summary-item {
  font-size: 24rpx;
  color: #999999;
}

.pile-filter {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.filter-item {
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  color: #666666;
  background: #F5F5F5;
  border-radius: 32rpx;
  transition: all 0.2s;
}

.filter-item.active {
  color: #FFFFFF;
  background: #1A1A1A;
}

.pile-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.pile-card {
  display: flex;
  align-items: center;
  padding: 28rpx;
  background: #FAFAFA;
  border-radius: 20rpx;
  transition: all 0.2s;
}

.pile-card:active {
  background: #F0F0F0;
  transform: scale(0.98);
}

.pile-card.disabled {
  opacity: 0.5;
}

.pile-icon {
  width: 88rpx;
  height: 88rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.pile-emoji {
  font-size: 40rpx;
}

.pile-info {
  flex: 1;
}

.pile-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8rpx;
}

.pile-meta {
  display: flex;
  gap: 16rpx;
}

.meta-type,
.meta-power {
  font-size: 24rpx;
  color: #999999;
}

.pile-right {
  text-align: right;
}

.pile-status {
  font-size: 24rpx;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.pile-status.success {
  color: #5A8F7B;
}

.pile-status.warning {
  color: #B8996F;
}

.pile-status.danger {
  color: #C4554A;
}

.pile-price {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.empty-piles {
  padding: 60rpx;
  text-align: center;
  color: #999999;
  font-size: 28rpx;
}

.bottom-space {
  height: 40rpx;
}

/* 底部操作栏 */
.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #FFFFFF;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-left {
  display: flex;
  gap: 40rpx;
  margin-right: 32rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 22rpx;
  color: #666666;
}

.action-emoji {
  font-size: 40rpx;
  margin-bottom: 4rpx;
}

.btn-primary {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1A1A1A;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  transition: all 0.2s;
}

.btn-primary:active {
  background: #333333;
  transform: scale(0.98);
}
</style>
