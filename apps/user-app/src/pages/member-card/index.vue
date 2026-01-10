<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar safe-top" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back touchable" @click="handleBack">
          <view class="icon icon-arrow-left icon-sm"></view>
        </view>
        <text class="nav-title">我的会员卡</text>
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
      <view v-if="loading && !memberCard" class="loading-wrap">
        <text>加载中...</text>
      </view>

      <view v-else-if="!memberCard" class="empty">
        <view class="icon icon-wallet icon-3xl empty-icon"></view>
        <text class="empty-title">暂无会员卡信息</text>
        <text class="empty-desc">请联系客服办理会员卡</text>
      </view>

      <view v-else class="card-section">
        <!-- 会员卡卡片 -->
        <view class="member-card" :class="cardTypeClass">
          <view class="card-background">
            <view class="card-header">
              <view class="card-type-tag">{{ memberCard.cardType }}</view>
              <view class="card-status" :class="{ 'status-active': memberCard.status === 1 }">
                {{ memberCard.status === 1 ? '正常' : '已禁用' }}
              </view>
            </view>
            <view class="card-body">
              <view class="card-balance-section">
                <text class="balance-label">卡余额</text>
                <text class="balance-value font-num">¥{{ memberCard.cardBalance }}</text>
              </view>
              <view class="card-info-section">
                <view class="info-item">
                  <text class="info-label">卡号</text>
                  <text class="info-value">{{ memberCard.memberCardNumber }}</text>
                </view>
                <view class="info-item" v-if="memberCard.holderName">
                  <text class="info-label">持卡人</text>
                  <text class="info-value">{{ memberCard.holderName }}</text>
                </view>
              </view>
            </view>
            <view class="card-footer">
              <view class="footer-item">
                <text class="footer-label">开卡日期</text>
                <text class="footer-value">{{ formatCardDate(memberCard.issueDate) }}</text>
              </view>
              <view class="footer-divider"></view>
              <view class="footer-item">
                <text class="footer-label">有效期至</text>
                <text class="footer-value" :class="{ 'expired': isExpired }">
                  {{ formatCardDate(memberCard.validUntil) || '永久有效' }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 购买充值会员年卡 -->
        <view v-if="memberCard.cardType !== '充值会员' || isExpired" class="member-upgrade-section">
          <view class="upgrade-card">
            <view class="upgrade-header">
              <view class="upgrade-icon">🎁</view>
              <view class="upgrade-info">
                <text class="upgrade-title">充值会员年卡</text>
                <text class="upgrade-desc">充值享受95折优惠</text>
              </view>
              <view class="upgrade-price">
                <text class="price-value">¥198</text>
                <text class="price-unit">/年</text>
              </view>
            </view>
            <view class="upgrade-benefits">
              <text class="benefit-item">✓ 充值享受95折优惠</text>
              <text class="benefit-item">✓ 有效期1年</text>
            </view>
            <view class="upgrade-btn" @click="handlePurchaseRechargeMember">
              <text>{{ memberCard.cardType === '充值会员' && isExpired ? '续费会员' : '立即购买' }}</text>
            </view>
          </view>
        </view>

        <!-- 消费记录 -->
        <view class="transaction-section">
          <view class="section-header">
            <text class="section-title">消费记录</text>
            <text class="section-count">共 {{ memberCard.transactionRecords.length }} 条</text>
          </view>

          <view v-if="memberCard.transactionRecords.length === 0" class="empty-records">
            <view class="icon icon-wallet icon-2xl empty-icon"></view>
            <text class="empty-text">暂无消费记录</text>
          </view>

          <view v-else class="transaction-list">
            <view
              v-for="(record, index) in memberCard.transactionRecords"
              :key="index"
              class="transaction-item slide-up"
              :style="{ animationDelay: `${index * 50}ms` }"
              @click="handleRecordClick(record)"
            >
              <view class="transaction-icon" :class="getTransactionTypeClass(record.transactionType)">
                <view class="icon" :class="getTransactionIcon(record.transactionType)" style="font-size: 40rpx;"></view>
              </view>
              <view class="transaction-content">
                <view class="transaction-header">
                  <text class="transaction-type">{{ record.transactionType }}</text>
                  <text class="transaction-amount" :class="{ 'amount-minus': isExpense(record.transactionType) }">
                    {{ isExpense(record.transactionType) ? '-' : '+' }}¥{{ record.transactionAmount }}
                  </text>
                </view>
                <view class="transaction-footer">
                  <text class="transaction-date">{{ record.transactionDate }}</text>
                  <text v-if="record.orderNo" class="transaction-order">订单号：{{ record.orderNo }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部留白 -->
        <view class="bottom-space"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { memberCardApi, type MemberCardDetail } from '@/api/memberCard'
import { PAGE_PATH } from '@/constants'

// 状态
const statusBarHeight = ref(0)
const navBarHeight = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const memberCard = ref<MemberCardDetail | null>(null)

// 计算属性
const cardTypeClass = computed(() => {
  if (!memberCard.value) return ''
  const type = memberCard.value.cardType
  if (type.includes('VIP') || type.includes('vip')) return 'card-vip'
  if (type.includes('季') || type.includes('年')) return 'card-season'
  return 'card-normal'
})

const isExpired = computed(() => {
  if (!memberCard.value?.validUntil || memberCard.value.validUntil === '永久有效') return false
  try {
    // 处理 YYYY/MM/DD 或 YYYY-MM-DD 格式
    const dateStr = memberCard.value.validUntil.replace(/\//g, '-')
    const validDate = new Date(dateStr)
    if (isNaN(validDate.getTime())) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    validDate.setHours(0, 0, 0, 0)
    return validDate < today
  } catch {
    return false
  }
})

// 初始化
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navBarHeight.value = statusBarHeight.value + 44
  fetchMemberCard()
})

onShow(() => {
  fetchMemberCard()
})

// 获取会员卡信息
async function fetchMemberCard() {
  if (loading.value) return
  loading.value = true
  try {
    memberCard.value = await memberCardApi.getMyMemberCard()
  } catch (error: any) {
    console.error('获取会员卡信息失败', error)
    uni.showToast({ title: error.message || '获取会员卡信息失败', icon: 'none' })
    memberCard.value = null
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
async function onRefresh() {
  refreshing.value = true
  await fetchMemberCard()
}

// 返回
function handleBack() {
  uni.navigateBack({ delta: 1 })
}

// 判断是否为支出
function isExpense(type: string): boolean {
  return type.includes('扣款') || type.includes('消费')
}

// 获取交易类型样式类
function getTransactionTypeClass(type: string): string {
  if (type.includes('扣款')) return 'type-expense'
  if (type.includes('充值')) return 'type-recharge'
  return 'type-other'
}

// 获取交易图标
function getTransactionIcon(type: string): string {
  if (type.includes('充电')) return 'icon-charging'
  if (type.includes('充值')) return 'icon-plus'
  if (type.includes('服务费')) return 'icon-settings'
  return 'icon-wallet'
}

// 格式化卡片日期显示
function formatCardDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    // 将 YYYY/MM/DD 或 YYYY-MM-DD 转换为 YYYY年MM月DD日
    const date = new Date(dateStr.replace(/\//g, '-'))
    if (isNaN(date.getTime())) return dateStr
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  } catch {
    return dateStr
  }
}

// 点击记录
function handleRecordClick(record: any) {
  if (record.orderNo) {
    uni.navigateTo({ url: `${PAGE_PATH.ORDER_DETAIL}?orderNo=${record.orderNo}` })
  }
}

// 购买充值会员年卡
async function handlePurchaseRechargeMember() {
  uni.showModal({
    title: '购买充值会员年卡',
    content: '充值会员年卡：¥198\n有效期：1年\n权益：充值享受95折优惠',
    confirmText: '立即购买',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '购买中...' })
          const result = await memberCardApi.purchaseRechargeMember()
          uni.hideLoading()
          
          if (result.success) {
            uni.showModal({
              title: '购买成功',
              content: result.message || '充值会员年卡已激活，有效期至 ' + result.validUntil,
              showCancel: false,
              success: () => {
                // 刷新会员卡信息
                fetchMemberCard()
              },
            })
          } else {
            uni.showToast({ title: result.message || '购买失败', icon: 'none' })
          }
        } catch (error: any) {
          uni.hideLoading()
          console.error('购买充值会员失败:', error)
          uni.showToast({ title: error.message || '购买失败，请重试', icon: 'none' })
        }
      }
    },
  })
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
  box-shadow: var(--shadow-sm);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 var(--space-4);
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--ink-05);
}

