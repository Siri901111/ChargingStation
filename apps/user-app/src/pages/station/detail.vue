<template>
  <view class="page">
    <view v-if="loading" class="loading-wrap">
      <text>加载中...</text>
    </view>

    <view v-else-if="station" class="station-detail">
      <!-- 站点头部 -->
      <view class="station-header">
        <swiper class="station-swiper" indicator-dots autoplay circular v-if="station.images?.length">
          <swiper-item v-for="(img, index) in station.images" :key="index">
            <image class="station-image" :src="img" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <view class="station-image-placeholder" v-else>
          <text class="iconfont icon-charging-station"></text>
        </view>

        <view class="station-info">
          <view class="info-main">
            <text class="station-name">{{ station.name }}</text>
            <view class="station-tags">
              <text class="tag tag-primary" v-if="station.fastFree > 0">快充空闲</text>
              <text class="tag tag-warning" v-if="station.slowFree > 0">慢充空闲</text>
            </view>
          </view>
          <view class="info-address" @click="handleNavigation">
            <text class="iconfont icon-location"></text>
            <text class="address-text">{{ station.address || station.city }}</text>
            <text class="distance" v-if="station.distance">{{ formatDistance(station.distance) }}</text>
          </view>
          <view class="info-contact" v-if="station.tel">
            <text class="iconfont icon-phone"></text>
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
              <text class="iconfont icon-charging-pile"></text>
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
      </view>

      <!-- 底部操作 -->
      <view class="bottom-action safe-area-bottom">
        <view class="action-left">
          <view class="action-item" @click="handleFavorite">
            <text :class="['iconfont', isFavorite ? 'icon-star-filled' : 'icon-star']"></text>
            <text>收藏</text>
          </view>
          <view class="action-item" @click="handleNavigation">
            <text class="iconfont icon-navigation"></text>
            <text>导航</text>
          </view>
        </view>
        <view class="btn btn-primary" @click="handleScan">
          扫码充电
        </view>
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
  if (stationId.value) {
    fetchStationDetail()
    fetchStationPiles()
  }
})

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
  background-color: var(--bg-color);
  padding-bottom: 150rpx;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  color: var(--text-placeholder);
}

.station-header {
  background-color: #FFFFFF;
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
  height: 400rpx;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  display: flex;
  align-items: center;
  justify-content: center;

  .iconfont {
    font-size: 150rpx;
    color: rgba(255, 255, 255, 0.3);
  }
}

.station-info {
  padding: 24rpx;
}

.info-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.station-name {
  font-size: 36rpx;
  font-weight: bold;
  flex: 1;
}

.station-tags {
  display: flex;
  gap: 12rpx;
}

.info-address,
.info-contact {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  .iconfont {
    font-size: 32rpx;
    color: var(--text-secondary);
    margin-right: 12rpx;
  }
}

.address-text,
.contact-text {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-secondary);
}

.distance {
  font-size: 26rpx;
  color: var(--primary-color);
}

.pile-section {
  margin-top: 20rpx;
  background-color: #FFFFFF;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
}

.pile-summary {
  display: flex;
  gap: 20rpx;
}

.summary-item {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.pile-filter {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.filter-item {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: var(--text-secondary);
  background-color: #F5F5F5;
  border-radius: 24rpx;

  &.active {
    color: #FFFFFF;
    background-color: var(--primary-color);
  }
}

.pile-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.pile-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #FAFAFA;
  border-radius: 16rpx;

  &.disabled {
    opacity: 0.6;
  }
}

.pile-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;

  .iconfont {
    font-size: 40rpx;
    color: var(--primary-color);
  }
}

.pile-info {
  flex: 1;
}

.pile-name {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.pile-meta {
  display: flex;
  gap: 16rpx;
}

.meta-type,
.meta-power {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.pile-right {
  text-align: right;
}

.pile-status {
  font-size: 24rpx;
  margin-bottom: 8rpx;

  &.success {
    color: var(--primary-color);
  }

  &.warning {
    color: var(--warning-color);
  }

  &.danger {
    color: var(--danger-color);
  }
}

.pile-price {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--primary-color);
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #FFFFFF;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-left {
  display: flex;
  gap: 40rpx;
  margin-right: 30rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 22rpx;
  color: var(--text-secondary);

  .iconfont {
    font-size: 40rpx;
    margin-bottom: 4rpx;
  }

  .icon-star-filled {
    color: var(--warning-color);
  }
}

.btn {
  flex: 1;
}
</style>
