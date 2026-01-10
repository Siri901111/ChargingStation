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
        <text class="nav-title">公告详情</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view
      class="content"
      scroll-y
      enhanced
      :show-scrollbar="false"
      :style="{ paddingTop: navBarHeight + 'rpx' }"
    >
      <!-- 加载中 -->
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 公告详情 -->
      <view v-else-if="announcement" class="announcement-detail">
        <!-- 标题区域 -->
        <view class="detail-header">
          <view class="header-top">
            <view class="important-badge" :class="getImportantClass(announcement.important)">
              <text class="badge-dot"></text>
              <text class="badge-text">{{ getImportantText(announcement.important) }}</text>
            </view>
            <text class="header-time">{{ formatTime(announcement.createdAt) }}</text>
          </view>
          <text class="detail-title">{{ announcement.title || '系统公告' }}</text>
        </view>

        <!-- 富文本内容 -->
        <view class="detail-content-wrapper">
          <rich-text 
            class="detail-content" 
            :nodes="formatContent(announcement.content)"
          ></rich-text>
        </view>

        <!-- 底部时间信息 -->
        <view class="detail-footer">
          <view class="footer-divider"></view>
          <text class="footer-time">发布时间：{{ formatFullTime(announcement.createdAt) }}</text>
        </view>
      </view>

      <!-- 错误状态 -->
      <view v-else class="error-state">
        <view class="error-icon">⚠️</view>
        <text class="error-title">加载失败</text>
        <text class="error-desc">{{ errorMessage || '请稍后重试' }}</text>
        <button class="retry-btn" @click="loadDetail">重试</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { announcementApi, type AnnouncementDetailResponse } from '@/api/announcement'

const statusBarHeight = ref(0)
const navBarHeight = ref(0)
const loading = ref(false)
const announcement = ref<AnnouncementDetailResponse | null>(null)
const errorMessage = ref('')
const announcementId = ref<number>(0)

onLoad((options) => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  // 导航栏总高度 = 状态栏高度(px) + 44px（导航栏内容高度）
  // 转换为 rpx: 以 375px 设计稿为标准，1px = 2rpx
  const screenWidth = systemInfo.screenWidth || 375
  const rpxRatio = 750 / screenWidth // rpx 与 px 的转换比例
  navBarHeight.value = ((systemInfo.statusBarHeight || 0) + 44) * rpxRatio

  if (options.id) {
    announcementId.value = Number(options.id)
    loadDetail()
  } else {
    errorMessage.value = '公告ID无效'
  }
})

// 加载公告详情
const loadDetail = async () => {
  if (!announcementId.value) return

  try {
    loading.value = true
    errorMessage.value = ''
    const res = await announcementApi.getDetail(announcementId.value)

    if (res && res.id) {
      announcement.value = res
    } else {
      errorMessage.value = '加载失败'
    }
  } catch (error: any) {
    console.error('加载公告详情失败:', error)
    errorMessage.value = error.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
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

// 格式化时间（简短）
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (days === 0) {
    if (hours === 0) {
      return '今天'
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

// 格式化时间（完整）
const formatFullTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// 格式化富文本内容
const formatContent = (content: string) => {
  if (!content) return ''
  return content
}

// 返回
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #fff;
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
  box-sizing: border-box;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 40rpx;
  text-align: center;

  .error-icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
    opacity: 0.5;
  }

  .loading-text,
  .error-title {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 16rpx;
    font-weight: 500;
  }

  .error-desc {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 40rpx;
    line-height: 1.6;
  }

  .retry-btn {
    padding: 20rpx 48rpx;
    background: linear-gradient(135deg, #5a8f7b 0%, #6ba58e 100%);
    color: #fff;
    border-radius: 48rpx;
    font-size: 28rpx;
    border: none;
    box-shadow: 0 4rpx 12rpx rgba(90, 143, 123, 0.3);
  }
}

.announcement-detail {
  padding: 40rpx 32rpx;
  background: #fff;
  min-height: calc(100vh - 88rpx);
  box-sizing: border-box;

  .detail-header {
    margin-bottom: 40rpx;

    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24rpx;
      flex-wrap: wrap;
      gap: 16rpx;

      .important-badge {
        display: flex;
        align-items: center;
        gap: 12rpx;
        padding: 12rpx 24rpx;
        border-radius: 32rpx;
        font-size: 24rpx;
        font-weight: 500;
        flex-shrink: 0;

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

        .badge-dot {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }

        .badge-text {
          font-size: 24rpx;
        }
      }

      .header-time {
        font-size: 24rpx;
        color: #999;
        flex-shrink: 0;
      }
    }

    .detail-title {
      font-size: 44rpx;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.6;
      display: block;
      word-break: break-word;
    }
  }

  .detail-content-wrapper {
    margin-bottom: 40rpx;

    .detail-content {
      font-size: 32rpx;
      color: #333;
      line-height: 1.8;
      word-break: break-word;

      :deep(p) {
        margin-bottom: 24rpx;
        word-break: break-word;
      }

      :deep(img) {
        max-width: 100% !important;
        height: auto !important;
        border-radius: 16rpx;
        margin: 24rpx 0;
        display: block;
      }

      :deep(h1),
      :deep(h2),
      :deep(h3) {
        font-weight: 600;
        margin: 32rpx 0 24rpx;
        color: #1a1a1a;
        word-break: break-word;
      }

      :deep(h1) {
        font-size: 40rpx;
      }

      :deep(h2) {
        font-size: 36rpx;
      }

      :deep(h3) {
        font-size: 32rpx;
      }

      :deep(ul),
      :deep(ol) {
        padding-left: 40rpx;
        margin: 24rpx 0;
      }

      :deep(li) {
        margin-bottom: 16rpx;
        line-height: 1.8;
      }

      :deep(a) {
        color: #1890ff;
        text-decoration: underline;
        word-break: break-all;
      }

      :deep(blockquote) {
        padding: 16rpx 24rpx;
        margin: 24rpx 0;
        border-left: 4rpx solid #e5e5e5;
        background: #f5f5f5;
        border-radius: 8rpx;
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 24rpx 0;
      }

      :deep(th),
      :deep(td) {
        padding: 12rpx;
        border: 1rpx solid #e5e5e5;
        text-align: left;
      }

      :deep(th) {
        background: #f5f5f5;
        font-weight: 600;
      }
    }
  }

  .detail-footer {
    padding-top: 32rpx;
    border-top: 1rpx solid #f0f0f0;
    margin-top: 40rpx;

    .footer-divider {
      display: none;
    }

    .footer-time {
      font-size: 24rpx;
      color: #999;
      text-align: center;
      display: block;
    }
  }
}

.touchable {
  transition: opacity 0.2s;

  &:active {
    opacity: 0.7;
  }
}
</style>
