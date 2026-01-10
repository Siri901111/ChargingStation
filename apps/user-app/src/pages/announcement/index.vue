<template>
  <view class="page safe-area">
    <!-- 顶部状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-left touchable" @click="goBack">
          <text class="iconfont icon-arrow-left"></text>
        </view>
        <text class="nav-title">公告</text>
        <view class="nav-right"></view>
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
      @scrolltolower="loadMore"
      :style="{ paddingTop: navBarHeight + 40 + 'rpx' }"
    >
      <!-- 加载中 -->
      <view v-if="loading && announcementList.length === 0" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="announcementList.length === 0" class="empty-state">
        <view class="empty-icon">📢</view>
        <text class="empty-title">暂无公告</text>
        <text class="empty-desc">管理员还没有发布公告，请稍后再来查看</text>
      </view>

      <!-- 公告列表 -->
      <view v-else class="announcement-container">
        <view
          v-for="(item, index) in announcementList"
          :key="item.id"
          class="announcement-card touchable"
          :style="{ animationDelay: `${index * 50}ms` }"
          @click="goToDetail(item.id)"
        >
          <!-- 左侧重要标识 -->
          <view class="card-indicator" :class="getImportantClass(item.important)"></view>

          <!-- 卡片内容 -->
          <view class="card-content">
            <!-- 标题和时间 -->
            <view class="card-header">
              <text class="card-title">{{ item.title || '系统公告' }}</text>
              <view class="time-badge">
                <text class="time-icon">🕐</text>
                <text class="time-text">{{ formatTime(item.createdAt) }}</text>
              </view>
            </view>

            <!-- 内容预览 -->
            <text class="card-preview">{{ getPreview(item.content) }}</text>

            <!-- 底部操作 -->
            <view class="card-footer">
              <view class="important-tag" :class="getImportantClass(item.important)">
                <text class="tag-text">{{ getImportantText(item.important) }}</text>
              </view>
              <view class="arrow-icon">
                <text>›</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && !loading && announcementList.length > 0" class="load-more">
        <text class="load-more-text">加载更多...</text>
      </view>

      <!-- 没有更多 -->
      <view v-if="!hasMore && announcementList.length > 0" class="no-more">
        <text class="no-more-text">已显示全部公告</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { announcementApi, type AnnouncementItem } from '@/api/announcement'

const statusBarHeight = ref(0)
const navBarHeight = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const announcementList = ref<AnnouncementItem[]>([])

const hasMore = computed(() => {
  return announcementList.value.length < total.value
})

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  // 导航栏总高度 = 状态栏高度(px) + 44px（导航栏内容高度）
  // 转换为 rpx: 以 375px 设计稿为标准，1px = 2rpx
  const screenWidth = systemInfo.screenWidth || 375
  const rpxRatio = 750 / screenWidth // rpx 与 px 的转换比例
  navBarHeight.value = ((systemInfo.statusBarHeight || 0) + 44) * rpxRatio

  loadAnnouncementList()
})

// 加载公告列表
const loadAnnouncementList = async (reset = false) => {
  if (loading.value) return

  try {
    loading.value = true
    const currentPage = reset ? 1 : page.value
    const res = await announcementApi.getList({
      page: currentPage,
      pageSize: pageSize.value
    })

    if (res && res.list) {
      if (reset) {
        announcementList.value = res.list || []
        page.value = 1
      } else {
        announcementList.value = [...announcementList.value, ...(res.list || [])]
      }
      total.value = res.total || 0
      page.value = currentPage + 1
    }
  } catch (error) {
    console.error('加载公告列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  loadAnnouncementList(true)
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    loadAnnouncementList()
  }
}

// 获取重要程度样式类
const getImportantClass = (important: string) => {
  const classMap: Record<string, string> = {
    '一级': 'important-1',
    '二级': 'important-2',
    '三级': 'important-3',
    '四级': 'important-4'
  }
  return classMap[important] || 'important-4'
}

// 获取重要程度文本（用户友好）
const getImportantText = (important: string) => {
  const textMap: Record<string, string> = {
    '一级': '重要',
    '二级': '提醒',
    '三级': '通知',
    '四级': '普通'
  }
  return textMap[important] || '普通'
}

// 格式化时间（友好显示）
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (days === 0) {
    if (hours === 0) {
      if (minutes === 0) {
        return '刚刚'
      }
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    })
  }
}

// 获取内容预览（去除HTML标签）
const getPreview = (content: string) => {
  if (!content) return '暂无内容'
  const text = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return text.length > 80 ? text.substring(0, 80) + '...' : text
}

// 跳转到详情页
const goToDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/announcement/detail?id=${id}`
  })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f7fa;
}

.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 1000;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 999;
  border-bottom: 1rpx solid #f0f0f0;

  .nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 32rpx;

    .nav-left,
    .nav-right {
      width: 88rpx;
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .iconfont {
        font-size: 40rpx;
        color: #1a1a1a;
      }
    }

    .nav-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #1a1a1a;
      flex: 1;
      text-align: center;
    }
  }
}

.content {
  flex: 1;
  height: 100vh;
  padding: 60rpx 32rpx 24rpx;
  box-sizing: border-box;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 40rpx;
  text-align: center;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
    opacity: 0.3;
  }

  .loading-text,
  .empty-title {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 16rpx;
    font-weight: 500;
  }

  .empty-desc {
    font-size: 26rpx;
    color: #999;
    line-height: 1.6;
  }
}

.announcement-container {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.announcement-card {
  position: relative;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  animation: fadeInUp 0.4s ease-out forwards;
  opacity: 0;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  }

  // 左侧重要标识条
  .card-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6rpx;

    &.important-1 {
      background: linear-gradient(180deg, #ff4d4f 0%, #ff7875 100%);
    }

    &.important-2 {
      background: linear-gradient(180deg, #ff9800 0%, #ffb74d 100%);
    }

    &.important-3 {
      background: linear-gradient(180deg, #1890ff 0%, #40a9ff 100%);
    }

    &.important-4 {
      background: linear-gradient(180deg, #d9d9d9 0%, #f0f0f0 100%);
    }
  }

  .card-content {
    padding: 32rpx;
    padding-left: 40rpx;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20rpx;
    gap: 24rpx;

    .card-title {
      flex: 1;
      font-size: 32rpx;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .time-badge {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 8rpx 16rpx;
      background: #f5f7fa;
      border-radius: 20rpx;
      flex-shrink: 0;

      .time-icon {
        font-size: 24rpx;
      }

      .time-text {
        font-size: 22rpx;
        color: #666;
      }
    }
  }

  .card-preview {
    display: block;
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 24rpx;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;

    .important-tag {
      padding: 6rpx 16rpx;
      border-radius: 16rpx;
      font-size: 22rpx;
      font-weight: 500;

      &.important-1 {
        background: rgba(255, 77, 79, 0.1);
        color: #ff4d4f;
      }

      &.important-2 {
        background: rgba(255, 152, 0, 0.1);
        color: #ff9800;
      }

      &.important-3 {
        background: rgba(24, 144, 255, 0.1);
        color: #1890ff;
      }

      &.important-4 {
        background: #f5f5f5;
        color: #999;
      }

      .tag-text {
        font-size: 22rpx;
      }
    }

    .arrow-icon {
      font-size: 32rpx;
      color: #ccc;
      font-weight: 300;
    }
  }
}

.load-more,
.no-more {
  text-align: center;
  padding: 40rpx 0;

  .load-more-text,
  .no-more-text {
    font-size: 26rpx;
    color: #999;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.touchable {
  transition: opacity 0.2s;

  &:active {
    opacity: 0.7;
  }
}
</style>
