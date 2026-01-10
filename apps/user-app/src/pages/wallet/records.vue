<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @click="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">钱包明细</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <!-- 选项卡 -->
    <view class="tabs" :style="{ top: navBarHeight + 'px' }">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'all' }"
        @click="switchTab('all')"
      >
        <text>全部</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'recharge' }"
        @click="switchTab('recharge')"
      >
        <text>充值</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'consume' }"
        @click="switchTab('consume')"
      >
        <text>消费</text>
      </view>
    </view>

    <scroll-view
      class="content"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- 加载中 -->
      <view v-if="loading && records.length === 0" class="loading-wrap">
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="records.length === 0" class="empty">
        <view class="empty-icon">📋</view>
        <text class="empty-title">暂无记录</text>
        <text class="empty-desc">还没有任何收支记录</text>
      </view>

      <!-- 记录列表 -->
      <view v-else class="record-list">
        <view
          v-for="(record, index) in records"
          :key="record.id"
          class="record-item"
        >
          <view class="record-left">
            <view class="record-icon" :class="getRecordIconClass(record.type)">
              <text>{{ getRecordIcon(record.type) }}</text>
            </view>
            <view class="record-info">
              <text class="record-title">{{ record.type }}</text>
              <text class="record-time">{{ formatDate(record.createTime, 'YYYY-MM-DD HH:mm') }}</text>
              <text v-if="record.orderNo" class="record-order">订单号：{{ record.orderNo }}</text>
            </view>
          </view>
          <view class="record-right">
            <text 
              class="record-amount" 
              :class="getAmountClass(record.type)"
            >
              {{ getAmountPrefix(record.type) }}¥{{ record.amount.toFixed(2) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && !loading" class="load-more">
        <text>加载更多...</text>
      </view>
      <view v-else-if="!hasMore && records.length > 0" class="load-more">
        <text>没有更多了</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { walletApi } from '@/api/wallet'
import { formatDate } from '@/utils'

interface Record {
  id: number
  orderNo?: string
  amount: number
  type: string
  createTime: string
}

// 状态
const statusBarHeight = ref(0)
const navBarHeight = ref(0)
const activeTab = ref<'all' | 'recharge' | 'consume'>('all')
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)

const rechargeRecords = ref<Record[]>([])
const consumeRecords = ref<Record[]>([])

// 计算显示的记录
const records = computed(() => {
  if (activeTab.value === 'recharge') {
    return rechargeRecords.value
  } else if (activeTab.value === 'consume') {
    return consumeRecords.value
  } else {
    // 全部：合并充值记录和消费记录，按时间倒序排列
    const all = [...rechargeRecords.value, ...consumeRecords.value]
    return all.sort((a, b) => {
      const timeA = new Date(a.createTime).getTime()
      const timeB = new Date(b.createTime).getTime()
      return timeB - timeA
    })
  }
})

// 初始化
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navBarHeight.value = statusBarHeight.value + 44
  fetchRecords()
})

onShow(() => {
  // 页面显示时刷新数据（仅在首次加载时）
  if (rechargeRecords.value.length === 0 && consumeRecords.value.length === 0) {
    fetchRecords()
  }
})

// 获取记录
async function fetchRecords(loadPage: number = 1, append: boolean = false) {
  if (loading.value) return
  loading.value = true

  try {
    // 获取充值记录和消费记录
    const [rechargeRes, consumeRes] = await Promise.all([
      walletApi.getRechargeRecords({ page: loadPage, pageSize: pageSize.value }),
      walletApi.getConsumeRecords({ page: loadPage, pageSize: pageSize.value }),
    ])

    const newRechargeRecords = rechargeRes.list.map((item: any) => ({
      id: item.id,
      orderNo: item.orderNo || `R${item.id}`,
      amount: item.amount || item.actualAmount || item.payAmount || 0, // 使用实际到账金额
      type: '充值',
      createTime: item.createTime || item.create_time || new Date().toISOString(),
    }))

    const newConsumeRecords = consumeRes.list.map((item: any) => ({
      id: item.id,
      orderNo: item.orderNo,
      amount: item.amount,
      type: item.type || '充电消费',
      createTime: item.createTime || item.create_time,
    }))

    if (append) {
      rechargeRecords.value.push(...newRechargeRecords)
      consumeRecords.value.push(...newConsumeRecords)
    } else {
      rechargeRecords.value = newRechargeRecords
      consumeRecords.value = newConsumeRecords
    }

    // 判断是否还有更多数据
    hasMore.value = rechargeRes.list.length >= pageSize.value || consumeRes.list.length >= pageSize.value
  } catch (error: any) {
    console.error('获取记录失败', error)
    uni.showToast({ title: error.message || '获取记录失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 切换标签
function switchTab(tab: 'all' | 'recharge' | 'consume') {
  activeTab.value = tab
  page.value = 1
  hasMore.value = true
  fetchRecords(1, false)
}

// 下拉刷新
async function onRefresh() {
  refreshing.value = true
  page.value = 1
  await fetchRecords(1, false)
}

// 加载更多
function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchRecords(page.value, true)
}

// 获取记录图标
function getRecordIcon(type: string): string {
  if (type === '充值') return '💳'
  if (type.includes('充电')) return '⚡'
  return '📝'
}

// 获取记录图标样式类
function getRecordIconClass(type: string): string {
  if (type === '充值') return 'icon-recharge'
  if (type.includes('充电')) return 'icon-consume'
  return 'icon-other'
}

// 获取金额前缀
function getAmountPrefix(type: string): string {
  return type === '充值' ? '+' : '-'
}

// 获取金额样式类
function getAmountClass(type: string): string {
  return type === '充值' ? 'amount-income' : 'amount-expense'
}

// 返回
function handleBack() {
  uni.navigateBack({ delta: 1 })
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

.tabs {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background: #FFFFFF;
  display: flex;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #F5F5F5;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  font-size: 28rpx;
  color: #999999;
  position: relative;

  &.active {
    color: #5A8F7B;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: #5A8F7B;
      border-radius: 2rpx;
    }
  }
}

.content {
  height: 100vh;
  padding-top: 264rpx;
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
  padding: 120rpx 32rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.5;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999999;
}

.record-list {
  padding: 0 32rpx;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
  background: #FFFFFF;
  margin-bottom: 16rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: 1;
  min-width: 0;
}

.record-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;

  &.icon-recharge {
    background: rgba(90, 143, 123, 0.1);
  }

  &.icon-consume {
    background: rgba(196, 85, 74, 0.1);
  }

  &.icon-other {
    background: rgba(153, 153, 153, 0.1);
  }
}

.record-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #1A1A1A;
}

.record-time {
  font-size: 24rpx;
  color: #999999;
}

.record-order {
  font-size: 22rpx;
  color: #CCCCCC;
}

.record-right {
  flex-shrink: 0;
}

.record-amount {
  font-size: 32rpx;
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  &.amount-income {
    color: #5A8F7B;
  }

  &.amount-expense {
    color: #1A1A1A;
  }
}

.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32rpx;
  font-size: 26rpx;
  color: #999999;
}

.bottom-space {
  height: 120rpx;
}
</style>