.nav-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.nav-placeholder {
  width: 64rpx;
}

.content {
  height: 100vh;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

// ==================== 会员卡卡片 ====================
.card-section {
  padding: var(--space-4);
}

.member-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--space-5);
  
  // 普通卡
  &.card-normal {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  // VIP卡
  &.card-vip {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  
  // 季卡/年卡
  &.card-season {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
}

.card-background {
  padding: var(--space-5);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300rpx;
    height: 300rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
  position: relative;
  z-index: 1;
}

.card-type-tag {
  padding: var(--space-1) var(--space-3);
  background: rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--paper);
  font-weight: var(--weight-medium);
  backdrop-filter: blur(10rpx);
}

.card-status {
  padding: var(--space-1) var(--space-3);
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.7);
  
  &.status-active {
    background: rgba(90, 143, 123, 0.3);
    color: var(--paper);
  }
}

.card-body {
  margin-bottom: var(--space-5);
  position: relative;
  z-index: 1;
}

.card-balance-section {
  margin-bottom: var(--space-4);
}

.balance-label {
  display: block;
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: var(--space-2);
}

.balance-value {
  font-size: 64rpx;
  font-weight: var(--weight-bold);
  color: var(--paper);
  letter-spacing: -2rpx;
}

.card-info-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.info-label {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.6);
  min-width: 80rpx;
}

