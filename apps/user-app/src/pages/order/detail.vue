<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @click="handleBack">
          <text class="iconfont icon-arrow-left"></text>
        </view>
        <text class="nav-title">订单详情</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <view v-if="loading" class="loading-wrap">
      <text>加载中...</text>
    </view>

    <view v-else-if="order" class="order-detail">
      <!-- 订单状态 -->
      <view :class="['status-card', getStatusClass(order.status)]">
        <view class="status-icon">
          <text class="iconfont" :class="getStatusIcon(order.status)"></text>
        </view>
        <view class="status-info">
          <text class="status-text">{{ getStatusText(order.status) }}</text>
          <text class="status-time" v-if="order.status === ORDER_STATUS.COMPLETED">
            {{ formatDate(order.endTime!) }}
          </text>
        </view>
      </view>

      <!-- 站点信息 -->
      <view class="info-card card">
        <view class="card-title">充电信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">充电站</text>
            <text class="info-value">{{ order.stationName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">充电桩</text>
            <text class="info-value">{{ order.pileName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">开始时间</text>
            <text class="info-value">{{ formatDate(order.startTime) }}</text>
          </view>
          <view class="info-item" v-if="order.endTime">
            <text class="info-label">结束时间</text>
            <text class="info-value">{{ formatDate(order.endTime) }}</text>
          </view>
          <view class="info-item" v-if="order.duration">
            <text class="info-label">充电时长</text>
            <text class="info-value">{{ formatDuration(order.duration) }}</text>
          </view>
          <view class="info-item" v-if="order.electricity">
            <text class="info-label">充电量</text>
            <text class="info-value">{{ order.electricity.toFixed(2) }} kWh</text>
          </view>
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="info-card card">
        <view class="card-title">费用明细</view>
        <view class="info-list">
          <view class="info-item" v-if="order.electricityFee">
            <text class="info-label">电费</text>
            <text class="info-value">¥{{ order.electricityFee.toFixed(2) }}</text>
          </view>
          <view class="info-item" v-if="order.serviceFee">
            <text class="info-label">服务费</text>
            <text class="info-value">¥{{ order.serviceFee.toFixed(2) }}</text>
          </view>
          <view class="info-item" v-if="order.parkingFee">
            <text class="info-label">停车费</text>
            <text class="info-value">¥{{ order.parkingFee.toFixed(2) }}</text>
          </view>
          <view class="info-item total">
            <text class="info-label">合计</text>
            <text class="info-value primary">¥{{ getOrderAmount().toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-card card">
        <view class="card-title">订单信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">订单编号</text>
            <view class="info-value-wrap">
              <text class="info-value">{{ order.orderNo }}</text>
              <text class="copy-btn" @click="handleCopy(order.orderNo)">复制</text>
            </view>
          </view>
          <view class="info-item">
            <text class="info-label">下单时间</text>
            <text class="info-value">{{ formatDate(order.createTime) }}</text>
          </view>
          <view class="info-item" v-if="order.payType">
            <text class="info-label">支付方式</text>
            <text class="info-value">{{ getPayTypeText(order.payType) }}</text>
          </view>
          <view class="info-item" v-if="order.payTime">
            <text class="info-label">支付时间</text>
            <text class="info-value">{{ formatDate(order.payTime) }}</text>
          </view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-action safe-area-bottom" v-if="order.status === ORDER_STATUS.PENDING">
        <view class="btn btn-outline" @click="handleCancel">取消订单</view>
        <view class="btn btn-primary" @click="handlePay">立即支付</view>
      </view>

      <view class="bottom-action safe-area-bottom" v-else-if="order.status === ORDER_STATUS.COMPLETED">
        <view class="btn btn-outline" @click="handleInvoice">开发票</view>
        <view class="btn btn-primary" @click="handleRecharge">再次充电</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { orderApi, type Order } from '@/api/order'
import { ORDER_STATUS, ORDER_STATUS_TEXT, PAGE_PATH } from '@/constants'
import { formatDate, formatDuration, copyToClipboard } from '@/utils'
import { useChargingStore } from '@/store/modules/charging'

// Store
const chargingStore = useChargingStore()

// 状态栏高度
const statusBarHeight = ref(0)

// 状态
const orderNo = ref('')
const order = ref<Order | null>(null)
const loading = ref(false)

// 获取状态栏高度
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
})

// 页面加载
onLoad((options) => {
  if (options?.orderNo) {
    orderNo.value = options.orderNo
  }
})

onMounted(() => {
  if (orderNo.value) {
    fetchOrderDetail()
  }
})

// 页面显示时刷新订单详情（特别是充电中的订单）
onShow(() => {
  if (orderNo.value) {
    fetchOrderDetail()
  }
})

// 获取订单金额（充电中的订单使用实时金额）
function getOrderAmount(): number {
  if (!order.value) return 0
  // 如果是充电中的订单，且订单ID匹配，使用实时金额
  if (order.value.status === ORDER_STATUS.CHARGING && chargingStore.isCharging && chargingStore.currentOrderId === order.value.orderNo) {
    return chargingStore.chargingAmount
  }
  return order.value.totalAmount
}

// 获取订单详情
async function fetchOrderDetail() {
  loading.value = true
  try {
    order.value = await orderApi.getOrderDetail(orderNo.value)
  } catch (error) {
    uni.showToast({ title: '获取订单失败', icon: 'none' })
  } finally {
    loading.value = false
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

// 获取状态图标
function getStatusIcon(status: number): string {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return 'icon-clock'
    case ORDER_STATUS.CHARGING:
      return 'icon-charging'
    case ORDER_STATUS.COMPLETED:
      return 'icon-check-circle'
    case ORDER_STATUS.CANCELLED:
      return 'icon-close-circle'
    default:
      return 'icon-info-circle'
  }
}

// 获取状态文字
function getStatusText(status: number): string {
  return ORDER_STATUS_TEXT[status] || '未知'
}

// 获取支付方式文字
function getPayTypeText(payType: string): string {
  const map: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    balance: '余额支付',
  }
  return map[payType] || payType
}

// 复制
function handleCopy(text: string) {
  copyToClipboard(text)
}

// 取消订单
function handleCancel() {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await orderApi.cancelOrder(orderNo.value)
          uni.showToast({ title: '取消成功', icon: 'success' })
          fetchOrderDetail()
        } catch (error) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    },
  })
}

