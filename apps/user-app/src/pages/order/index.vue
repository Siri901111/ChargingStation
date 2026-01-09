<template>
  <view class="page">
    <!-- 标签栏 -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', { active: currentTab === tab.value }]"
        @click="handleTabChange(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view
      class="order-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view v-if="loading && orders.length === 0" class="loading-wrap">
        <text>加载中...</text>
      </view>

      <view v-else-if="orders.length === 0" class="empty">
        <image class="empty-icon" src="/static/empty/order.png" mode="aspectFit" />
        <text class="empty-text">暂无订单记录</text>
      </view>

      <view v-else>
        <view
          v-for="order in orders"
          :key="order.orderNo"
          class="order-card card"
          @click="goToDetail(order.orderNo)"
        >
          <view class="order-header">
            <view class="order-station">{{ order.stationName }}</view>
            <view :class="['order-status', getStatusClass(order.status)]">
              {{ getStatusText(order.status) }}
            </view>
          </view>

          <view class="order-body">
            <view class="order-info">
              <view class="info-row">
                <text class="info-label">充电桩</text>
                <text class="info-value">{{ order.pileName }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">充电时间</text>
                <text class="info-value">{{ formatDate(order.startTime) }}</text>
              </view>
              <view class="info-row" v-if="order.electricity">
                <text class="info-label">充电量</text>
                <text class="info-value">{{ order.electricity.toFixed(2) }} kWh</text>
              </view>
            </view>
            <view class="order-amount">
              <text class="amount-value">¥{{ order.totalAmount.toFixed(2) }}</text>
            </view>
          </view>

          <view class="order-footer" v-if="order.status === ORDER_STATUS.PENDING">
            <view class="btn btn-sm btn-outline" @click.stop="handleCancel(order.orderNo)">
              取消订单
            </view>
            <view class="btn btn-sm btn-primary" @click.stop="handlePay(order.orderNo)">
              立即支付
            </view>
          </view>
        </view>

        <view v-if="loading" class="loading-more">
          <text>加载中...</text>
        </view>

        <view v-if="finished && orders.length > 0" class="no-more">
          <text>没有更多了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { orderApi, type Order } from '@/api/order'
import { ORDER_STATUS, ORDER_STATUS_TEXT, PAGE_PATH } from '@/constants'
import { formatDate } from '@/utils'

// 标签选项
const tabs = [
  { label: '全部', value: -1 },
  { label: '待支付', value: ORDER_STATUS.PENDING },
  { label: '充电中', value: ORDER_STATUS.CHARGING },
  { label: '已完成', value: ORDER_STATUS.COMPLETED },
]

// 状态
const currentTab = ref(-1)
const orders = ref<Order[]>([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

// 初始化
onMounted(() => {
  fetchOrders()
})

onShow(() => {
  // 刷新订单列表
  onRefresh()
})

// 获取订单列表
async function fetchOrders(isRefresh = false) {
  if (loading.value) return

  loading.value = true
  try {
    const params = {
      status: currentTab.value === -1 ? undefined : currentTab.value,
      page: isRefresh ? 1 : page.value,
      pageSize,
    }

    const res = await orderApi.getOrderList(params)

    if (isRefresh) {
      orders.value = res.list
      page.value = 1
    } else {
      orders.value = [...orders.value, ...res.list]
    }

    finished.value = orders.value.length >= res.total
    page.value++
  } catch (error) {
    console.error('获取订单失败', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 切换标签
function handleTabChange(value: number) {
  if (currentTab.value === value) return
  currentTab.value = value
  orders.value = []
  page.value = 1
  finished.value = false
  fetchOrders(true)
}

// 下拉刷新
async function onRefresh() {
  refreshing.value = true
  finished.value = false
  await fetchOrders(true)
}

// 加载更多
function onLoadMore() {
  if (!finished.value && !loading.value) {
    fetchOrders()
  }
}

// 获取状态样式
function getStatusClass(status: number): string {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return 'warning'
    case ORDER_STATUS.CHARGING:
      return 'primary'
    case ORDER_STATUS.COMPLETED:
      return 'success'
    case ORDER_STATUS.CANCELLED:
    case ORDER_STATUS.REFUNDED:
      return 'gray'
    default:
      return ''
  }
}

// 获取状态文字
function getStatusText(status: number): string {
  return ORDER_STATUS_TEXT[status] || '未知'
}

// 跳转详情
function goToDetail(orderNo: string) {
  uni.navigateTo({ url: `${PAGE_PATH.ORDER_DETAIL}?orderNo=${orderNo}` })
}

// 取消订单
function handleCancel(orderNo: string) {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await orderApi.cancelOrder(orderNo)
          uni.showToast({ title: '取消成功', icon: 'success' })
          onRefresh()
        } catch (error) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    },
  })
}

// 支付订单
async function handlePay(orderNo: string) {
  try {
    uni.showLoading({ title: '正在发起支付...' })
    const res = await orderApi.payOrder({
      orderNo,
      payType: 'balance',
    })
    uni.hideLoading()

    if (res.success) {
      uni.showToast({ title: '支付成功', icon: 'success' })
      onRefresh()
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '支付失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-right: 25px !important;
}

.tabs {
  display: flex;
  background-color: #FFFFFF;
  padding: 0 24rpx;
  position: sticky;
  top: 0;
  width: 110%;
  z-index: 10;
}

.tab-item {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: var(--text-secondary);
  position: relative;

  &.active {
    color: var(--primary-color);
    font-weight: bold;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 6rpx;
      background-color: var(--primary-color);
      border-radius: 3rpx;
    }
  }
}

.order-list {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
}

.order-card {
  margin-bottom: 24rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid var(--border-color);
}

.order-station {
  font-size: 30rpx;
  font-weight: bold;
}

.order-status {
  font-size: 26rpx;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;

  &.primary {
    color: var(--primary-color);
    background-color: rgba(76, 175, 80, 0.1);
  }

  &.warning {
    color: var(--warning-color);
    background-color: rgba(255, 152, 0, 0.1);
  }

  &.success {
    color: var(--success-color);
    background-color: rgba(76, 175, 80, 0.1);
  }

  &.gray {
    color: var(--text-placeholder);
    background-color: #F5F5F5;
  }
}

.order-body {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
}

.order-info {
  flex: 1;
}

.info-row {
  display: flex;
  margin-bottom: 12rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  width: 140rpx;
  font-size: 26rpx;
  color: var(--text-secondary);
}

.info-value {
  font-size: 26rpx;
}

.order-amount {
  display: flex;
  align-items: center;
}

.amount-value {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--primary-color);
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid var(--border-color);
}

.loading-wrap,
.loading-more,
.no-more {
  display: flex;
  justify-content: center;
  padding: 40rpx;
  color: var(--text-placeholder);
  font-size: 26rpx;
}
</style>