.info-value {
  font-size: var(--text-sm);
  color: var(--paper);
  font-weight: var(--weight-medium);
  letter-spacing: 1rpx;
}

.card-footer {
  display: flex;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.footer-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.footer-label {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.6);
}

.footer-value {
  font-size: var(--text-sm);
  color: var(--paper);
  font-weight: var(--weight-medium);
  
  &.expired {
    color: #ff6b6b;
  }
}

.footer-divider {
  width: 1rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 var(--space-3);
}

// ==================== 购买充值会员 ====================
.member-upgrade-section {
  padding: 0 var(--space-4) var(--space-4);
}

.upgrade-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-lg);
}

.upgrade-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-4);
}

.upgrade-icon {
  font-size: 60rpx;
  margin-right: var(--space-3);
}

.upgrade-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.upgrade-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--paper);
  margin-bottom: var(--space-1);
}

.upgrade-desc {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.8);
}

.upgrade-price {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.price-value {
  font-size: 48rpx;
  font-weight: var(--weight-bold);
  color: var(--paper);
  font-variant-numeric: tabular-nums;
}

.price-unit {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.8);
}

.upgrade-benefits {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10rpx);
}

.benefit-item {
  font-size: var(--text-sm);
  color: var(--paper);
}

.upgrade-btn {
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--paper);
  color: #667eea;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  transition: all var(--duration-fast) var(--ease-out);
  
  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.9);
  }
}

// ==================== 消费记录 ====================
.transaction-section {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1rpx solid var(--border-light);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.section-count {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.empty-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-12) var(--space-4);
}

.empty-icon {
  color: var(--ink-15);
  margin-bottom: var(--space-3);
}

.empty-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  background: var(--ink-02);
  border-radius: var(--radius-lg);
  gap: var(--space-3);
  transition: all var(--duration-fast) var(--ease-out);
  
  &:active {
    background: var(--ink-05);
    transform: scale(0.98);
  }
}

.transaction-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &.type-expense {
    background: linear-gradient(135deg, rgba(196, 85, 74, 0.15) 0%, rgba(232, 133, 122, 0.15) 100%);
    
    .icon {
      color: var(--vermilion);
    }
  }
  
  &.type-recharge {
    background: linear-gradient(135deg, rgba(90, 143, 123, 0.15) 0%, rgba(125, 180, 160, 0.15) 100%);
    
    .icon {
      color: var(--jade);
    }
  }
  
  &.type-other {
    background: var(--ink-05);
    
    .icon {
      color: var(--text-secondary);
    }
  }
  
  .icon {
    opacity: 0.9;
  }
}

.transaction-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.transaction-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.transaction-type {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.transaction-amount {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--jade);
  font-variant-numeric: tabular-nums;
  
  &.amount-minus {
    color: var(--vermilion);
  }
}

.transaction-footer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.transaction-date {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.transaction-order {
  font-size: var(--text-xs);
  color: var(--text-placeholder);
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

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-4);
}

.empty-icon {
  color: var(--ink-15);
  margin-bottom: var(--space-4);
}

.empty-title {
  font-size: var(--text-lg);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.bottom-space {
  height: var(--space-8);
}
</style>