// 支付
async function handlePay() {
  try {
    uni.showLoading({ title: '正在发起支付...' })
    const res = await orderApi.payOrder({
      orderNo: orderNo.value,
      payType: 'balance',
    })
    uni.hideLoading()

    if (res.success) {
      uni.showToast({ title: '支付成功', icon: 'success' })
      fetchOrderDetail()
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '支付失败', icon: 'none' })
  }
}

// 开发票
function handleInvoice() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 返回
function handleBack() {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      // 如果没有上一页，返回首页
      uni.switchTab({ url: PAGE_PATH.INDEX })
    },
  })
}

// 再次充电
function handleRecharge() {
  if (order.value) {
    uni.navigateTo({
      url: `${PAGE_PATH.STATION_DETAIL}?id=${order.value.stationId}`,
    })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: 150rpx;
}

.nav-bar {
  background-color: #FFFFFF;
  border-bottom: 1rpx solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;

  .back-btn,
  .placeholder {
    width: 80rpx;
  }

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    .iconfont {
      font-size: 40rpx;
      color: var(--text-primary);
    }
  }

  .nav-title {
    font-size: 34rpx;
    font-weight: bold;
    color: var(--text-primary);
  }
}

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  color: var(--text-placeholder);
}

.status-card {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  color: #FFFFFF;

  &.primary {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
  }

  &.warning {
    background: linear-gradient(135deg, #FF9800, #E65100);
  }

  &.success {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
  }

  &.gray {
    background: linear-gradient(135deg, #9E9E9E, #616161);
  }
}

.status-icon {
  width: 100rpx;
  height: 100rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;

  .iconfont {
    font-size: 50rpx;
  }
}

.status-info {
  .status-text {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 8rpx;
  }

  .status-time {
    font-size: 26rpx;
    opacity: 0.8;
  }
}

.info-card {
  margin: 24rpx;

  .card-title {
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid var(--border-color);
  }
}

.info-list {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;

    &.total {
      padding-top: 20rpx;
      margin-top: 10rpx;
      border-top: 1rpx solid var(--border-color);
    }
  }

  .info-label {
    font-size: 28rpx;
    color: var(--text-secondary);
  }

  .info-value {
    font-size: 28rpx;

    &.primary {
      color: var(--primary-color);
      font-size: 36rpx;
      font-weight: bold;
    }
  }

  .info-value-wrap {
    display: flex;
    align-items: center;
  }

  .copy-btn {
    margin-left: 16rpx;
    font-size: 24rpx;
    color: var(--primary-color);
    padding: 4rpx 16rpx;
    border: 1rpx solid var(--primary-color);
    border-radius: 16rpx;
  }
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
  background-color: #FFFFFF;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);

  .btn {
    flex: 1;
  }
}
</style>
